import { Component, Inject, OnInit } from '@angular/core';
import { GerenciadorGruposQuery } from './state/gerenciador-grupos.query';
import { GerenciadorGruposService } from './state/gerenciador-grupos.service';
import { trackByFactory } from '@aw-utils/track-by';
import { CenarioFamiliaGG, FamiliaGG } from './state/gerenciador-grupo.model';
import { PhGerenciarGruposComponent } from '../planilha-vendas-hibrida/shared/gerenciar-grupos/ph-gerenciar-grupos.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { ModalSelecionarGruposComponent } from '../plano-de-orcamento/tabs-steps/tab-grupos/familia/modal-selecionar-grupos/modal-selecionar-grupos.component';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { DataGerenciadorGruposService } from './services/data-gerenciador-grupos.service';
import { finalize, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { WINDOW_TOKEN } from '@aw-shared/tokens/window';
import { Grupao } from '@aw-models/grupao';

@Component({
  selector: 'app-gerenciador-grupos',
  templateUrl: './gerenciador-grupos.component.html',
  styleUrls: ['./gerenciador-grupos.component.scss'],
})
export class GerenciadorGruposComponent implements OnInit {
  constructor(
    public gerenciadorGruposQuery: GerenciadorGruposQuery,
    private gerenciadorGruposService: GerenciadorGruposService,
    private bsModalService: BsModalService,
    private routerQuery: RouterQuery,
    private orcamentoService: OrcamentoService,
    private dataGerenciadorGruposService: DataGerenciadorGruposService,
    @Inject(WINDOW_TOKEN) private window: Window
  ) {}

  trackByFamilia = trackByFactory<FamiliaGG>('idOrcamentoFamilia');
  trackByFamiliaCenario = trackByFactory<CenarioFamiliaGG>('idOrcamentoCenarioFamilia');

  familias$ = this.gerenciadorGruposQuery.selectAll();
  ngOnInit(): void {}

  toggleGrupoes(idOrcamentoFamilia: number): void {
    this.gerenciadorGruposService.toggleCollapseGrupoes(idOrcamentoFamilia);
  }

  openModalGerenciarGrupos(familia: FamiliaGG, cenario: CenarioFamiliaGG): void {
    this.bsModalService.show(PhGerenciarGruposComponent, {
      initialState: {
        idOrcamento: familia.idOrcamento,
        idOrcamentoCenario: cenario.idOrcamentoCenario,
        idOrcamentoCenarioFamilia: cenario.idOrcamentoCenarioFamilia,
        idOrcamentoFamilia: cenario.idOrcamentoFamilia,
        descricaoFamilia: familia.descricaoFamilia,
        gerenciadorGrupos: true,
      },
      class: 'modal-lg',
      ignoreBackdropClick: true,
    });
  }

  abrirModalAdcGrupos(familia: FamiliaGG, cenario: CenarioFamiliaGG): void {
    const idOrcamento = +this.routerQuery.getParams(RouteParamEnum.idOrcamento);

    this.gerenciadorGruposService.editandoCenarioFamilia(
      cenario.idOrcamentoFamilia,
      cenario.idOrcamentoCenarioFamilia,
      { loaderAdcGrupo: true }
    );
    let request$: Observable<Grupao[] | null> = of(null);
    if (!this.orcamentoService.orcamento$.value?.idOrcamento) {
      request$ = this.dataGerenciadorGruposService.getOrcamentoGruposModalSelecGrupos(
        cenario.idOrcamentoCenario,
        familia.idFamilia,
        familia.idFamiliaCustomizada
      );
    }
    request$
      .pipe(
        tap(grupoes => {
          this.bsModalService.show(ModalSelecionarGruposComponent, {
            class: 'modal-lg',
            ignoreBackdropClick: true,
            initialState: {
              idFamilia: familia.idFamiliaCustomizada || familia.idFamilia || 0,
              customizada: !!familia.idFamiliaCustomizada,
              idOrcamento,
              grupoes,
              idOrcamentoCenario: cenario.idOrcamentoCenario,
              gerenciadorGrupos: true,
              observable$: this.dataGerenciadorGruposService.getMappeadFamilias(idOrcamento),
              showPercentual: true,
            },
          });
        }),
        finalize(() => {
          this.gerenciadorGruposService.editandoCenarioFamilia(
            cenario.idOrcamentoFamilia,
            cenario.idOrcamentoCenarioFamilia,
            { loaderAdcGrupo: false }
          );
        })
      )
      .subscribe();
  }

  move(right: boolean): void {
    let scrollTo = right ? 277 : -277;
    if (right && this.window.scrollX < 34) {
      scrollTo = 277 + 34 - this.window.scrollX;
    }
    this.window.scrollBy({ behavior: 'smooth', left: scrollTo });
  }
}
