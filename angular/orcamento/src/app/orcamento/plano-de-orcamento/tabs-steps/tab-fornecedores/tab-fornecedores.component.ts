import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Familia, Fornecedor, Grupo } from '../../../../models';
import { finalize, map } from 'rxjs/operators';
import { FornecedorService } from '@aw-services/orcamento/fornecedor.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModalFornecedoresComponent } from './modal-fornecedores/modal-fornecedores.component';
import { MaskEnum } from '@aw-models/mask.enum';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { Entity } from '@aw-utils/types/entity';
import { TipoGrupoEnum } from '@aw-models/tipo-grupo.enum';
import { trackByFactory } from '@aw-utils/track-by';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';

@Component({
  selector: 'app-tab-fornecedores',
  templateUrl: './tab-fornecedores.component.html',
  styleUrls: ['./tab-fornecedores.component.scss'],
})
export class TabFornecedoresComponent implements OnInit {
  constructor(
    private router: Router,
    private orcamentoService: OrcamentoService,
    private fornecedorService: FornecedorService,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute
  ) {}

  get idOrcamento(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  }

  get idOrcamentoCenario(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  }

  familias$: Observable<Familia[]> = this.orcamentoService.familias$.pipe(
    map(familias => {
      return familias
        .map(fam => {
          return {
            ...fam,
            grupoes: fam.grupoes.map(grupao => {
              return {
                ...grupao,
                grupos: grupao.grupos.map(grupo => {
                  return {
                    ...grupo,
                    fornecedores: grupo.fornecedores.filter(fornecedor => !fornecedor.fornecedorInterno),
                  };
                }),
              };
            }),
          };
        })
        .filter(f => f.grupoes && f.grupoes.length);
    })
  );

  collapses: Entity<boolean> = {
    isOpen_0: true,
  };
  orderByCodigo = orderByCodigo<Grupo>('codigoGrupo');

  maskEnum = MaskEnum;
  tipoGrupoEnum = TipoGrupoEnum;
  loading$ = this.orcamentoService.familiasLoading$.asObservable();

  private _saveLoading$ = new BehaviorSubject<boolean>(false);
  saveLoading$ = this._saveLoading$.asObservable();
  trackByFamilia = trackByFactory<Familia>('idFamilia');
  trackByGrupo = trackByFactory<Grupo>('idGrupo');
  trackByFornecedor = trackByFactory<Fornecedor>('idFornecedor');

  @HostBinding('class.tab-pane') tab = true;

  @HostBinding('class.active')
  get url(): boolean {
    return this.router.url.includes('fornecedores');
  }

  ngOnInit(): void {
    this.familias$ = this.orcamentoService.alterarModoVisualizacao();
  }

  openFornecedoresModal(grupo: Grupo): void {
    this.modalService.show(ModalFornecedoresComponent, {
      class: 'modal-lg modal-fornecedores',
      ignoreBackdropClick: true,
      initialState: { grupo, idOrcamentoCenario: this.idOrcamentoCenario },
    });
  }

  setFav(idOrcamentoGrupo: number, idGrupo: number, fornecedor: Fornecedor): void {
    this._saveLoading$.next(true);
    fornecedor.favorito = !fornecedor.favorito;
    this.fornecedorService
      .updateFornecedorGrupo(this.idOrcamento, idGrupo, idOrcamentoGrupo, fornecedor)
      .pipe(finalize(() => this._saveLoading$.next(false)))
      .subscribe();
  }
}
