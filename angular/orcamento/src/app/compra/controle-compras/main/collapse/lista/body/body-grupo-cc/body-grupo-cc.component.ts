import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { CnGrupo, CnGruposTabsEnum } from '../../../../../../models/cn-grupo';
import { CcGrupoService } from '../../../../../state/grupos/cc-grupo.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { CnGrupoStatusEnum } from '../../../../../../models/cn-grupo-status.enum';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-body-grupo-cc',
  templateUrl: './body-grupo-cc.component.html',
  styleUrls: ['./body-grupo-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyGrupoCcComponent {
  constructor(public ccGrupoService: CcGrupoService) {}

  @Input() grupo: CnGrupo;
  @ViewChild('tabset') tabset: TabsetComponent;

  cnGruposTabsEnum = CnGruposTabsEnum;
  cnGrupoStatus = CnGrupoStatusEnum;

  statusConfirmacaoCompra = [
    CnGrupoStatusEnum.EmitirCC,
    CnGrupoStatusEnum.CCEmAprovacao,
    CnGrupoStatusEnum.CCReprovada,
    CnGrupoStatusEnum.GrupoEncerrado,
    CnGrupoStatusEnum.SaldoEmGrupo,
    CnGrupoStatusEnum.AguardandoCentralEEmitirCC,
  ];

  mudarAba(tab: CnGruposTabsEnum): void {
    this.ccGrupoService.updateTabs(this.grupo, tab);
    if (tab === CnGruposTabsEnum.CompraNegociacao) {
      const tipo = 'collapseMapa';
      this.ccGrupoService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, { loadingCompraNegociacaoTab: true });
      this.ccGrupoService
        .getMapaAtual(this.grupo.idCompraNegociacaoGrupo)
        .pipe(
          tap(() => {
            this.ccGrupoService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, {
              [tipo]: !!this.grupo[tipo],
              loadingCompraNegociacaoTab: false,
            });
          })
        )
        .subscribe();
    }
  }
}
