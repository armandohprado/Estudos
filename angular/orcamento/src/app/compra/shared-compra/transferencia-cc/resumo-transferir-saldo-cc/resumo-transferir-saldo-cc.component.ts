import { Component, Input, OnInit } from '@angular/core';
import { GruposTransferenciaCC } from '../../../../models/transferencia-cc';
import { trackByFactory } from '../../../../utils/track-by';

@Component({
  selector: 'app-resumo-transferir-saldo-cc',
  templateUrl: './resumo-transferir-saldo-cc.component.html',
  styleUrls: [
    '../../../../orcamento/planilha-vendas-hibrida/transferir-saldo-contrato/modal-transferir-saldo-cc/transferir-saldo-cc.component.scss',
  ],
})
export class ResumoTransferirSaldoCcComponent implements OnInit {
  constructor() {}
  @Input() listaGrupo: GruposTransferenciaCC[];
  @Input() readonly: boolean;
  trackByGrupo = trackByFactory<GruposTransferenciaCC>('idCompraNegociacaoGrupo');
  ngOnInit(): void {}
}
