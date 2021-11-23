import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CcGrupoService } from '../../state/grupos/cc-grupo.service';
import { ContatoAlt } from '@aw-models/index';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { FornecedorService } from '@aw-services/orcamento/fornecedor.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EmitirCcContatosFornecedorResolver implements Resolve<ContatoAlt[]> {
  constructor(private ccGruposService: CcGrupoService, private fornecedorService: FornecedorService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ContatoAlt[]> | Promise<ContatoAlt[]> | ContatoAlt[] {
    const idCompraNegociacaoGrupo = +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
    const idFornecedor = +route.paramMap.get(RouteParamEnum.idFornecedor);
    return this.fornecedorService.getContatos(idFornecedor).pipe(
      tap(confirmacaoCompraContatos => {
        this.ccGruposService.updateGrupo(idCompraNegociacaoGrupo, { confirmacaoCompraContatos });
      })
    );
  }
}
