import { Injectable } from '@angular/core';
import { ControleComprasStore } from './controle-compras.store';
import { CcGrupoService } from '../grupos/cc-grupo.service';
import { finalize, tap } from 'rxjs/operators';
import { CnGrupo, CnTipoGrupoEnum, KeyofCcGrupos } from '../../../models/cn-grupo';
import { CcSort } from '@aw-models/controle-compras/controle-compras.model';
import { AwFilterPipeType } from '@aw-components/aw-filter/aw-filter.pipe';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CnArea } from '../../../models/cn-area';
import { CnCausa } from '../../../models/cn-causa';
import { EmpresaFaturamento, EmpresaFaturamentoTipo } from '@aw-models/empresa-faturamento';
import { AwHttpParams } from '@aw-utils/http-params';
import { CnTipoFicha } from '../../../models/cn-tipo-ficha';
import { AwModalService } from '@aw-services/core/aw-modal-service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import type { CnAdicionarGruposComponent } from '../../cn-adicionar-grupos/cn-adicionar-grupos.component';
import type { CnEnderecoObraComponent } from '../../cn-endereco-obra/cn-endereco-obra.component';
import { LousaGrupo } from '../../../models/lousa-grupo';
import { LousaCabecalho } from '../../../models/lousa-cabecalho';
import type { CnGerenciarGruposComponent } from '../../cn-gerenciar-grupos/cn-gerenciar-grupos.component';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Injectable({ providedIn: 'root' })
export class ControleComprasService {
  constructor(
    private controleComprasStore: ControleComprasStore,
    private ccGruposService: CcGrupoService,
    private http: HttpClient,
    private awModalService: AwModalService,
    private projetoService: ProjetoService
  ) {}

  private target = environment.AwApiUrl + 'compras-negociacao';

  lastIdOrcamentoCenario: number;

  reset(): void {
    this.controleComprasStore.reset();
  }

  collapseDireto(collapse: boolean, idOrcamentoCenario: number): Observable<CnGrupo[]> {
    let request$ = of([]);
    if (!collapse) {
      this.controleComprasStore.update({ loaderDireto: true });
      request$ = this.ccGruposService.setGrupos(idOrcamentoCenario, CnTipoGrupoEnum.Direto).pipe(
        finalize(() => {
          this.controleComprasStore.update({
            collapseDireto: collapse,
            loaderDireto: false,
          });
        })
      );
    } else {
      this.controleComprasStore.update({ collapseDireto: collapse });
    }
    return request$;
  }

  collapseRefaturado(collapse: boolean, idOrcamentoCenario: number): Observable<CnGrupo[]> {
    let request$ = of([]);
    if (!collapse) {
      this.controleComprasStore.update({ loaderRefaturado: true });
      request$ = this.ccGruposService.setGrupos(idOrcamentoCenario, CnTipoGrupoEnum.Refaturado).pipe(
        finalize(() => {
          this.controleComprasStore.update({
            collapseRefaturado: collapse,
            loaderRefaturado: false,
          });
        })
      );
    } else {
      this.controleComprasStore.update({ collapseRefaturado: collapse });
    }
    return request$;
  }

  updateSort(tipo: CnTipoGrupoEnum, sort: CcSort): void {
    this.controleComprasStore.update(state => ({
      ...state,
      sortModel: {
        ...state.sortModel,
        [tipo]: sort,
      },
    }));
  }

  updateFilter(tipo: CnTipoGrupoEnum, property: KeyofCcGrupos, filter: AwFilterPipeType | null): void {
    this.controleComprasStore.update(state => ({
      ...state,
      filterModel: {
        ...state.filterModel,
        [tipo]: {
          ...(state.filterModel?.[tipo] ?? {}),
          [property]: filter,
        },
      },
    }));
  }

  getAreas(): Observable<CnArea[]> {
    const areas = this.controleComprasStore.getValue()?.listaAreas;
    return areas?.length
      ? of(areas)
      : this.http.get<CnArea[]>(`${this.target}/ficha-areas`).pipe(
          tap(listaAreas => {
            this.controleComprasStore.update({ listaAreas });
          })
        );
  }

