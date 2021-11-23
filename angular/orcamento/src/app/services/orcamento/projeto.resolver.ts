import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Projeto, ProjetoAlt } from '../../models';
import { OrcamentoService } from './orcamento.service';
import { Observable, of } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { tap } from 'rxjs/operators';
import { isBefore } from 'date-fns';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Injectable({ providedIn: 'root' })
export class ProjetoResolver implements Resolve<Projeto> {
  constructor(private orcamentoService: OrcamentoService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Projeto> | Promise<Projeto> | Projeto {
    return this.orcamentoService.retrieveProject(+route.paramMap.get(RouteParamEnum.idProjeto));
  }
}

@Injectable({ providedIn: 'root' })
export class ProjetoResolverWithCache implements Resolve<Projeto> {
  constructor(private orcamentoService: OrcamentoService) {}

  cacheTTL: Date;

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Projeto> | Promise<Projeto> | Projeto {
    const projetoStored = this.orcamentoService.projeto$.value;
    if (this.cacheTTL && projetoStored?.idProjeto) {
      const now = new Date();
      const lastCall = this.cacheTTL;
      if (isBefore(now, lastCall)) {
        return of(projetoStored);
      }
    }
    return this.orcamentoService.retrieveProject(+route.paramMap.get(RouteParamEnum.idProjeto)).pipe(
      tap(() => {
        this.cacheTTL = new Date(new Date().getTime() + 900_000);
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class ProjetoResolverIncludeExisteCompras implements Resolve<Projeto> {
  constructor(private orcamentoService: OrcamentoService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Projeto> | Promise<Projeto> | Projeto {
    return this.orcamentoService.retrieveProject(+route.paramMap.get(RouteParamEnum.idProjeto), true);
  }
}

@Injectable({ providedIn: 'root' })
export class ProjetoAltResolver implements Resolve<ProjetoAlt> {
  constructor(private projetoService: ProjetoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ProjetoAlt> | Promise<ProjetoAlt> | ProjetoAlt {
    const idProjeto = +route.paramMap.get(RouteParamEnum.idProjeto);
    return this.projetoService.get(idProjeto);
  }
}
