import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FamiliaTransacao, GrupaoTransacao, GrupoTransacao, Transacao } from '../../models/transacao';
import { trackByFactory } from '../../../../utils/track-by';

@Component({
  selector: 'app-ph-co-transacoes',
  templateUrl: './ph-co-transacoes.component.html',
  styleUrls: ['./ph-co-transacoes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhCoTransacoesComponent implements OnInit {
  constructor() {}

  @Input() transacoes: FamiliaTransacao[];
  @Input() trasacoesCC = false;
  trackByFamilia = trackByFactory<FamiliaTransacao>('idOrcamentoFamilia', 'idFamilia', 'idFamiliaCustomizada');
  trackByGrupao = trackByFactory<GrupaoTransacao>('idGrupao');
  trackByGrupo = trackByFactory<GrupoTransacao>('idGrupo');
  trackByTransacao = trackByFactory<Transacao>('idCompraNegociacaoGrupoTransacao');

  ngOnInit(): void {}
}
