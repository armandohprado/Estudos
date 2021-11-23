import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FasesListaProposta, InformacaoProposta, PropostaItem } from './models/excel';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';
import { map } from 'rxjs/operators';

let id = 0;

@Injectable({
  providedIn: 'root',
})
export class ExcelDefinirValoresService {
  targetDevolucaoProposta = `${environment.AwApiUrl}devolucao-propostas`;
  target = `${environment.AwApiUrl}`;
  constructor(private httpClient: HttpClient) {}

  getListaProposta(idProposta: number, idPavimento: number): Observable<FasesListaProposta[]> {
    return this.httpClient
      .get<FasesListaProposta[]>(
        `${this.targetDevolucaoProposta}/${idProposta}/pavimento/${idPavimento}/arvore-orcamento`
      )
      .pipe(
        map(fases => {
          return fases.map(fase => {
            const idFaseTemp = id++;
            return {
              ...fase,
              listaPropostas: fase.listaPropostas.map(lista => {
                const idAmbienteTemp = id++;
                const itens = orderBy(lista.itens, orderByCodigo<PropostaItem>('sequencia')).map(item => ({
                  ...item,
                  descricao: item.descricao.replace(/<br>/gi, '\n'),
                  sequencia: item.tag ? item.sequencia + '\n' + item.tag : item.sequencia,
                  idAmbienteTemp,
                  idFaseTemp,
                }));
                return { ...lista, itens, idAmbienteTemp };
              }),
              liberarQuantitativo: fase.listaPropostas.some(lista =>
                lista.itens.some(item => item.liberarQuantitativoReferencia)
              ),
              idFaseTemp,
            };
          });
        })
      );
  }

  getInformacaoProposta(idProposta: number, idPavimento: number): Observable<InformacaoProposta> {
    return this.httpClient.get<InformacaoProposta>(
      `${this.targetDevolucaoProposta}/${idProposta}/pavimento/${idPavimento}/informacoes`
    );
  }
}
