import { Injectable } from '@angular/core';
import { AwModalService } from '@aw-services/core/aw-modal-service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import type { EpHistoricoComponent } from './ep-historico/ep-historico.component';

@Injectable({ providedIn: 'root' })
export class EqualizacaoPropostaModalService {
  constructor(private awModalService: AwModalService) {}

  async openHistorico(idOrcamentoGrupo: number): Promise<BsModalRef<EpHistoricoComponent>> {
    return this.awModalService.showLazy(
      () => import('./ep-historico/ep-historico.component').then(m => m.EpHistoricoComponent),
      {
        module: () => import('./ep-historico/ep-historico.module').then(m => m.EpHistoricoModule),
        initialState: { idOrcamentoGrupo },
        class: 'modal-lg',
      }
    );
  }
}
