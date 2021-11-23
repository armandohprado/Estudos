import { Injectable } from '@angular/core';
import { GrupoAlt } from '../../models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GenericResponse } from '../definicao-escopo/model/generic-response';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import { AwHttpParams } from '@aw-utils/http-params';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

@Injectable({ providedIn: 'root' })
export class DefinicaoEscopoLojaService {
  constructor(
    private http: HttpClient,
    private envioDeCotacaoService: EnvioDeCotacaoService,
    private orcamentoAltService: OrcamentoAltService
  ) {}

  target = environment.AwApiUrl + 'definicao-escopo-loja';

  getRequestsClose(
    idProjeto: number,
    idOrcamento: number,
    grupo: GrupoAlt,
    enviarCotacao: boolean,
    reenvio: boolean,
    isControleCompras = false
  ): Observable<void | GrupoAlt> {
    if (enviarCotacao) {
      return this.envioDeCotacaoService.envioCotacaoLoja(
        idProjeto,
        idOrcamento,
        grupo,
        reenvio,
        undefined,
        isControleCompras
      );
    }
    return this.orcamentoAltService.getGrupo(idOrcamento, grupo.idOrcamentoCenario, grupo.idOrcamentoGrupo);
  }

  deleteProduto(idOrcamentoGrupoItemProdutoCatalogo: number): Observable<GenericResponse> {
    const params = new AwHttpParams({ idOrcamentoGrupoItemProdutoCatalogo });
    return this.http.delete<GenericResponse>(
      `${this.target}/orcamento-grupo-itens/orcamento-grupo-item-produto-catalogo/exclusao`,
      { params }
    );
  }
}
