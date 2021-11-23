import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import { GrupoItemDE } from '../../../model/grupo-item';
import { DefinicaoEscopoService } from '../../../definicao-escopo.service';
import {
  ConfirmacaoCompraValorReferencia,
  GrupoItemPesquisaReferencia,
  GrupoItemPesquisaReferenciaPayload,
  Projeto,
} from '../../../model/grupo-item-pesquisa-referencia';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  defaultAtributoAtivo,
  getAtributos,
  GrupoItemPesquisaReferenciaPeriodo,
  grupoItemPesquisaReferenciaPeriodos,
} from './de-grupo-item-pesquisa.config';
import { debounceTime, map } from 'rxjs/operators';
import { GrupoItemValoresTag } from '../../../model/atualiza-valores-tag';
import { Entity } from '@aw-utils/types/entity';
import { trackByFactory } from '@aw-utils/track-by';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-de-grupo-item-pesquisa',
  templateUrl: './de-grupo-item-pesquisa.component.html',
  styleUrls: ['./de-grupo-item-pesquisa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeGrupoItemPesquisaComponent implements OnInit, OnDestroy {
  constructor(
    private definicaoEscopoService: DefinicaoEscopoService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input('grupoItem')
  set _grupoItem(grupoItem: GrupoItemDE) {
    this.grupoItem = grupoItem;
    if (grupoItem.pesquisaReferencia) {
      this.pesquisaReferencia = this.grupoItem.pesquisaReferencia;
      if (grupoItem.pesquisaReferencia.confirmacoesCompraValorReferencia.length && this.viewportHeight) {
        this.getHeight();
      }
    }
  }

  grupoItem: GrupoItemDE;
  pesquisaReferencia: GrupoItemPesquisaReferencia;
  formPesquisa: FormGroup;
  periodos = grupoItemPesquisaReferenciaPeriodos;
  subs: Subscription[] = [];
  search$: Observable<string>;
  projeto$: Observable<string>;

  atributosArr = [1, 2, 3, 4];

  @ViewChild('viewportHeight')
  viewportHeight: ElementRef<HTMLDivElement>;

  itemSize = 98;
  viewportSize = 392;

  BUDGET_URL = `${environment.centralizacao}projetos/web/printpagina/OpenReport.aspx?cce_id=`;

  trackByItem = trackByFactory<ConfirmacaoCompraValorReferencia>('idConfirmacaoCompraValorReferencia');
  trackByAtributo: TrackByFunction<number> = (index: number, numero: number) => numero;

  getHeight(): void {
    this.renderer.setStyle(this.viewportHeight.nativeElement, 'display', 'block');
    const items = this.grupoItem.pesquisaReferencia
      ? this.grupoItem.pesquisaReferencia.confirmacoesCompraValorReferencia
      : [];
    const colHeight = this.viewportHeight.nativeElement.querySelector<HTMLDivElement>('.height-col');
    colHeight.innerText = items.reduce((acc, item) => {
      return acc.length > item.descricaoGrupoItem.length ? acc : item.descricaoGrupoItem;
    }, '');
    const bound = colHeight.getBoundingClientRect().height;
    const itemSize = bound > 27 ? bound : 27;
    let newViewSize = this.viewportSize;
    while (newViewSize <= 392) {
      newViewSize += itemSize;
    }
    newViewSize -= itemSize;
    this.viewportSize = newViewSize;
    this.itemSize = itemSize;
    this.renderer.setStyle(this.viewportHeight.nativeElement, 'display', 'none');
    this.changeDetectorRef.markForCheck();
  }

  getDefaultPesquisa(attrAtivo: Entity<boolean> = {}): GrupoItemPesquisaReferenciaPayload {
    return {
      idOrcamentoGrupoItem: this.grupoItem.idOrcamentoGrupoItem,
      periodoPesquisa: (this.formPesquisa.get('periodo').value as GrupoItemPesquisaReferenciaPeriodo).periodo,
      idProjeto: null,
      pesquisarPorAtributosInformados: true,
      ...this.getAtributos(attrAtivo),
    };
  }

  getAtributos(attrAtivo: Entity<boolean> = {}): Entity<string> {
    const atributoAtivo = {
      ...this.pesquisaReferencia.atributoAtivo,
      ...attrAtivo,
    };
    return getAtributos(this.grupoItem, atributoAtivo);
  }

  pesquisaPeriodo({ periodo: periodoPesquisa }: GrupoItemPesquisaReferenciaPeriodo): void {
    this.definicaoEscopoService.setGrupoItemPesquisaReferenciaApi(
      this.grupoItem.idOrcamentoGrupoItem,
      {
        ...this.getDefaultPesquisa(),
        periodoPesquisa,
      },
      true
    );
  }

  pesquisaAtributo(atributo: number, action: 'add' | 'del'): void {
    const attrAtivo = { [atributo]: action === 'add' };
    this.definicaoEscopoService.setGrupoItemPesquisaReferenciaApi(
      this.grupoItem.idOrcamentoGrupoItem,
      this.getDefaultPesquisa(attrAtivo),
      true,
      attrAtivo
    );
  }

  initSub(): void {
    this.subs.push(
      this.formPesquisa.get('periodo').valueChanges.subscribe(value => {
        this.pesquisaPeriodo(value);
      })
    );
  }

  filterVoid = (atributos: number[]): number[] => {
    return atributos.filter(attr => !!this.grupoItem['atributo' + attr]);
  };

  copiarValor(payload: GrupoItemValoresTag): void {
    this.definicaoEscopoService.updateGrupoItemValoresTagApi(this.grupoItem.idOrcamentoGrupoItem, payload);
  }

  ngOnInit(): void {
    this.formPesquisa = this.formBuilder.group({
      search: null,
      projeto: null,
      periodo: this.periodos[0],
    });
    const { idOrcamentoGrupoItem } = this.grupoItem;
    const payload: GrupoItemPesquisaReferenciaPayload = {
      idOrcamentoGrupoItem,
      idProjeto: null,
      periodoPesquisa: +this.formPesquisa.get('periodo').value.periodo,
      pesquisarPorAtributosInformados: true,
      ...getAtributos(this.grupoItem, defaultAtributoAtivo),
    };
    this.definicaoEscopoService.setGrupoItemPesquisaReferenciaApi(idOrcamentoGrupoItem, payload);
    this.search$ = this.formPesquisa.get('search').valueChanges.pipe(debounceTime(400));
    this.projeto$ = this.formPesquisa
      .get('projeto')
      .valueChanges.pipe(map((projeto: Projeto) => (projeto ? '' + projeto.idProjeto : null)));
    this.initSub();
  }

  ngOnDestroy(): void {
    this.subs.forEach(o => o.unsubscribe());
  }
}
