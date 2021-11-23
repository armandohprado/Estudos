import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { PlanilhaClienteItem } from '@aw-models/planilha-cliente';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { trackByIdDescricao } from '@aw-models/id-descricao';
import { PlanilhaClienteService } from '@aw-services/planilha-cliente/planilha-cliente.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-de-planilha-cliente-items-relacionados-modal',
  templateUrl: './de-planilha-cliente-items-relacionados-modal.component.html',
  styleUrls: ['./de-planilha-cliente-items-relacionados-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DePlanilhaClienteItemsRelacionadosModalComponent implements OnDestroy {
  constructor(
    public bsModalRef: BsModalRef,
    private planilhaClienteService: PlanilhaClienteService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private _hasAnyUpdates = false;

  @Input() planilhaClienteItem: PlanilhaClienteItem;

  loading: Record<number, boolean> = {};

  readonly trackBy = trackByIdDescricao;

  deleteItem(idPlanilhaItemOrcamentoGrupoItem: number): void {
    this.loading = { ...this.loading, [idPlanilhaItemOrcamentoGrupoItem]: true };
    this.planilhaClienteService
      .deletarPlanilhaClienteItemOrcamentoGrupoItem(idPlanilhaItemOrcamentoGrupoItem)
      .pipe(
        finalize(() => {
          this.loading = { ...this.loading, [idPlanilhaItemOrcamentoGrupoItem]: false };
          this.planilhaClienteItem = {
            ...this.planilhaClienteItem,
            orcamentoGrupoItem: this.planilhaClienteItem.orcamentoGrupoItem.filter(
              grupoItem => grupoItem.id !== idPlanilhaItemOrcamentoGrupoItem
            ),
          };
          this._hasAnyUpdates = true;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this._hasAnyUpdates) {
      this.planilhaClienteService.refresh();
    }
  }
}
