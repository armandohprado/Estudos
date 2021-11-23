import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PlanilhaVendasHibridaService } from '../planilha-vendas-hibrida.service';
import { BehaviorSubject } from 'rxjs';
import { trackByFactory } from '@aw-utils/track-by';
import { tap } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal-itens-reutilizados',
  templateUrl: './modal-itens-reutilizados.component.html',
  styleUrls: ['./modal-itens-reutilizados.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalItensReutilizadosComponent implements OnInit {
  constructor(private planilhaVendasHibridaService: PlanilhaVendasHibridaService, public bsModalRef: BsModalRef) {}

  idOrcamentoCenario: number;

  itensReutilizados$ = new BehaviorSubject<ItensReutilizados[]>([]);
  trackByProjetos = trackByFactory<ItensReutilizados>('idOrcamentoCenarioItemReutilizado');
  ngOnInit(): void {
    this.getItensReutilizados();
  }
  getItensReutilizados(): void {
    this.planilhaVendasHibridaService
      .getModalItensReutilizados(this.idOrcamentoCenario)
      .pipe(
        tap(itensReutilizados => {
          this.itensReutilizados$.next(itensReutilizados);
        })
      )
      .subscribe();
  }

  updateItensReutilizados(idOrcamentoCenario: number, itemReutilizado: ItensReutilizados): void {
    if (itemReutilizado.reutilizado && !itemReutilizado.justificativa) {
      return;
    }
    this.updateItensBehavior(itemReutilizado, true);
    this.planilhaVendasHibridaService
      .putModalItensReutilizados(idOrcamentoCenario, itemReutilizado)
      .subscribe(() => this.updateItensBehavior(itemReutilizado, false));
  }

  updateItensBehavior(itemReutilizado: ItensReutilizados, value: boolean): void {
    this.itensReutilizados$.next(
      this.itensReutilizados$.value.map(itens => {
        if (itens.idOrcamentoCenarioItemReutilizado === itemReutilizado.idOrcamentoCenarioItemReutilizado) {
          itens.loader = value;
        }
        return itens;
      })
    );
  }
}

export interface ItensReutilizados {
  idOrcamentoCenarioItemReutilizado: number;
  nome: string;
  reutilizado: boolean;
  justificativa?: string;
  loader?: boolean;
}
