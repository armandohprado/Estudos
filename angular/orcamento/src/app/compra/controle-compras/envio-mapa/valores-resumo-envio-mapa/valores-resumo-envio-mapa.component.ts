import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CnGrupo, CnTipoGrupoEnum } from '../../../models/cn-grupo';
import { CcGrupoService } from '../../state/grupos/cc-grupo.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CcGrupoQuery } from '../../state/grupos/cc-grupo.query';
import { CnEnvioMapaPayload } from '../../../models/cn-mapa';
import { ControleComprasQuery } from '../../state/controle-compras/controle-compras.query';

@Component({
  selector: 'app-valores-resumo-envio-mapa',
  templateUrl: './valores-resumo-envio-mapa.component.html',
  styleUrls: ['./valores-resumo-envio-mapa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValoresResumoEnvioMapaComponent {
  constructor(
    public ccGruposService: CcGrupoService,
    private routerQuery: RouterQuery,
    private ccGruposQuery: CcGrupoQuery,
    private controleComprasQuery: ControleComprasQuery
  ) {}
  tipoGrupo = CnTipoGrupoEnum;
  readonly origemCompraLista$ = this.controleComprasQuery.tiposFicha$;
  fornecedoresSelecionados$ = this.routerQuery
    .selectParams(RouteParamEnum.idCompraNegociacaoGrupo)
    .pipe(this.ccGruposQuery.selectFornecedorSelecionadosOperator());

  @Input() grupo: CnGrupo;
  @Input() mapa: CnEnvioMapaPayload;
}
