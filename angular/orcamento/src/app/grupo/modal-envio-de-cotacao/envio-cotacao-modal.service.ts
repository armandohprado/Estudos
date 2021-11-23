import { Injectable } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { GrupoAlt, isAwReferencia } from '../../models';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import { TipoGrupoEnum } from '@aw-models/tipo-grupo.enum';
import { Observable } from 'rxjs';
import { AwModalService } from '@aw-services/core/aw-modal-service';

export interface EnvioCotacaoModalConfig {
  grupo: GrupoAlt;
  idProjeto: number;
  idOrcamento: number;
  idOrcamentoCenario: number;
  reenvio: boolean;
  idFornecedorAtual?: number;
  aditionalRequests$?: Observable<any>;
  isControleCompras?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EnvioCotacaoModalService {
  constructor(private envioDeCotacaoService: EnvioDeCotacaoService, private awModalService: AwModalService) {}

  async showModal(config: EnvioCotacaoModalConfig): Promise<BsModalRef> {
    if (
      !['270.026'].includes(config.grupo.codigoGrupo) &&
      !isAwReferencia(config.grupo.nomeGrupo) &&
      [TipoGrupoEnum.Loja, TipoGrupoEnum.Insumo, TipoGrupoEnum.InsumoKit].includes(config.grupo.idTipoGrupo)
    ) {
      return this.envioDeCotacaoService.openEnviarCotacaoLoja(
        config.idProjeto,
        config.idOrcamento,
        config.grupo,
        config.reenvio,
        config.idFornecedorAtual,
        config.aditionalRequests$,
        config.isControleCompras
      );
    } else {
      this.envioDeCotacaoService.changeStep(0);
      return this.awModalService.showLazy(
        () => import('./envio-cotacao.component').then(c => c.EnvioCotacaoComponent),
        {
          class: 'modal-lg modal-envio-cotacao',
          initialState: config,
          ignoreBackdropClick: true,
          module: () => import('./envio-cotacao.module').then(m => m.EnvioCotacaoModule),
        }
      );
    }
  }
}
