import { Component, OnInit, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { CadernoConfiguracaoColunasTipo } from '@aw-models/cadernos/caderno';

@Component({
  selector: 'app-orcamento-filtro-colunas',
  templateUrl: './orcamento-filtro-colunas.component.html',
  styleUrls: ['./orcamento-filtro-colunas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrcamentoFiltroColunasComponent implements OnInit {
  constructor() {}

  @Input() colunas: CadernoConfiguracaoColunasTipo[];
  @Output() selecionado = new EventEmitter<{ event: any; value: string }>();

  ngOnInit(): void {}

  output(
    $event: boolean,
    value:
      | 'exibeValorUnitarioProduto'
      | 'exibeDescontoProduto'
      | 'exibeValorUnitarioServico'
      | 'exibeDescontoServico'
      | 'exibeValorUnitarioProdutoServico'
      | 'exibeValorTotal'
  ): void {
    this.selecionado.emit({ event: $event, value });
  }
}
