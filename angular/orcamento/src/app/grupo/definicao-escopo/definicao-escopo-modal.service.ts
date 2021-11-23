import { Injectable } from '@angular/core';
import { TipoGrupoEnum } from '@aw-models/tipo-grupo.enum';
import { GrupoAlt, OrcamentoCenarioPadrao } from '../../models';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { LazyFn } from '@aw-services/core/dynamic-loader.service';
import { AwModalService } from '@aw-services/core/aw-modal-service';
import type { DefinicaoEscopoComponent } from './definicao-escopo.component';
import type { DefinicaoEscopoLojaInsumoComponent } from '../definicao-escopo-loja-insumo/definicao-escopo-loja-insumo.component';
import type { DefinicaoEscopoLojaInsumoKitComponent } from '../definicao-escopo-loja-insumo-kit/definicao-escopo-loja-insumo-kit.component';
import type { DefinicaoEscopoGrupoTecnicoComponent } from '../definicao-escopo-grupo-tecnico/definicao-escopo-grupo-tecnico.component';

@Injectable({
  providedIn: 'root',
})
export class DefinicaoEscopoModalService {
  constructor(private awModalService: AwModalService) {}

  async openModalDefinicaoEscopo(
    idProjeto: number,
    grupo: GrupoAlt,
    cenarioPadrao: OrcamentoCenarioPadrao,
    idOrcamentoCenario: number,
    reenvio: boolean,
    idOrcamentoGrupoItemAtual?: number,
    isControleCompras = false
  ): Promise<
    BsModalRef<
      | DefinicaoEscopoComponent
      | DefinicaoEscopoLojaInsumoComponent
      | DefinicaoEscopoLojaInsumoKitComponent
      | DefinicaoEscopoGrupoTecnicoComponent
    >
  > {
    let component: LazyFn<
      | DefinicaoEscopoComponent
      | DefinicaoEscopoLojaInsumoComponent
      | DefinicaoEscopoLojaInsumoKitComponent
      | DefinicaoEscopoGrupoTecnicoComponent
    >;
    let module: LazyFn;
    let clazz: string;
    switch (grupo.idTipoGrupo) {
      case TipoGrupoEnum.Atributo: {
        module = () => import('../definicao-escopo/definicao-escopo.module').then(m => m.DefinicaoEscopoModule);
        component = () =>
          import('../definicao-escopo/definicao-escopo.component').then(c => c.DefinicaoEscopoComponent);
        clazz = 'modal-definir-escopo';
        break;
      }
      case TipoGrupoEnum.Insumo: {
        module = () =>
          import('../definicao-escopo-loja-insumo/definicao-escopo-loja-insumo.module').then(
            m => m.DefinicaoEscopoLojaInsumoModule
          );

        component = () =>
          import('../definicao-escopo-loja-insumo/definicao-escopo-loja-insumo.component').then(
            c => c.DefinicaoEscopoLojaInsumoComponent
          );
        clazz = 'modal-definir-escopo-loja-insumo';
        break;
      }
      case TipoGrupoEnum.InsumoKit: {
        module = () =>
          import('../definicao-escopo-loja-insumo-kit/definicao-escopo-loja-insumo-kit.module').then(
            m => m.DefinicaoEscopoLojaInsumoKitModule
          );
        component = () =>
          import('../definicao-escopo-loja-insumo-kit/definicao-escopo-loja-insumo-kit.component').then(
            c => c.DefinicaoEscopoLojaInsumoKitComponent
          );
        clazz = 'modal-definir-escopo-loja-insumo-kit';
        break;
      }
      case TipoGrupoEnum.Tecnico: {
        module = () =>
          import('../definicao-escopo-grupo-tecnico/definicao-escopo-grupo-tecnico.module').then(
            m => m.DefinicaoEscopoGrupoTecnicoModule
          );

        component = () =>
          import('../definicao-escopo-grupo-tecnico/definicao-escopo-grupo-tecnico.component').then(
            c => c.DefinicaoEscopoGrupoTecnicoComponent
          );
        clazz = 'modal-definir-escopo-grupo-tecnico';
        break;
      }
      default: {
        throw new Error(`Definição para idTipoGrupo = ${grupo.idTipoGrupo} não implementada!`);
      }
    }
    return this.awModalService.showLazy(component, {
      class: 'modal-xxl ' + clazz,
      initialState: {
        grupo,
        cenarioPadrao,
        reenvio,
        idOrcamentoGrupoItemAtual,
        idOrcamentoCenario,
        isControleCompras,
        idProjeto,
      },
      ignoreBackdropClick: true,
      module,
    });
  }
}
