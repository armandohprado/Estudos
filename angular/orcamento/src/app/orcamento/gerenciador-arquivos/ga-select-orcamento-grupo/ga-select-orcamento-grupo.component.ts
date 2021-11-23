import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AwRouterQuery } from '../../../services/core/router.query';
import { RouteParamEnum } from '../../../models/route-param.enum';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { GaGrupoOrcamento } from '../model/grupo-orcamento';
import { trackByFactory } from '../../../utils/track-by';

@Component({
  selector: 'app-ga-select-orcamento-grupo',
  templateUrl: './ga-select-orcamento-grupo.component.html',
  styleUrls: ['./ga-select-orcamento-grupo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaSelectOrcamentoGrupoComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private gerenciadorArquivosService: GerenciadorArquivosService,
    private routerQuery: AwRouterQuery
  ) {}

  grupos$ = this.gerenciadorArquivosService.gruposOrcamento$.pipe(
    filter(grupos => !!grupos?.length),
    tap(grupos => {
      if (!this.routerQuery.getParams(RouteParamEnum.idOrcamentoGrupo)) {
        this.onSelect(grupos[0].id);
      }
    })
  );

  idOrcamentoGrupo$ = this.routerQuery.selectParams(RouteParamEnum.idOrcamentoGrupo).pipe(
    distinctUntilChanged(),
    filter(idOrcamentoGrupo => !!idOrcamentoGrupo),
    map(Number)
  );

  trackBy = trackByFactory<GaGrupoOrcamento>('id');

  onSelect(idOrcamentoGrupo: number): void {
    this.router.navigate([idOrcamentoGrupo], { relativeTo: this.activatedRoute, queryParamsHandling: 'merge' }).then();
  }

  ngOnInit(): void {}
}
