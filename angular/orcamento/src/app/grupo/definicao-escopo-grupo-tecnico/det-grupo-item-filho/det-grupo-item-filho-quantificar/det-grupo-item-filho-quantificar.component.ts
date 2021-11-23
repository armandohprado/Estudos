import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
// tslint:disable-next-line:max-line-length
import { Subject } from 'rxjs';
import { DefinicaoEscopoGrupoTecnicoService } from '../../definicao-escopo-grupo-tecnico.service';
import { AtualizacaoCentroCustoEvent } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/atualizacao-centro-custo-event';
import { Quantitativo } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';
import { DistribuirQuantitativoAmbienteEvent } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/de-distribuir-quantitativo.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DetGrupoItemFilhoAmbientesModalComponent } from '../det-grupo-item-filho-ambientes-modal/det-grupo-item-filho-ambientes-modal.component';
import { GrupoItemTecnicoFilho } from '../../models/grupo-item';

@Component({
  selector: 'app-det-grupo-item-filho-quantificar',
  templateUrl: './det-grupo-item-filho-quantificar.component.html',
  styleUrls: ['./det-grupo-item-filho-quantificar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetGrupoItemFilhoQuantificarComponent implements OnInit, OnDestroy {
  constructor(
    public definicaoEscopoGrupoTecnicoService: DefinicaoEscopoGrupoTecnicoService,
    private bsModalService: BsModalService
  ) {}

  private _destroy$ = new Subject<void>();

  get idOrcamentoGrupoItem(): number {
    return this.grupoItemFilho.idOrcamentoGrupoItem;
  }
  @Input() grupoItemFilho: GrupoItemTecnicoFilho;
  @Input() idOrcamentoGrupoItemPai: number;
  @Input() enableAmbiente: boolean;
  @Input() quantitativo: Quantitativo;
  @Input() isLoading: boolean;

  ambiente($event: DistribuirQuantitativoAmbienteEvent): void {
    this.bsModalService.show(DetGrupoItemFilhoAmbientesModalComponent, {
      initialState: {
        pavimento: $event.pavimento,
        grupoItemFilho: this.grupoItemFilho,
        idOrcamentoGrupoItemPai: this.idOrcamentoGrupoItemPai,
      } as Partial<DetGrupoItemFilhoAmbientesModalComponent>,
      class: 'modal-lg',
    });
  }

  updateQuantitativo($event: AtualizacaoCentroCustoEvent): void {
    this.definicaoEscopoGrupoTecnicoService.updateGrupoItemFilhoQuantitativoApi(
      this.idOrcamentoGrupoItemPai,
      this.idOrcamentoGrupoItem,
      $event.fase.idFase,
      $event.pavimento,
      $event.centroCusto,
      $event.newQtde
    );
  }

  updateTotal(quantidade: number): void {
    this.definicaoEscopoGrupoTecnicoService.updateGrupoItemFilho(
      this.idOrcamentoGrupoItemPai,
      this.idOrcamentoGrupoItem,
      {
        quantidade,
      }
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
