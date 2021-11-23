import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PlanilhaVendasHibridaService } from '../planilha-vendas-hibrida.service';
import { BehaviorSubject } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalProjetoTecnico } from '../models/modal-projeto-tecnico';

@Component({
  selector: 'app-modal-projeto-tecnico-classificacao',
  templateUrl: './modal-projeto-tecnico-classificacao.component.html',
  styleUrls: ['./modal-projeto-tecnico-classificacao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalProjetoTecnicoClassificacaoComponent implements OnInit {
  constructor(private planilhaVendasHibridaService: PlanilhaVendasHibridaService, public bsModalRef: BsModalRef) {}

  idOrcamentoCenario: number;
  projetosTecnicos$ = new BehaviorSubject<ModalProjetoTecnico[]>([]);
  trackByProjetos = trackByFactory<ModalProjetoTecnico>('idOrcamentoCenarioGrupo');
  ngOnInit(): void {
    this.planilhaVendasHibridaService
      .getModalProjetoTecnico(this.idOrcamentoCenario)
      .pipe(
        map(projetos => {
          projetos = projetos.map(projeto => {
            projeto = { ...projeto, classificacao: projeto.classificacao ?? 1 };
            return projeto;
          });
          return projetos;
        }),
        tap(projetos => {
          this.projetosTecnicos$.next(projetos);
        })
      )
      .subscribe();
  }

  updateProjetoTecnico(projeto: ModalProjetoTecnico): void {
    this.updateProjetoBehavior(projeto, true);
    this.planilhaVendasHibridaService
      .putModalProjetoTecnico(projeto.idOrcamentoCenario, projeto.idOrcamentoCenarioGrupo, projeto.classificacao)
      .pipe(finalize(() => this.updateProjetoBehavior(projeto, false)))
      .subscribe();
  }

  updateProjetoBehavior(projeto: ModalProjetoTecnico, value: boolean): void {
    this.projetosTecnicos$.next(
      this.projetosTecnicos$.value.map(projetos => {
        if (projetos.idOrcamentoCenarioGrupo === projeto.idOrcamentoCenarioGrupo) {
          projetos.loader = value;
        }
        return projetos;
      })
    );
  }
}
