import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize } from 'rxjs/operators';
import { PlanilhaVendasHibridaService } from '../../planilha-vendas-hibrida.service';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';
import { refreshMap } from '@aw-utils/rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Component({
  selector: 'app-ph-proposta',
  templateUrl: './ph-proposta.component.html',
  styleUrls: ['./ph-proposta.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhPropostaComponent {
  constructor(
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private changeDetectorRef: ChangeDetectorRef,
    private orcamentoAltService: OrcamentoAltService,
    private activatedRoute: ActivatedRoute
  ) {}

  private readonly _idOrcamentoGrupo$ = new BehaviorSubject<number>(0);

  loading = false;
  loadingGrupo = false;

  readonly idProjeto = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idProjeto);

  @Input() isChangeOrder: boolean;
  @Input() idOrcamentoCenario: number;
  @Input() idOrcamento: number;
  @Input() idOrcamentoCenarioFamilia: number;
  @Input() idOrcamentoFamilia: number;
  @Input() idGrupao: number;

  @Output() readonly calcularPlanilha = new EventEmitter<void>();

  @Input()
  set idOrcamentoGrupo(idOrcamentoGrupo: number) {
    this._idOrcamentoGrupo$.next(idOrcamentoGrupo);
  }

  readonly grupo$ = this._idOrcamentoGrupo$.pipe(
    filter(id => !!id),
    debounceTime(0),
    distinctUntilChanged(),
    refreshMap(idOrcamentoGrupo => {
      this.loadingGrupo = true;
      this.changeDetectorRef.markForCheck();
      return this.orcamentoAltService.getGrupo(this.idOrcamento, this.idOrcamentoCenario, idOrcamentoGrupo).pipe(
        finalize(() => {
          this.loadingGrupo = false;
          this.changeDetectorRef.markForCheck();
        })
      );
    }),
    switchMap(idOrcamentoGrupo => this.orcamentoAltService.selectGrupo(idOrcamentoGrupo))
  );

  refreshPlanilhaHibrida(): void {
    this.loading = true;
    this.planilhaVendasHibridaService
      .getCenario(this.idOrcamentoCenario, this.idOrcamento)
      .pipe(
        this.planilhaVendasHibridaService.refreshTotalFamilia(this.idOrcamentoCenarioFamilia, this.idOrcamentoCenario),
        this.planilhaVendasHibridaService.refreshTaxas(),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
          this.calcularPlanilha.emit();
        })
      )
      .subscribe();
  }
}
