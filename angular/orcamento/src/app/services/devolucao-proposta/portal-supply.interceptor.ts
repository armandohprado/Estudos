import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '../../models/route-param.enum';
import { isNil } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class PortalSupplyInterceptor implements HttpInterceptor {
  constructor(private routerQuery: RouterQuery) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.includes('devolucao-proposta')) {
      return next.handle(request);
    }
    const requestClone = request.clone();

    let params = requestClone.params ?? new HttpParams();
    const visaoNegociacao = this.routerQuery.getData(RouteParamEnum.supply);
    const idCompraNegociacaoGrupoMapaFornecedor = this.routerQuery.getParams(
      RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor
    );
    if (!params.has(RouteParamEnum.visaoNegociacao) && !isNil(visaoNegociacao)) {
      params = params.set(RouteParamEnum.visaoNegociacao, visaoNegociacao + '');
    }
    if (!params.has(RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor) && idCompraNegociacaoGrupoMapaFornecedor) {
      params = params.set(
        RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor,
        this.routerQuery.getParams(RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor)
      );
    }
    return next.handle(requestClone.clone({ params }));
  }
}
