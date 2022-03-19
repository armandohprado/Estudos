import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CnConfirmacaoCompraFornecedor } from '../../../../../../../../models/cn-confirmacao-compra';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { trackByFactory } from '@aw-utils/track-by';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { FornecedorService } from '@aw-services/orcamento/fornecedor.service';
import { CurrencyMaskInputMode } from 'ngx-currency';

export enum TipoListaEmitirCcEnum {
  Fornecedores = 'Fornecedores',
  Miscellaneous = 'Miscellaneous',
  Revenda = 'Revenda',
}

export interface ListaEmitirCcItemChangeEvent {
  index: number;
  item: CnConfirmacaoCompraFornecedor;
}

@Component({
  selector: 'app-lista-emitir-cc',
  templateUrl: './lista-emitir-cc.component.html',
  styleUrls: ['./lista-emitir-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaEmitirCcComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  @Input() tipo: TipoListaEmitirCcEnum;
  @Input() lista: CnConfirmacaoCompraFornecedor[] = [];
  @Input() idCompraNegociacaoGrupo: number;
  @Input() permitidoEmitirCcSemMapa: boolean;
  @Input() grupoTaxa: boolean;
  @Input() emitirCcDisabled: boolean;
  @Input() haTransacoesPendentes: boolean;
  @Input() centralCompras: boolean;
  @Input() confirmacaoCompraSaldoRevenda: number;

  @Output() readonly itemChange = new EventEmitter<ListaEmitirCcItemChangeEvent>();

  readonly tipoListaEmitirCcEnum = TipoListaEmitirCcEnum;
  readonly currencyMaskInputMode = CurrencyMaskInputMode;

  readonly trackBy = trackByFactory<CnConfirmacaoCompraFornecedor>(
    'idCompraNegociacaoGrupoConfirmacaoCompra',
    'idCompraNegociacaoGrupoMapaFornecedor'
  );

  navigateToEmitirCc(
    { idCompraNegociacaoGrupoMapaFornecedor, idFornecedor }: CnConfirmacaoCompraFornecedor,
    index: number
  ): void {
    idFornecedor = idFornecedor > 0 ? idFornecedor : FornecedorService.idFornecedorAw;
    const queryParams: Params = {};
    let path: string | number;
    if (this.tipo === TipoListaEmitirCcEnum.Revenda) {
      path = 'revenda';
      queryParams[RouteParamEnum.index] = index;
    } else if (this.tipo === TipoListaEmitirCcEnum.Miscellaneous) {
      path = 'miscellaneous';
      queryParams[RouteParamEnum.index] = index;
    } else if (this.grupoTaxa) {
      path = 'grupo-taxa';
    } else if (this.permitidoEmitirCcSemMapa || !this.centralCompras) {
      path = 'sem-mapa';
    } else {
      path = idCompraNegociacaoGrupoMapaFornecedor;
    }
    this.router
      .navigate([this.idCompraNegociacaoGrupo, 'emitir-cc', 'fornecedor', idFornecedor, path], {
        queryParams,
        relativeTo: this.activatedRoute,
      })
      .then();
  }

  onValorTotalNegociacaoChange(index: number, item: CnConfirmacaoCompraFornecedor, $event: number): void {
    this.itemChange.emit({ index, item: { ...item, valorTotalNegociado: $event || 0 } });
  }
}
