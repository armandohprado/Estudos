import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EpFornecedor } from '../model/fornecedor';
import { switchMap } from 'rxjs/operators';
import { EpPropostaItemQuery } from '../state/item/ep-proposta-item.query';
import { EqualizacaoPropostaService } from '../equalizacao-proposta.service';
import { BehaviorSubject } from 'rxjs';
import { filterNilValue } from '@datorama/akita';

@Component({
  selector: 'app-ep-header-total',
  templateUrl: './ep-header-total.component.html',
  styleUrls: ['./ep-header-total.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'item' },
})
export class EpHeaderTotalComponent {
  constructor(
    public epPropostaItemQuery: EpPropostaItemQuery,
    private equalizacaoPropostaService: EqualizacaoPropostaService
  ) {}

  private readonly _fornecedor$ = new BehaviorSubject<EpFornecedor | null>(null);
  private _fornecedor: EpFornecedor;

  @Input() idOrcamentoGrupo: number;
  @Input() idOrcamentoCenario: number;
  @Input()
  get fornecedor(): EpFornecedor {
    return this._fornecedor;
  }
  set fornecedor(fornecedor: EpFornecedor) {
    this._fornecedor = fornecedor;
    this._fornecedor$.next(fornecedor);
  }

  fornecedor$ = this._fornecedor$.pipe(filterNilValue());
  total$ = this.fornecedor$.pipe(
    switchMap(fornecedor => this.epPropostaItemQuery.selectTotalFornecedor(fornecedor.idFornecedor))
  );
  allItensSelected$ = this.fornecedor$.pipe(
    switchMap(fornecedor => this.epPropostaItemQuery.selectAllItensSelected(fornecedor.idFornecedor))
  );

  selecionarTodos(allItensSelected: boolean): void {
    this.equalizacaoPropostaService
      .selecionarTodos(
        this.idOrcamentoGrupo,
        this._fornecedor.idFornecedor,
        this._fornecedor.idProposta,
        this.idOrcamentoCenario,
        !allItensSelected
      )
      .subscribe();
  }
}
