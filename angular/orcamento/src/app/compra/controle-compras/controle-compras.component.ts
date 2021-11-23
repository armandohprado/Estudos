import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CcGrupoService } from './state/grupos/cc-grupo.service';
import { ActivatedRoute } from '@angular/router';
import { isNil } from 'lodash-es';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ControleComprasService } from './state/controle-compras/controle-compras.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { forkJoin, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { CcGrupoQuery } from './state/grupos/cc-grupo.query';

interface ControleComprasComponentRouteParams {
  idOrcamento: number;
  idOrcamentoCenario: number;
  idProjeto: number;
}

@Component({
  selector: 'app-controle-compras',
  templateUrl: './controle-compras.component.html',
  styleUrls: ['./controle-compras.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControleComprasComponent {
  constructor(
    private ccGruposService: CcGrupoService,
    private activatedRoute: ActivatedRoute,
    private controleComprasService: ControleComprasService,
    private ccGruposQuery: CcGrupoQuery
  ) {
    this._initDev();
  }

  params$: Observable<ControleComprasComponentRouteParams> = this.activatedRoute.paramMap.pipe(
    map(paramMap => ({
      idOrcamento: +paramMap.get(RouteParamEnum.idOrcamento),
      idOrcamentoCenario: +paramMap.get(RouteParamEnum.idOrcamentoCenario),
      idProjeto: +paramMap.get(RouteParamEnum.idProjeto),
    })),
    shareReplay()
  );

  get idOrcamentoCenario(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  }

  private _initDev(): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
      const diretoOpenedParam = queryParamMap.get('diretoOpened');
      let open$: Observable<any> = of(null);
      if (!isNil(diretoOpenedParam) && coerceBooleanProperty(diretoOpenedParam)) {
        open$ = this.controleComprasService.collapseDireto(false, this.idOrcamentoCenario);
      }
      const refaturadoOpenedParam = queryParamMap.get('refaturadoOpened');
      if (!isNil(refaturadoOpenedParam) && coerceBooleanProperty(refaturadoOpenedParam)) {
        open$ = this.controleComprasService.collapseRefaturado(false, this.idOrcamentoCenario);
      }
      const openGrupoParam = queryParamMap.get('openGrupo');
      const idCompraNegociacaoGrupoParam = queryParamMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
      if (!isNil(openGrupoParam) && coerceBooleanProperty(openGrupoParam) && !isNil(idCompraNegociacaoGrupoParam)) {
        open$ = open$.pipe(
          switchMap(() => {
            const grupo = this.ccGruposQuery.getEntity(+idCompraNegociacaoGrupoParam);
            return this.ccGruposService.toggleCollapse(grupo);
          })
        );
      }
      const openAllParam = queryParamMap.get('openAllGrupos');
      if (!isNil(openAllParam) && coerceBooleanProperty(openAllParam)) {
        open$ = open$.pipe(
          switchMap(() => {
            const grupos = this.ccGruposQuery.getAll();
            return forkJoin(grupos.map(grupo => this.ccGruposService.toggleCollapse(grupo)));
          })
        );
      }
      open$.subscribe();
    }
  }
}
