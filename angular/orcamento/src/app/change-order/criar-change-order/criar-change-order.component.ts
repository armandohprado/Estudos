import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeOrderService } from '../services/change-order.service';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { AwStepperComponent } from '@aw-components/aw-stepper/aw-stepper.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangeOrderFamiliaQuery } from '../state/familia/change-order-familia.query';
import { ChangeOrder } from '../models/change-order';
import { PayloadChangeOrder } from '../models/payload-change-order';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ChangeOrderFamiliaService } from '../state/familia/change-order-familia.service';
import { AwRouterQuery } from '@aw-services/core/router.query';

@Component({
  selector: 'app-criar-change-order',
  templateUrl: './criar-change-order.component.html',
  styleUrls: ['./criar-change-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriarChangeOrderComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private changeOrderService: ChangeOrderService,
    private awDialog: AwDialogService,
    private routerQuery: AwRouterQuery,
    private changeOrderFamiliaQuery: ChangeOrderFamiliaQuery,
    private changeDetectorRef: ChangeDetectorRef,
    private changeOrderFamiliaService: ChangeOrderFamiliaService
  ) {}

  idOrcamento: number;
  idOrcamentoChangeOrder: number;
  idOrcamentoGrupoClassificacao: number;
  changeOrder: ChangeOrder;

  saving = false;

  form = new FormGroup({
    nome: new FormControl(null, [Validators.required]),
    descricao: new FormControl(null, [Validators.required]),
    dataFinalizacao: new FormControl(null, [Validators.required]),
    prazoValidade: new FormControl(null, [Validators.required]),
    destacarImpostos: new FormControl(false),
    omitirDetalhamento: new FormControl(false),
    idRfi: new FormControl(null, [Validators.required]),
  });

  @ViewChild(AwStepperComponent) awStepperRef: AwStepperComponent;

  get activatedRoute(): ActivatedRoute {
    let state = this._activatedRoute;
    while (state.firstChild) {
      state = state.firstChild;
    }
    return state;
  }

  async voltar(): Promise<boolean> {
    let commands = '../../../';
    if (this.idOrcamentoChangeOrder) {
      commands += '../';
    }
    return this.router.navigate([commands], { relativeTo: this.activatedRoute });
  }

  salvarChangeOrder(): void {
    this.saving = true;
    const payload: PayloadChangeOrder = {
      ...this.form.value,
      idOrcamento: this.idOrcamento,
      idOrcamentoCenarioOrigem: +this.routerQuery.getFirstParam(RouteParamEnum.idOrcamentoCenario),
      familia: this.changeOrderFamiliaQuery.getFamiliaPayload(!!this.idOrcamentoChangeOrder),
    };
    if (this.idOrcamentoChangeOrder) {
      payload.idOrcamentoChangeOrder = this.idOrcamentoChangeOrder;
      payload.idOrcamentoGrupoClassificacao = this.idOrcamentoGrupoClassificacao;
    }
    let http: Observable<any> = this.idOrcamentoChangeOrder
      ? this.changeOrderService.editarChangeOrder(payload).pipe(tap(() => this.success()))
      : this.changeOrderService
          .createChangeOrder(payload)
          .pipe(tap(response => this.success(response.idOrcamentoGrupoClassificacao)));
    if (this.idOrcamentoChangeOrder) {
      http = http.pipe(switchMap(() => this.changeOrderFamiliaService.getFamilias(this.idOrcamentoChangeOrder)));
    }
    http
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetectorRef.markForCheck();
        }),
        catchError(err => {
          this.error();
          return throwError(err);
        })
      )
      .subscribe();
  }

  private error(): void {
    let title = 'Erro na criação da change order!';
    if (this.idOrcamentoChangeOrder) {
      title = 'Erro na edição da change order!';
    }
    this.awDialog.error(title, 'Confira as informações preenchidas e tente novamente.', {
      secondaryBtn: {
        title: 'Ok',
      },
    });
  }

  private success(idOrcamentoChangeOrder?: number): void {
    let title = 'Change Order criada com sucesso!';
    if (this.idOrcamentoChangeOrder) {
      title = 'Change Order editada com sucesso!';
    }
    this.awDialog.success(title, 'Clique em ok para prosseguir.', {
      primaryBtn: {
        title: 'Ok',
        action: bsModalRef => {
          bsModalRef.hide();
          this.voltar().then();
        },
      },
      secondaryBtn: {
        action: bsModalRef => {
          if (idOrcamentoChangeOrder) {
            this.voltar().then(() => {
              bsModalRef.hide();
            });
          } else {
            bsModalRef.hide();
          }
        },
      },
    });
  }

  ngOnInit(): void {
    this.idOrcamento = +this.routerQuery.getParams<string>(RouteParamEnum.idOrcamento);
    this.idOrcamentoChangeOrder = +this.routerQuery.getParams<string>(RouteParamEnum.idOrcamentoChangeOrder);
    this.changeOrder = this.changeOrderService.changeOrders$?.value?.find?.(
      changeOrder => changeOrder.idOrcamentoChangeOrder === this.idOrcamentoChangeOrder
    );
    this.idOrcamentoGrupoClassificacao = this.changeOrder?.idOrcamentoGrupoClassificacao;
    if (this.changeOrder) {
      this.form.patchValue({
        nome: this.changeOrder.nome,
        descricao: this.changeOrder.descricao,
        dataFinalizacao: new Date(this.changeOrder.dataFinalizacao),
        prazoValidade: this.changeOrder.prazoValidade,
        destacarImpostos: !!this.changeOrder.destacarImpostos,
        omitirDetalhamento: !!this.changeOrder.omitirDetalhamento,
        idRfi: this.changeOrder.idRfi,
      });
    }
  }

  ngOnDestroy(): void {
    this.changeOrderFamiliaService.destroy();
  }
}