  getCausas(compraNegociacao?: boolean): Observable<CnCausa[]> {
    const params = new AwHttpParams({ compraNegociacao }, true);
    return this.http.get<CnCausa[]>(`${this.target}/ficha-causas`, { params }).pipe(
      tap(listaCausas => {
        this.controleComprasStore.update({ listaCausas });
      })
    );
  }
  getCausasDispensa(idFichaArea: number): Observable<CnCausa[]> {
    return this.http.get<CnCausa[]>(`${this.target}/ficha-areas/${idFichaArea}/ficha-causas`).pipe(
      tap(listaCausasDispensa => {
        this.controleComprasStore.update({ listaCausasDispensa });
      })
    );
  }
  updateFilterGrupos(filterGrupos: number[]): void {
    this.controleComprasStore.update({ filterGrupos });
  }

  getEmpresasFaturamento(
    idProjeto: number,
    tipo: CnTipoGrupoEnum | EmpresaFaturamentoTipo = CnTipoGrupoEnum.Direto
  ): Observable<EmpresaFaturamento[]> {
    return this.projetoService.getEmpresasFaturamento(idProjeto, tipo.toLowerCase() as EmpresaFaturamentoTipo).pipe(
      tap(listaEmpresaFaturamento => {
        this.controleComprasStore.update({ listaEmpresaFaturamento });
      })
    );
  }

  resetCollapses(): void {
    this.controleComprasStore.update({ collapseDireto: true, collapseRefaturado: true });
  }

  getTiposFicha(): Observable<CnTipoFicha[]> {
    return this.http.get<CnTipoFicha[]>(`${this.target}/tipos-ficha`).pipe(
      tap(tiposFicha => {
        this.controleComprasStore.update({ tiposFicha });
      })
    );
  }

  getLousaGrupos(idOrcamentoCenario: number): Observable<LousaGrupo[]> {
    return this.http.get<LousaGrupo[]>(`${this.target}/orcamento-cenarios/${idOrcamentoCenario}/lousa/grupos`);
  }

  getLousaCabecalho(idOrcamentoCenario: number): Observable<LousaCabecalho[]> {
    return this.http.get<LousaCabecalho[]>(`${this.target}/orcamento-cenarios/${idOrcamentoCenario}/lousa/cabecalho`);
  }

  async openAdicionarGrupos(
    idOrcamento: number,
    idOrcamentoCenario: number,
    idPlanoCompra: number
  ): Promise<BsModalRef<CnAdicionarGruposComponent>> {
    return this.awModalService.showLazy(
      () => import('../../cn-adicionar-grupos/cn-adicionar-grupos.component').then(m => m.CnAdicionarGruposComponent),
      {
        ignoreBackdropClick: true,
        initialState: { idOrcamentoCenario, idOrcamento, idPlanoCompra },
        class: 'modal-xl',
        module: () =>
          import('../../cn-adicionar-grupos/cn-adicionar-grupos.module').then(m => m.CnAdicionarGruposModule),
      }
    );
  }

  async openEnderecoObraModal(idProjeto: number): Promise<BsModalRef<CnEnderecoObraComponent>> {
    return this.awModalService.showLazy(
      () => import('../../cn-endereco-obra/cn-endereco-obra.component').then(m => m.CnEnderecoObraComponent),
      {
        ignoreBackdropClick: true,
        initialState: { idProjeto },
        class: 'modal-xl',
        module: () => import('../../cn-endereco-obra/cn-endereco-obra.module').then(m => m.CnEnderecoObraModule),
      }
    );
  }

  async openGerenciarGrupos(
    idOrcamentoCenario: number,
    idCompraNegociacao: number
  ): Promise<BsModalRef<CnGerenciarGruposComponent>> {
    return this.awModalService.showLazy(
      () => import('../../cn-gerenciar-grupos/cn-gerenciar-grupos.component').then(m => m.CnGerenciarGruposComponent),
      {
        ignoreBackdropClick: true,
        initialState: { idOrcamentoCenario, idCompraNegociacao },
        class: 'modal-xl',
        module: () =>
          import('../../cn-gerenciar-grupos/cn-gerenciar-grupos.module').then(m => m.CnGerenciarGruposModule),
      }
    );
  }
}
