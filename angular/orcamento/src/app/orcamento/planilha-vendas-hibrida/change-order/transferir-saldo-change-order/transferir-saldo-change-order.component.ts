import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeOrderService } from '../../../../change-order/services/change-order.service';
import { GrupoTransferencia } from '@aw-models/controle-compras/grupo-transferencia';
import { PlanilhaHibridaGrupo } from '../../models/grupo';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { CcGrupoService } from '../../../../compra/controle-compras/state/grupos/cc-grupo.service';
import { OrcamentoCenarioGrupoContratoEnum } from '@aw-models/orcamento-cenario-grupo-contrato.enum';
import { PlanilhaVendasHibridaService } from '../../planilha-vendas-hibrida.service';
import { PlanilhaHibridaTransferirSaldoDto } from '../../models/transferir-saldo';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { sumBy } from 'lodash-es';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { arredondamento } from '@aw-shared/pipes/arredondamento.pipe';

@Component({
  selector: 'app-transferir-saldo-change-order',
  templateUrl: './transferir-saldo-change-order.component.html',
  styleUrls: ['./transferir-saldo-change-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferirSaldoChangeOrderComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeOrderService: ChangeOrderService,
    private ccGruposService: CcGrupoService,
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private changeDetectorRef: ChangeDetectorRef,
    private awDialogService: AwDialogService,
    public bsModalRef: BsModalRef,
    private cenariosService: CenariosService
  ) {}

  @Input() planilhaHibridaGrupo: PlanilhaHibridaGrupo;
  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;

  loading = false;

  gruposTransferencia: GrupoTransferencia[] = [];
  readonly = false;

  ngOnInit(): void {
    this.loading = true;
    const tipo =
      this.planilhaHibridaGrupo.planilhaHibrida.idOrcamentoCenarioGrupoContrato ===
      OrcamentoCenarioGrupoContratoEnum.direto
        ? 'direto'
        : 'refaturado';
    this.cenariosService
      .getPadrao(this.idOrcamentoCenario)
      .pipe(
        switchMap(cenarioPadrao =>
          this.ccGruposService.getGruposTransferenciaChangeOrder(cenarioPadrao.idOrcamentoCenarioPadrao, tipo).pipe(
            map(grupos =>
              grupos.map(grupo => ({
                ...grupo,
                transferencia: Math.abs(grupo.valorSaldoReservadoChangeOrder),
                valorSaldoUtilizado:
                  grupo.valorSaldo + grupo.valorSaldoContingencia + grupo.valorSaldoReservadoChangeOrder,
              }))
            ),
            map(grupos =>
              grupos.map(grupo => ({
                ...grupo,
                bloqueado:
                  (grupo.transferencia > 0 &&
                    grupo.idPlanilhaHibridaDestinoTransferenciaCO !==
                      this.planilhaHibridaGrupo.planilhaHibrida.idPlanilhaHibrida) ||
                  (grupo.transferencia <= 0 && grupo.haTransacoesPendentes),
              }))
            ),
            tap(grupos => {
              this.gruposTransferencia = grupos;
            }),
            finalize(() => {
              this.loading = false;
              this.changeDetectorRef.markForCheck();
            })
          )
        )
      )
      .subscribe();
  }

  onChangeValue(grupo: GrupoTransferencia): void {
    this.gruposTransferencia = this.gruposTransferencia.map(grupoTransferencia => {
      if (grupoTransferencia.idCompraNegociacaoGrupo === grupo.idCompraNegociacaoGrupo) {
        return {
          ...grupoTransferencia,
          ...grupo,
          valorSaldoUtilizado: grupo.valorSaldo + grupo.valorSaldoContingenciaReservado - grupo.transferencia,
          updated: true,
        };
      }
      return grupoTransferencia;
    });
    this.changeDetectorRef.markForCheck();
  }

  transferir(): void {
    if (
      this.loading ||
      !this.gruposTransferencia.some(grupo => grupo.updated) ||
      // Considerar apenas os grupos atualizados na verificação
      arredondamento(sumBy(this.gruposTransferencia, grupo => (grupo.updated ? grupo.transferencia : 0))) >
        this.planilhaHibridaGrupo.planilhaHibrida.valorTotal
    ) {
      return;
    }
    if (!this.readonly) {
      this.readonly = true;
      this.changeDetectorRef.markForCheck();
    } else {
      const dto: PlanilhaHibridaTransferirSaldoDto[] = this.gruposTransferencia
        .filter(grupo => grupo.updated)
        .map(({ transferencia, idCompraNegociacaoGrupo }) => ({
          idCompraNegociacaoGrupo,
          valor: transferencia,
        }));
      this.loading = true;
      this.planilhaVendasHibridaService
        .transferencia(
          this.planilhaHibridaGrupo.planilhaHibrida.idPlanilhaHibrida,
          dto,
          this.planilhaHibridaGrupo.idOrcamentoFamilia,
          this.planilhaHibridaGrupo.idGrupao,
          this.planilhaHibridaGrupo.idOrcamentoCenario,
          this.idOrcamento
        )
        .pipe(
          finalize(() => {
            this.loading = false;
            this.changeDetectorRef.markForCheck();
          }),
          tap(() => {
            this.awDialogService.success({
              title: 'Transferência concluída com sucesso',
              secondaryBtn: {
                title: 'Voltar',
                action: bsModalRef => {
                  bsModalRef.hide();
                  this.close();
                },
              },
            });
          }),
          catchAndThrow(response => {
            this.awDialogService.error(
              'Erro ao tentar transferir',
              response?.error?.mensagem ?? 'Favor tentar novamente mais tarde'
            );
          })
        )
        .subscribe();
    }
  }

  close(checkReadOnly = false): void {
    if (checkReadOnly && this.readonly) {
      this.readonly = false;
      this.changeDetectorRef.markForCheck();
    } else {
      this.bsModalRef.hide();
    }
  }
}
