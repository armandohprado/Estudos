import { ChangeDetectionStrategy, Component, Input, OnInit, TrackByFunction } from '@angular/core';
import { Store } from '@ngxs/store';
import { GrupoItemTecnicoFilho } from '../../models/grupo-item';
import { Pavimento } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { ProjetoAmbiente } from '@aw-models/projeto-ambiente';
import { combineLatest, Observable } from 'rxjs';
import { DefinicaoEscopoGrupoTecnicoState } from '../../state/definicao-escopo-grupo-tecnico.state';
import { ProjetoAmbienteQuery } from '@aw-services/projeto-ambiente/projeto-ambiente.query';
import { map } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DetGrupoItemFilhoAmbientesModalComponent } from '../det-grupo-item-filho-ambientes-modal/det-grupo-item-filho-ambientes-modal.component';

@Component({
  selector: 'app-det-grupo-item-filho-ambientes',
  templateUrl: './det-grupo-item-filho-ambientes.component.html',
  styleUrls: ['./det-grupo-item-filho-ambientes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetGrupoItemFilhoAmbientesComponent implements OnInit {
  constructor(
    private store: Store,
    private projetoAmbienteQuery: ProjetoAmbienteQuery,
    private bsModalService: BsModalService
  ) {}

  @Input() idOrcamentoGrupoItemPai: number;
  @Input() grupoItemFilho: GrupoItemTecnicoFilho;

  list$: Observable<[Pavimento, ProjetoAmbiente[]][]>;

  trackByProjetoAmbiente = trackByFactory<ProjetoAmbiente>('idProjetoAmbiente');
  trackByPavimento: TrackByFunction<[Pavimento, ProjetoAmbiente[]]> = (_, [pavimento]) =>
    pavimento.idProjetoEdificioPavimento;

  editAmbientes(pavimento: Pavimento): void {
    this.bsModalService.show(DetGrupoItemFilhoAmbientesModalComponent, {
      initialState: {
        pavimento,
        grupoItemFilho: this.grupoItemFilho,
        idOrcamentoGrupoItemPai: this.idOrcamentoGrupoItemPai,
      } as Partial<DetGrupoItemFilhoAmbientesModalComponent>,
      class: 'modal-lg',
    });
  }

  ngOnInit(): void {
    const pavimentos$ = this.store.select(
      DefinicaoEscopoGrupoTecnicoState.selectPavimentos(
        this.idOrcamentoGrupoItemPai,
        this.grupoItemFilho.idOrcamentoGrupoItem
      )
    );
    const ambientes$ = this.projetoAmbienteQuery.selectAll();
    const ambientesSelecionados$ = this.store.select(
      DefinicaoEscopoGrupoTecnicoState.selectAmbientes(
        this.idOrcamentoGrupoItemPai,
        this.grupoItemFilho.idOrcamentoGrupoItem
      )
    );
    this.list$ = combineLatest([pavimentos$, ambientes$, ambientesSelecionados$]).pipe(
      map(([pavimentos, ambientes, ambientesSelecionados]) => {
        return pavimentos.map(pavimento => {
          const pavimentoAmbientes = ambientesSelecionados
            .filter(selecionado => selecionado.idProjetoEdificioPavimento === pavimento.idProjetoEdificioPavimento)
            .map(selecionado => ({
              ...ambientes.find(ambiente => ambiente.idProjetoAmbiente === selecionado.idProjetoAmbiente),
              idSpk: selecionado.idSpk,
            }));
          return [pavimento, pavimentoAmbientes];
        });
      })
    );
  }
}
