import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GrupoItemDE } from '../model/grupo-item';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { DefinicaoEscopoState } from '../state/definicao-escopo.state';
import { DefinicaoEscopoService } from '../definicao-escopo.service';
import { isNil } from 'lodash-es';
import { delay, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Fornecedor } from '../../../models';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { trackByFactory } from '@aw-utils/track-by';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { AwSelectFooterOptions } from '@aw-components/aw-select/aw-select.type';

@Component({
  selector: 'app-de-grupo-item',
  templateUrl: './de-grupo-item.component.html',
  styleUrls: ['./de-grupo-item.component.scss'],
  animations: [fadeOutAnimation(), collapseAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeGrupoItemComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(private store: Store, public definicaoEscopoService: DefinicaoEscopoService) {}

  private _destroy$ = new Subject<void>();

  @ViewChild('tooltipRef') tooltipRef: TooltipDirective;
  @ViewChild('grupoItemRef') grupoItemRef: ElementRef<HTMLDivElement>;

  @Input('grupoItem')
  set _grupoItem(grupoItem: GrupoItemDE) {
    this.grupoItem = grupoItem;
    this.idOrcamentoGrupoItem$.next(grupoItem.idOrcamentoGrupoItem);
  }
  grupoItem: GrupoItemDE;

  idOrcamentoGrupoItem$ = new BehaviorSubject<number>(0);

  total$ = this.idOrcamentoGrupoItem$.pipe(
    distinctUntilChanged(),
    switchMap(idOrcamentoGrupoItem => this.store.select(DefinicaoEscopoState.getGrupoItemTotal(idOrcamentoGrupoItem)))
  );
  atributos$ = this.idOrcamentoGrupoItem$.pipe(
    distinctUntilChanged(),
    switchMap(idOrcamentoGrupoItem =>
      this.store.select(DefinicaoEscopoState.getGrupoItemAtributos(idOrcamentoGrupoItem))
    )
  );

  @Input() index: number;

  @Select(DefinicaoEscopoState.getFornecedores)
  fornecedores$: Observable<Fornecedor[]>;

  @Select(DefinicaoEscopoState.getLoadingFornecedores)
  loadingFornecedores$: Observable<boolean>;

  trackByString = trackByFactory<string>();

  modelOptions: {
    name?: string;
    standalone?: boolean;
    updateOn?: 'change' | 'blur' | 'submit';
  } = { updateOn: 'blur' };

  footerOptions: AwSelectFooterOptions = { primaryBtn: { title: 'Todos' }, secondaryBtn: { title: 'Limpar' } };

  trackByFornecedor = trackByFactory<Fornecedor>('idFornecedor');

  @Select(DefinicaoEscopoState.getGruposItens)
  _gruposItens$: Observable<GrupoItemDE[]>;
  gruposItens$: Observable<GrupoItemDE[]>;

  handleTag(tag: string): void {
    if (isNil(tag)) return;
    this.definicaoEscopoService.updateGrupoItemValoresTagApi(this.grupoItem.idOrcamentoGrupoItem, { tag });
  }

  handleValores(valor: number, tipo: 'valorUnitarioServicoReferencia' | 'valorUnitarioProdutoReferencia'): void {
    if (isNil(valor)) return;
    this.definicaoEscopoService.updateGrupoItemValoresTagApi(this.grupoItem.idOrcamentoGrupoItem, { [tipo]: valor });
  }

  handleAtivo(ativo: boolean): void {
    if (ativo) {
      const { descricaoGrupoItem, idGrupoItem, idUnidade, numeracaoGrupoItem, numeracao, classificacao } =
        this.grupoItem;
      this.definicaoEscopoService.incluirGrupoItemApi(
        {
          complemento: '',
          descricaoGrupoItem,
          idGrupoItem,
          idOrcamentoGrupo: this.definicaoEscopoService.grupo.idOrcamentoGrupo,
          idOrcamentoGrupoItem: 0,
          idOrcamentoGrupoItemPai: 0,
          idUnidade,
          numeracaoGrupoItem: numeracaoGrupoItem || numeracao,
          orcamentoGrupoItemQuantitativo: [],
          tag: '',
          valorUnitarioProdutoReferencia: 0,
          valorUnitarioServicoReferencia: 0,
          classificacao,
        },
        this.grupoItem.idGrupoItem
      );
    } else {
      this.definicaoEscopoService.excluirGrupoItemApi(this.grupoItem.idOrcamentoGrupoItem);
    }
  }

  handleFornecedor(idsFornecedores: number[]): void {
    this.definicaoEscopoService.updateFornecedorApi(this.grupoItem.idOrcamentoGrupoItem, idsFornecedores);
  }

  ngOnInit(): void {
    this.gruposItens$ = this._gruposItens$.pipe(delay(0));
  }

  ngAfterViewInit(): void {
    this.idOrcamentoGrupoItem$
      .pipe(
        distinctUntilChanged(),
        switchMap(idOrcamentoGrupoItem => this.definicaoEscopoService.selectScrollIntoView(idOrcamentoGrupoItem))
      )
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.grupoItemRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
