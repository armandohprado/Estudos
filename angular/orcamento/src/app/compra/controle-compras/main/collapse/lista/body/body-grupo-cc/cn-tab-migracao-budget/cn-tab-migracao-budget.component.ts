import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { CnGrupo } from '../../../../../../../models/cn-grupo';
import { CcGrupoService } from '../../../../../../state/grupos/cc-grupo.service';

@Component({
  selector: 'app-cn-tab-migracao-budget',
  templateUrl: './cn-tab-migracao-budget.component.html',
  styleUrls: [
    './cn-tab-migracao-budget.component.scss',
    '../tab-confirmacao-compra-cc/tab-confirmacao-compra-cc.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnTabMigracaoBudgetComponent implements OnInit {
  constructor(private ccGrupoService: CcGrupoService) {}

  @Input() grupo: CnGrupo;

  ngOnInit(): void {
    this.ccGrupoService
      .getMigracaoBudgetGruposTransferencia(
        this.grupo.idCompraNegociacao,
        this.grupo.idCompraNegociacaoGrupo,
        this.grupo.tipo
      )
      .subscribe();
    this.ccGrupoService.getMigracaoBudgetGruposResumo(this.grupo.idCompraNegociacaoGrupo).subscribe();
  }
}
