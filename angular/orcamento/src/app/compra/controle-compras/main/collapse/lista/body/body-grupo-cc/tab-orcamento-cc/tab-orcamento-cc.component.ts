import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CnGrupo } from '../../../../../../../models/cn-grupo';
import { PlanoComprasService } from '../../../../../../../plano-compras/state/plano-compras/plano-compras.service';
import { CcGrupoService } from '../../../../../../state/grupos/cc-grupo.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { GrupoAlt } from '@aw-models/grupo-alt';

@Component({
  selector: 'app-tab-orcamento-cc',
  templateUrl: './tab-orcamento-cc.component.html',
  styleUrls: ['./tab-orcamento-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabOrcamentoCcComponent {
  constructor(
    public router: Router,
    private planoComprasService: PlanoComprasService,
    private ccGruposService: CcGrupoService,
    private activatedRoute: ActivatedRoute
  ) {}

  readonly idProjeto = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idProjeto);

  @Input() grupoOrcamento: GrupoAlt;
  @Input() grupo: CnGrupo;

  onComentarioChange($event: string): void {
    this.planoComprasService.putComentario('' + this.grupo.idPlanoCompraGrupo, $event);
  }

  onPropostaSelecionada(): void {
    this.ccGruposService.getAllFlags(this.grupo.idCompraNegociacaoGrupo).subscribe();
  }
}
