import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { OrcamentoCenarioFamilia } from './models/cenario';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { fadeInOutAnimation, fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { LocationStrategy } from '@angular/common';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute } from '@angular/router';
import { QuadroResumoComponent } from './quadro-resumo/quadro-resumo.component';
import { ComboImposto } from './models/combo-imposto';
import { Grupao } from './models/grupao';
import { ValidarComentarios } from './models/validar-comentarios';
import { finalize, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { AwDialogOptions } from '@aw-components/aw-dialog/aw-dialog-types';
import { PlanilhaVendasHibridaService } from './planilha-vendas-hibrida.service';
import { ReportsService } from '@aw-services/reports/reports.service';
import { trackByFactory } from '@aw-utils/track-by';
import { PhModalConfirmacaoCongelamentoComponent } from './ph-modal-confirmacao-congelamento/ph-modal-confirmacao-congelamento.component';

@Component({
  selector: 'app-planilha-vendas-hibrida',
  templateUrl: './planilha-vendas-hibrida.component.html',
  styleUrls: ['./planilha-vendas-hibrida.component.scss'],
  animations: [fadeInOutAnimation(), fadeOutAnimation()],
})
export class PlanilhaVendasHibridaComponent implements OnInit, OnDestroy {
  constructor(
    public planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private activatedRoute: ActivatedRoute,
    private bsModalService: BsModalService,
    private locationStrategy: LocationStrategy,
    private awDialogService: AwDialogService,
    private reportsService: ReportsService
  ) {}

  private _destroy$ = new Subject<void>();

  @ViewChildren('familiaBody') familiasBody: QueryList<ElementRef<HTMLDivElement>>;
  cenario$ = this.planilhaVendasHibridaService.cenario$.asObservable();
  familias$ = this.planilhaVendasHibridaService.allFamilias$;
  transacoes$ = this.planilhaVendasHibridaService.transacoes$.asObservable();
  transacoesCC$ = this.planilhaVendasHibridaService.transacoesCC$.asObservable();
  loadingTipoTaxa = false;
  loadingValidacaCongelar = false;

  idOrcamentoCenario = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  idOrcamento = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  selectContratos: ComboImposto[] = [];
  isOpenTaxas = false;
  loader = false;
  isChangeOrder: boolean;

  trackByOrcamentoFamilia = trackByFactory<OrcamentoCenarioFamilia>('idOrcamentoCenarioFamilia');
  trackByGrupao = trackByFactory<Grupao>('idGrupao');

  onChangeTipoTaxa(tipoTaxaAdministrativa: number): void {
    this.loadingTipoTaxa = true;
    let data: Partial<AwDialogOptions> = {
      title: 'Atenção',
      secondaryBtn: {
        title: 'Não',
        action: bsModalRef => {
          bsModalRef.hide();
          this.planilhaVendasHibridaService.updateCenario({
            tipoTaxaAdministrativa: tipoTaxaAdministrativa ? 0 : 1,
          });
        },
      },
    };
    if (tipoTaxaAdministrativa) {
      data = {
        ...data,
        content: 'As famílias que estiverem com essa taxa definida serão zeradas, deseja continuar?',
        primaryBtn: {
          title: 'Sim',
          action: bsModalRef => {
            bsModalRef.hide();
            this.planilhaVendasHibridaService
              .zerarTaxaAdminFamilias(this.idOrcamentoCenario, this.idOrcamento)
              .pipe(
                finalize(() => {
                  this.loadingTipoTaxa = false;
                }),
                tap(() => {
                  this.planilhaVendasHibridaService.updateCenario({
                    tipoTaxaAdministrativa,
                  });
                })
              )
              .subscribe();
          },
        },
      };
    } else {
      data = {
        ...data,
        content:
          'Já existe uma taxa fixa no final da proposta, alterar essa taxa nas famílias irá zerar a taxa fixa, deseja continuar?',
        primaryBtn: {
          title: 'Sim',
          action: bsModalRef => {
            bsModalRef.hide();
            this.planilhaVendasHibridaService
              .zerarTaxaAdminFixa(this.planilhaVendasHibridaService.cenario$.value)
              .pipe(
                finalize(() => {
                  this.loadingTipoTaxa = false;
                }),
                tap(() => {
                  this.planilhaVendasHibridaService.updateCenario({
                    tipoTaxaAdministrativa,
                    valorTaxaAdmistrativa: 0,
                    percentualTaxaAdministrativa: 0,
                  });
                })
              )
              .subscribe();
          },
        },
      };
    }
    this.awDialogService.warning(data);
  }

  openFamilia(idOrcamentoFamilia: number): void {
    this.planilhaVendasHibridaService.updateFamilia(idOrcamentoFamilia, familia => ({
      ...familia,
      isOpen: !familia.isOpen,
    }));
  }

  openQuadroResumo(): void {
    this.bsModalService.show(QuadroResumoComponent, {
      class: 'modal-xl',
      ignoreBackdropClick: false,
      initialState: { idOrcamentoCenario: this.idOrcamentoCenario },
    });
  }

  openFichaCEO(): void {
    this.reportsService.FichaCeo({ IdOrcamentoCenario: this.idOrcamentoCenario }).open();
  }

  validaComentarioCallCongelarPlanilha(): void {
    this.loadingValidacaCongelar = true;
    this.validarComentarioCongelar(this.idOrcamentoCenario).subscribe(() => {
      this.loadingValidacaCongelar = false;
      if (!this.planilhaVendasHibridaService.bloquearAcaoCongelar) {
        this.confirmCongelarPlanilha();
      }
    });
  }

  confirmCongelarPlanilha(): void {
    this.bsModalService.show(PhModalConfirmacaoCongelamentoComponent, {
      class: 'modal-md',
      initialState: {
        idOrcamento: this.idOrcamento,
        idOrcamentoCenario: this.idOrcamentoCenario,
        isChangeOrder: this.isChangeOrder,
        activatedRoute: this.activatedRoute,
      },
    });
  }

  validarComentarioCongelar(idOrcamentoCenario: number): Observable<ValidarComentarios> {
    return this.planilhaVendasHibridaService.getValidarCongelar(idOrcamentoCenario);
  }

  scrollFamiliaBody(idOrcamentoFamilia: number, direita = false): void {
    const familiaBody = this.familiasBody.find(
      elementRef => elementRef.nativeElement.getAttribute('idOrcamentoFamilia') === '' + idOrcamentoFamilia
    );
    if (familiaBody) {
      const totalScroll = Math.max(
        familiaBody.nativeElement.scrollWidth - familiaBody.nativeElement.getBoundingClientRect().width,
        0
      );
      const scrollLeft = familiaBody.nativeElement.scrollLeft;
      const scrollTo = direita ? Math.min(scrollLeft + 100, totalScroll) : Math.max(scrollLeft - 100, 0);
      familiaBody.nativeElement.scrollTo({ behavior: 'smooth', left: scrollTo });
    }
  }

  ngOnInit(): void {
    this.isChangeOrder = this.locationStrategy.path().includes('change-order');

    this.planilhaVendasHibridaService.getListaContratos().subscribe(contratos => {
      this.selectContratos = contratos;
    });

    const idOrcamentoFamilia = this.activatedRoute.snapshot.queryParamMap.get(RouteParamEnum.idOrcamentoFamilia);
    if (idOrcamentoFamilia) {
      this.openFamilia(+idOrcamentoFamilia);
    }
  }

  ngOnDestroy(): void {
    this.planilhaVendasHibridaService.destroyState();
    this._destroy$.next();
    this._destroy$.complete();
  }
}
