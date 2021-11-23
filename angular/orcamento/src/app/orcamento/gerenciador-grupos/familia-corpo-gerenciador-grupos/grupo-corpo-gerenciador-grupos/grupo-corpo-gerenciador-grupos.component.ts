import { Component, Input } from '@angular/core';
import { CenarioGG, GrupoGG, TipoGrupoOpcionalEnum } from '../../state/gerenciador-grupo.model';
import { trackByFactory } from '@aw-utils/track-by';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { GerenciadorGruposService } from '../../state/gerenciador-grupos.service';
import { CotacaoService } from '@aw-services/cotacao/cotacao.service';
import { finalize, tap } from 'rxjs/operators';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { PlanilhaVendasHibridaService } from '../../../planilha-vendas-hibrida/planilha-vendas-hibrida.service';
import { OrcamentoCenarioGrupoService } from '@aw-services/orcamento-cenario-grupo/orcamento-cenario-grupo.service';
import { getOverlayFromPosition } from '@aw-utils/cdk-overlay';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AdicionarGrupoOpcionalComponent } from '../../adicionar-grupo-opcional/adicionar-grupo-opcional.component';
import { DataGerenciadorGruposService } from '../../services/data-gerenciador-grupos.service';

@Component({
  selector: 'app-grupo-corpo-gerenciador-grupos',
  templateUrl: './grupo-corpo-gerenciador-grupos.component.html',
  styleUrls: ['../../gerenciador-grupos.component.scss', './grupo-corpo-gerenciador-grupos.component.scss'],
})
export class GrupoCorpoGerenciadorGruposComponent {
  constructor(
    private gerenciadorGruposService: GerenciadorGruposService,
    private cotacaoService: CotacaoService,
    private awDialogService: AwDialogService,
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private orcamentoCenarioGrupoService: OrcamentoCenarioGrupoService,
    private dataGerenciadorGruposService: DataGerenciadorGruposService,
    private bsModalService: BsModalService
  ) {}

  @Input() grupo: GrupoGG;
  @Input() first: boolean;
  @Input() idOrcamento: number;
  trackByCenario = trackByFactory<CenarioGG>('idOrcamentoCenario');
  overlayComplementoPosition: ConnectedPosition[] = getOverlayFromPosition('bottom');
  tipoGrupoOpcionalEnum = TipoGrupoOpcionalEnum;

  toggleOverlay(grupo: GrupoGG, editando: boolean): void {
    this.gerenciadorGruposService.editandoGrupo(grupo.idOrcamentoFamilia, grupo.idOrcamentoGrupo, group => {
      return { ...group, editandoComplemento: editando };
    });
  }

  editandoGrupoStore(grupo: GrupoGG, grupoUpdated: Partial<GrupoGG>): void {
    this.gerenciadorGruposService.editandoGrupo(grupo.idOrcamentoFamilia, grupo.idOrcamentoGrupo, group => {
      return { ...group, ...grupoUpdated };
    });
  }

  editarComplemento(value: string): void {
    this.editandoGrupoStore(this.grupo, { loaderComplemento: true });
    this.cotacaoService
      .saveComentario({ complementoGrupo: value }, this.grupo.idOrcamentoGrupo, this.idOrcamento)
      .pipe(
        tap(() => {
          this.editandoGrupoStore(this.grupo, { complementoOrcamentoGrupo: value, editandoComplemento: false });
        }),
        finalize(() => {
          this.editandoGrupoStore(this.grupo, { editandoComplemento: false, loaderComplemento: false });
        }),
        catchAndThrow(response => {
          this.awDialogService.error(
            'Erro ao tentar salvar complemento do grupo',
            response?.error?.mensagem ?? 'Favor tentar novamente mais tarde'
          );
        })
      )
      .subscribe();
  }

  updatePlanilhaHibrida(newCenario: CenarioGG): void {
    this.planilhaVendasHibridaService
      .toggleAtivoOrcamentoCenarioGrupo(newCenario.idOrcamentoCenarioGrupo)
      .subscribe(retornoCenarios => {
        this.gerenciadorGruposService.editandoCenario(
          () => true,
          this.grupo.idOrcamentoFamilia,
          () => true,
          cenario => {
            const retornoCenario = retornoCenarios.find(
              _retornoCenario =>
                _retornoCenario.idOrcamentoCenario === cenario?.idOrcamentoCenario &&
                _retornoCenario.idOrcamentoGrupo === cenario?.idOrcamentoGrupo
            );
            if (retornoCenario) {
              cenario = { ...cenario, ...retornoCenario };
            }
            return cenario;
          }
        );
      });
  }

  updateControleCotacao(cenario: CenarioGG): void {
    this.orcamentoCenarioGrupoService.excluir(cenario.idOrcamentoCenarioGrupo).subscribe(retorno =>
      this.gerenciadorGruposService.editandoCenario(
        cenario.idOrcamentoCenario,
        this.grupo.idOrcamentoFamilia,
        this.grupo.idOrcamentoGrupo,
        {
          idOrcamentoCenario: retorno.idOrcamentoCenario,
          idOrcamentoCenarioGrupo: retorno.idOrcamentoCenarioGrupo,
          ativo: retorno.ativo,
          excluido: retorno.excluido,
        }
      )
    );
  }
  updateGrupoOpc(grupo: GrupoGG, cenario: CenarioGG, $event: boolean): void {
    this.gerenciadorGruposService.editandoCenario(
      cenario.idOrcamentoCenario,
      this.grupo.idOrcamentoFamilia,
      this.grupo.idOrcamentoGrupo,
      { opcional: $event }
    );

    if ($event) {
      this.bsModalService.show(AdicionarGrupoOpcionalComponent, {
        initialState: {
          idOrcamentoFamilia: this.grupo.idOrcamentoFamilia,
          idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
          cenario,
        },
        class: 'modal-lg',
        ignoreBackdropClick: true,
      });
    } else {
      this.dataGerenciadorGruposService
        .updateOpcional(cenario.idOrcamentoCenarioGrupo)
        .pipe(
          tap(retorno => {
            this.gerenciadorGruposService.editandoCenario(
              cenario.idOrcamentoCenario,
              this.grupo.idOrcamentoFamilia,
              this.grupo.idOrcamentoGrupo,
              retorno
            );

            this.gerenciadorGruposService.editandoGrupo(
              this.grupo.idOrcamentoFamilia,
              this.grupo.idOrcamentoGrupo,
              group => {
                return { ...group, opcional: retorno?.opcional };
              }
            );
          })
        )
        .subscribe();
    }
  }
}
