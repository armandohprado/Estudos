import { Component, Input, OnInit } from '@angular/core';
import { Item } from '@aw-models/devolucao-proposta/item';
import { Observable } from 'rxjs';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { finalize, tap } from 'rxjs/operators';
import { Quantitativo } from '../../../../../../../../../grupo/definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';
import { AtualizacaoCentroCustoEvent } from '../../../../../../../../../grupo/definicao-escopo/shared/de-distribuir-quantitativo/model/atualizacao-centro-custo-event';
import { AtualizarQuantitativo } from '@aw-models/devolucao-proposta/atualizar-item';

@Component({
  selector: 'app-escopo',
  templateUrl: './escopo.component.html',
  styleUrls: ['./escopo.component.scss'],
})
export class EscopoComponent implements OnInit {
  constructor(private dataDP: DataDevolucaoPropostaService, public devolucaoProposta: DevolucaoPropostaService) {}

  @Input() item: Item;

  quantitativo$: Observable<Quantitativo>;
  suggestHide: boolean;

  ngOnInit(): void {
    this.devolucaoProposta.loaderSteps = true;
    if (!this.item.idPropostaItem) {
      this.quantitativo$ = this.dataDP
        .preencherQuantitativoItemOmisso(this.item.idProposta)
        .pipe(finalize(() => (this.devolucaoProposta.loaderSteps = false)));
    } else {
      this.quantitativo$ = this.dataDP.preencherQuantitativo(this.item.idPropostaItem).pipe(
        tap(quantitativo => (this.suggestHide = !!quantitativo?.liberarQuantitativo)),
        finalize(() => (this.devolucaoProposta.loaderSteps = false))
      );
    }
  }

  saveQuantitativo($event: AtualizacaoCentroCustoEvent): void {
    const propostaItemQuantitativo: AtualizarQuantitativo = {
      idFase: $event.fase.idFase,
      idProjetoEdificioPavimento: $event.pavimento.idProjetoEdificioPavimento,
      idProjetoCentroCusto: $event.centroCusto.idProjetoCentroCusto,
      idProposta: this.item.idProposta,
      idPropostaItem: $event.centroCusto.idPropostaItem,
      idPropostaItemQuantitativo: $event.centroCusto.idPropostaItemQuantitativo,
      quantidade: +$event.newQtde,
      quantidadeOrcada: +$event.newQtde,
    };
    if (this.item.omisso && !this.item.idPropostaItem) {
      this.item.propostaItemQuantitativo = [...(this.item.propostaItemQuantitativo ?? []), propostaItemQuantitativo];
      this.dataDP.atualizarQuantitativoOmisso(this.item.idProposta, this.item).subscribe();
    } else {
      this.dataDP.atualizarQuantitativo(this.item.idPropostaItem, [propostaItemQuantitativo]).subscribe();
    }
  }

  qtdeTotal(qtdeTotal: number): void {
    this.item.quantidade = qtdeTotal;
  }

  suggestToogle(quantitativo): void {
    if (!quantitativo.liberarQuantitativo) {
      this.suggestHide = !this.suggestHide;
    }
  }
}
