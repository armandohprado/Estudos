import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import { ChangeOrder } from '../models/change-order';
import { ChangeOrderService } from '../services/change-order.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModalAprovarChangeOrderComponent } from '../modal-aprovar-change-order/modal-aprovar-change-order.component';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CenarioStatusEnum } from '@aw-models/index';
import { ReportsService } from '@aw-services/reports/reports.service';

@Component({
  selector: 'app-change-order-details',
  templateUrl: './change-order-details.component.html',
  styleUrls: ['./change-order-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ChangeOrderDetailsComponent implements AfterViewInit {
  constructor(
    private changeOrderService: ChangeOrderService,
    private bsModalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private reportsService: ReportsService,
    private elementRef: ElementRef<HTMLElement>,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() changeOrder: ChangeOrder;

  changingStatus = false;

  readonly cenarioStatusEnum = CenarioStatusEnum;

  modifyChangeOrderStatus(newStatus: number, changeOrder: ChangeOrder): void {
    this.changingStatus = true;
    this.changeOrderService
      .updateChageOrderStatus(changeOrder.idOrcamentoCenario, newStatus, changeOrder.idOrcamentoChangeOrder)
      .pipe(
        finalize(() => {
          this.changingStatus = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  reprovar(idOrcamentoCenario: number, idOrcamentoChangeOrder: number): void {
    this.changingStatus = true;
    const idOrcamento = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
    this.changeOrderService
      .reprovar(idOrcamento, idOrcamentoCenario, idOrcamentoChangeOrder)
      .pipe(
        finalize(() => {
          this.changingStatus = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  openModalAprovarChangeOrder(idStatus: number, changeOrder: ChangeOrder): void {
    this.bsModalService.show(ModalAprovarChangeOrderComponent, {
      initialState: { changeOrder, idStatus },
      class: 'modal-lg',
      ignoreBackdropClick: true,
    });
  }

  revisar(changeOrder: ChangeOrder): void {
    this.changingStatus = true;
    const idOrcamento = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
    this.changeOrderService
      .revisar(idOrcamento, changeOrder)
      .pipe(
        finalize(() => {
          this.changingStatus = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  openReport(): void {
    this.reportsService
      .PlanilhaAWItensFamiliaGrupaoGrupoAndarCentroCustoFamiliaChangeOrder({
        IdOrcamentoCenario: this.changeOrder.idOrcamentoCenario,
      })
      .open();
  }

  ngAfterViewInit(): void {
    if (
      this.activatedRoute.snapshot.queryParamMap.has(RouteParamEnum.idOrcamentoCenario) &&
      +this.activatedRoute.snapshot.queryParamMap.get(RouteParamEnum.idOrcamentoCenario) ===
        this.changeOrder.idOrcamentoCenario
    ) {
      this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
