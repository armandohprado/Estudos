import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { PlanoCompraQuestao } from '@aw-models/plano-compra-questao';
import { PlanoComprasService } from '../../plano-compras/state/plano-compras/plano-compras.service';
import { Observable } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { tap } from 'rxjs/operators';
import { CcGrupoService } from '../state/grupos/cc-grupo.service';

@Injectable({ providedIn: 'root' })
export class CnPlanoCompraQuestoesResolver implements Resolve<PlanoCompraQuestao[]> {
  constructor(private planoComprasService: PlanoComprasService, private ccGrupoService: CcGrupoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<PlanoCompraQuestao[]> | Promise<PlanoCompraQuestao[]> | PlanoCompraQuestao[] {
    const idCompraNegociacaoGrupo = +route.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupo);
    return this.planoComprasService.getQuestoes().pipe(
      tap(planoCompraQuestoes => {
        this.ccGrupoService.updateGrupo(idCompraNegociacaoGrupo, { planoCompraQuestoes });
      })
    );
  }
}
