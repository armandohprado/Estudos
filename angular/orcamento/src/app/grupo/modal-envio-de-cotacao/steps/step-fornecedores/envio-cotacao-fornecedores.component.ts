import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Fornecedor, GrupoAlt } from '../../../../models';
import { map } from 'rxjs/operators';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import { trackByFactory } from '@aw-utils/track-by';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { isFunction } from 'lodash-es';
import { collapseAnimation } from '@aw-shared/animations/collapse';

@Component({
  selector: 'app-envio-cotacao-fornecedores',
  templateUrl: './envio-cotacao-fornecedores.component.html',
  styleUrls: ['./envio-cotacao-fornecedores.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class EnvioCotacaoFornecedoresComponent {
  constructor(public envioDeCotacaoService: EnvioDeCotacaoService) {}

  private _fornecedores$ = new BehaviorSubject<Fornecedor[]>([]);
  private _fornecedoresWithoutDisabled$ = this._fornecedores$.pipe(
    map(fornecedores => fornecedores.filter(fornecedor => !fornecedor.fornecedorDisabledEnvioCotacao))
  );

  @Input() grupo: GrupoAlt;
  @Input() idFornecedorAtual: number;
  @Input() reenvio: boolean;
  @Input()
  set fornecedores(fornecedores: Fornecedor[]) {
    this._fornecedores$.next(fornecedores ?? []);
  }
  @Output() readonly fornecedoresChange = new EventEmitter<Fornecedor[]>();

  readonly trackByFornecedor = trackByFactory<Fornecedor>('idFornecedor');
  readonly fornecedores$ = this._fornecedores$.asObservable();
  readonly allSelected$ = this._fornecedoresWithoutDisabled$.pipe(
    map(fornecedores => fornecedores.every(fornecedor => fornecedor.selected))
  );
  readonly indeterminate$ = combineLatest([this.allSelected$, this._fornecedoresWithoutDisabled$]).pipe(
    map(([allSelected, fornecedores]) => !allSelected && fornecedores.some(fornecedor => fornecedor.selected))
  );

  changeStep(step: number): void {
    this.envioDeCotacaoService.changeStep(step);
  }

  selectAll($event: boolean): void {
    this.updateFornecedor(
      fornecedor => !fornecedor.fornecedorDisabledEnvioCotacao,
      fornecedor => ({
        ...fornecedor,
        selected: $event,
        idContatoFornecedor: fornecedor.idContatoFornecedor ?? fornecedor.contatos[0]?.idContato,
      })
    );
  }

  toggleFornecedor(idFornecedor: number): void {
    this.updateFornecedor(idFornecedor, fornecedor => {
      fornecedor = { ...fornecedor, selected: !fornecedor.selected };
      if (fornecedor.selected) {
        fornecedor = { ...fornecedor, idContatoFornecedor: fornecedor.contatos[0]?.idContato };
      }
      return fornecedor;
    });
  }

  updateFornecedor(
    idFornecedor: number | ((fornecedor: Fornecedor) => boolean),
    partial: Partial<Fornecedor> | ((fornecedor: Fornecedor) => Fornecedor)
  ): void {
    const predicate = isFunction(idFornecedor)
      ? idFornecedor
      : (fornecedor: Fornecedor) => fornecedor.idFornecedor === idFornecedor;
    const callback = isFunction(partial) ? partial : (fornecedor: Fornecedor) => ({ ...fornecedor, ...partial });
    this.fornecedoresChange.emit(
      [...this._fornecedores$.value].map(fornecedor => {
        if (predicate(fornecedor)) {
          fornecedor = callback(fornecedor);
        }
        return fornecedor;
      })
    );
  }
}
