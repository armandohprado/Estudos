import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CcGrupoQuery } from '../state/grupos/cc-grupo.query';
import { Observable } from 'rxjs';
import { CnGrupo } from '../../models/cn-grupo';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { trackByFactory } from '@aw-utils/track-by';
import {
  CompraNegociacaoGrupoFichaAprovador,
  CompraNegociacaoGrupoFichaArquivo,
  CompraNegociacaoGrupoFichaTipoAreaCausa,
  CompraNegociacaoGrupoTransacao,
} from '../../models/cn-mapa';

@Component({
  selector: 'app-visualizar-mapa-cn',
  templateUrl: './visualizar-mapa-cn.component.html',
  styleUrls: ['./visualizar-mapa-cn.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class VisualizarMapaCnComponent implements OnInit {
  constructor(
    private ccGruposQuery: CcGrupoQuery,
    private routerQuery: RouterQuery,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    public changeDetectorRef: ChangeDetectorRef
  ) {}
  grupo$: Observable<CnGrupo>;
  collapses = false;

  trackByGrupoTransacao = trackByFactory<CompraNegociacaoGrupoTransacao>('idCompraNegociacaoGrupoTransacao');
  trackByFichaTipoAreaCausa = trackByFactory<CompraNegociacaoGrupoFichaTipoAreaCausa>(
    'idCompraNegociacaoGrupoFichaTipoAreaCausa'
  );
  trackByGrupoFichaArquivo = trackByFactory<CompraNegociacaoGrupoFichaArquivo>('idCompraNegociacaoGrupoFichaArquivo');
  trackByCompraNegociacaoGrupoFichaAprovador = trackByFactory<CompraNegociacaoGrupoFichaAprovador>(
    'idCompraNegociacaoGrupoFichaAprovador'
  );

  ngOnInit(): void {
    this.grupo$ = this.ccGruposQuery.selectEntity(+this.routerQuery.getParams(RouteParamEnum.idCompraNegociacaoGrupo));
  }

  voltar(idCompraNegociacaoGrupo: number): void {
    this.router
      .navigate(['../../../'], {
        relativeTo: this.activatedRouter,
        queryParams: {
          [RouteParamEnum.idCompraNegociacaoGrupo]: idCompraNegociacaoGrupo,
        },
      })
      .then();
  }
}
