import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { PlanilhaVendasHibridaService } from '../planilha-vendas-hibrida.service';
import { NaturezaProjetoService } from '@aw-services/natureza-projeto/natureza-projeto.service';
import { NaturezaProjeto } from '@aw-models/natureza-projeto';
import { catchAndThrow, refresh } from '@aw-utils/rxjs/operators';
import { finalize, map, tap } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';
import { CenarioStatusEnum } from '@aw-models/cenario';
import { ChangeOrderService } from '../../../change-order/services/change-order.service';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';

interface PhNaturezaProjeto extends NaturezaProjeto {
  selecionado: boolean;
}

@Component({
  selector: 'app-ph-modal-confirmacao-congelamento',
  templateUrl: './ph-modal-confirmacao-congelamento.component.html',
  styleUrls: ['./ph-modal-confirmacao-congelamento.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhModalConfirmacaoCongelamentoComponent implements OnInit {
  constructor(
    public bsModalRef: BsModalRef,
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private naturezaProjetoService: NaturezaProjetoService,
    private changeOrderService: ChangeOrderService,
    private awDialogService: AwDialogService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() isChangeOrder: boolean;
  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;
  // Não posso injetar o activatedRoute direto nesse componente
  // porque o ngx-bootstrap não injeta a referencia correta (yay)
  @Input() activatedRoute: ActivatedRoute;

  loading = true;
  naturezaProjetos: PhNaturezaProjeto[] = [];

  readonly trackByPhNaturezaProjeto = trackByFactory<PhNaturezaProjeto>('idNaturezaProjeto');

  private _getNaturezaProjetoSelecionado(): NaturezaProjeto | undefined {
    return this.naturezaProjetos.find(naturezaProjeto => naturezaProjeto.selecionado);
  }

  congelarPlanilha(): void {
    const naturezaProjetoSelecionado = this._getNaturezaProjetoSelecionado();
    if (!naturezaProjetoSelecionado) {
      // Isso provavelmente nunca irá acontecer
      return;
    }
    this.loading = true;
    let http$ = this.planilhaVendasHibridaService.congelarPlanilha(
      this.idOrcamento,
      this.idOrcamentoCenario,
      naturezaProjetoSelecionado.idNaturezaProjeto
    );
    if (this.isChangeOrder) {
      const updateStatus$ = this.changeOrderService.updateChageOrderStatus(
        this.idOrcamentoCenario,
        CenarioStatusEnum.congelado
      );
      http$ = http$.pipe(refresh(updateStatus$));
    }
    http$
      .pipe(
        tap(() => {
          this.bsModalRef.hide();
          this.awDialogService.success(
            'Planilha de Venda Híbrida congelada com sucesso',
            'Clique em "Finalizar" e volte para Cenários, ou em "Fechar" e visualize a planilha congelada',
            {
              primaryBtn: {
                title: 'Finalizar',
                action: bsModalRef => {
                  bsModalRef.hide();
                  this.voltarParaCenarios();
                },
              },
              secondaryBtn: {
                title: 'Fechar',
              },
            }
          );
          this.planilhaVendasHibridaService.bloquearAcaoCongelar = true;
          this.planilhaVendasHibridaService.congelado = true;
        }),
        catchAndThrow(response => {
          this.awDialogService.error(
            'Erro ao tentar fazer o congelamento',
            response?.error?.mensagem ?? response?.error?.errors?.[0]?.mensagem ?? 'Erro interno'
          );
        }),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  voltarParaCenarios(): void {
    const commands = this.isChangeOrder ? ['../../../'] : ['../../'];
    this.router.navigate(commands, { relativeTo: this.activatedRoute }).then();
  }

  onNaturezaProjetoChange(idNaturezaProjeto: number): void {
    this.naturezaProjetos = this.naturezaProjetos.map(naturezaProjeto => ({
      ...naturezaProjeto,
      selecionado: naturezaProjeto.idNaturezaProjeto === idNaturezaProjeto,
    }));
    this.changeDetectorRef.markForCheck();
  }

  ngOnInit(): void {
    this.naturezaProjetoService
      .get()
      .pipe(
        map<NaturezaProjeto[], PhNaturezaProjeto[]>(naturezaProjetos =>
          naturezaProjetos.map((naturezaProjeto, index) => ({ ...naturezaProjeto, selecionado: !index }))
        ),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(naturezaProjetos => {
        this.naturezaProjetos = naturezaProjetos;
      });
  }
}
