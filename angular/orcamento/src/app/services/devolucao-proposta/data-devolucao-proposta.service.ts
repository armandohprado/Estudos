import { Desconto } from '@aw-models/devolucao-proposta/desconto';
import { DevolucaoPropostaService, pegarTipo } from './devolucao-proposta.service';
import { Injectable } from '@angular/core';
import { map, share, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { PavimentoGeneric } from '@aw-models/devolucao-proposta/pavimento-dp-generic';
import { Item } from '@aw-models/devolucao-proposta/item';
import { Quantitativo } from '../../grupo/definicao-escopo/shared/de-distribuir-quantitativo/model/quantitativo';
import { SubFornecedor } from '@aw-models/devolucao-proposta/subfornecedor';
import { CabecalhoDevolucaoProposta } from '@aw-models/devolucao-proposta/cabecalho-devolucao-proposta';
import { Pavimento } from '@aw-models/devolucao-proposta/pavimento-dp';
import { environment } from '../../../environments/environment';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';
import { AdicionarOmisso, AtualizarItem, AtualizarQuantitativo } from '@aw-models/devolucao-proposta/atualizar-item';
import { refresh } from '@aw-utils/rxjs/operators';
import { AwHttpParams } from '@aw-utils/http-params';

@Injectable({ providedIn: 'root' })
export class DataDevolucaoPropostaService {
  constructor(private httpClient: HttpClient, private devolucaoProposta: DevolucaoPropostaService) {}

  target = `${environment.AwApiUrl}devolucao-propostas`;

  preencherCabecalho(
    idProposta: number,
    visaoNegociacao?: boolean,
    idCompraNegociacaoGrupoMapaFornecedor?: number
  ): Observable<CabecalhoDevolucaoProposta> {
    const params = new AwHttpParams({ visaoNegociacao, idCompraNegociacaoGrupoMapaFornecedor }, true);
    return this.httpClient
      .get<CabecalhoDevolucaoProposta>(`${this.target}/${idProposta}/condicoes-gerais`, { params })
      .pipe(
        tap(cabecalho => {
          this.devolucaoProposta.compartilharCabecalho(cabecalho);
        })
      );
  }

  salvarSupply(idProposta: number, idCompraNegociacaoGrupoMapaFornecedor: number): Observable<[boolean, boolean]> {
    const confirmacaoPropostaSMS = this.putCriarConfirmacaoPropostaSMS(
      idProposta,
      idCompraNegociacaoGrupoMapaFornecedor
    );
    const envioAprovacao = this.putAtualizarEnvioAprovacao(idCompraNegociacaoGrupoMapaFornecedor);
    return forkJoin([confirmacaoPropostaSMS, envioAprovacao]).pipe(refresh(this.preencherCabecalho(idProposta)));
  }

  getProposta(
    idProposta: number,
    visaoNegociacao?: boolean,
    idCompraNegociacaoGrupoMapaFornecedor?: number
  ): Observable<Pavimento> {
    const params = new AwHttpParams({ visaoNegociacao, idCompraNegociacaoGrupoMapaFornecedor }, true);
    return this.httpClient
      .get<Pavimento>(`${this.target}/${idProposta}/arvore-orcamento/primeiro-edificio`, { params })
      .pipe(map(mapPavimento));
  }

  preencherProposta(
    idProposta: number,
    visaoNegociacao?: boolean,
    idCompraNegociacaoGrupoMapaFornecedor?: number
  ): Observable<Pavimento> {
    const pavimento = this.getProposta(idProposta, visaoNegociacao, idCompraNegociacaoGrupoMapaFornecedor).pipe(
      tap(pavimentoTap => {
        this.devolucaoProposta.compartilharProposta(pavimentoTap);
      })
    );
    const cabecalho = this.preencherCabecalho(idProposta, visaoNegociacao, idCompraNegociacaoGrupoMapaFornecedor);
    return forkJoin([pavimento, cabecalho]).pipe(
      map(([pav]) => {
        return pav;
      }),
      tap(proposta => {
        this.devolucaoProposta.edificioSelecionado = proposta.edificios[0]?.idEdificio;
      })
    );
  }

  atualizarProposta(idProposta: number, pavimento: PavimentoGeneric, item): Observable<Pavimento> {
    return this.getProposta(idProposta).pipe(
      map(pav => {
        const tipo = pegarTipo(pavimento);
        pav = {
          ...pav,
          [tipo]: pav[tipo].map(dp => {
            if (dp.idProjetoEdificioPavimento === item.idProjetoEdificioPavimento) {
              dp = {
                ...dp,
                open: true,
                itens: dp.itens.map(oldItem => {
                  if (oldItem.idPropostaItem === item.idPropostaItem) {
                    oldItem = {
                      ...oldItem,
                      open: true,
                    };
                    if (item.exibirCamposDesconto) {
                      oldItem = {
                        ...oldItem,
                        exibirCamposDesconto: true,
                      };
                    }
                  }
                  return oldItem;
                }),
              };
            }
            return dp;
          }),
        };
        return pav;
      }),
      tap(pav => {
        this.devolucaoProposta.compartilharProposta(pav);
      })
    );
  }

  preencherQuantitativo(idPropostaItem: number): Observable<Quantitativo> {
    return this.httpClient
      .get<Quantitativo>(`${this.target}/proposta-itens/${idPropostaItem}/preenchimento-quantitativo`)
      .pipe(map(mapQuantitativo));
  }

  preencherQuantitativoItemOmisso(idProposta: number): Observable<Quantitativo> {
    return this.httpClient
      .get<Quantitativo>(`${this.target}/${idProposta}/preenchimento-quantitativo`)
      .pipe(map(mapQuantitativo));
  }

  atualizarQuantitativoOmisso(idProposta: number, data: any): Observable<Quantitativo> {
    return this.httpClient.post<Quantitativo>(`${this.target}/${idProposta}/inclusao-omisso`, data);
  }

  putCriarConfirmacaoPropostaSMS(
    idProposta: number,
    idCompraNegociacaoGrupoMapaFornecedor: number
  ): Observable<boolean> {
    return this.httpClient.put<boolean>(
      `${this.target}/${idProposta}/fornecedores/${idCompraNegociacaoGrupoMapaFornecedor}`,
      {}
    );
  }

  putAtualizarEnvioAprovacao(idCompraNegociacaoGrupoMapaFornecedor: number): Observable<boolean> {
    return this.httpClient.put<boolean>(
      `${this.target}/mapas/fornecedores/${idCompraNegociacaoGrupoMapaFornecedor}/envio-aprovacao`,
      {}
    );
  }

  atualizarQuantitativo(idPropostaItem: number, data: [AtualizarQuantitativo]): Observable<number[]> {
    return this.httpClient.put<number[]>(
      `${this.target}/proposta-itens/${idPropostaItem}/atualizar-quantitativo`,
      data
    );
  }

  pegarDescontos(idProposta: number): Observable<Desconto[]> {
    return this.httpClient.get<Desconto[]>(`${this.target}/${idProposta}/calculadora-descontos`).pipe(share());
  }

  pegarSubfornecedoresProposta(idProposta: number): Observable<SubFornecedor[]> {
    return this.httpClient.get<SubFornecedor[]>(`${this.target}/${idProposta}/subfornecedores`).pipe(
      map(subfornecedores =>
        subfornecedores.map(subfornecedor => ({
          ...subfornecedor,
          nomeCnpj: `${subfornecedor.nomeFantasia ?? subfornecedor.razaoSocial} - ${subfornecedor.cnpj}`,
        }))
      ),
      tap(subfornecedor => {
        this.devolucaoProposta.compartilharFornecedores(subfornecedor);
      })
    );
  }

  atualizarDescontos(form, idProposta): Observable<any> {
    return this.httpClient.put(`${this.target}/${idProposta}/aplicacao-descontos`, form);
  }

  atualizarPavimento(form: AtualizarItem, idPropostaItem): Observable<Item> {
    return this.httpClient.put<Item>(`${this.target}/proposta-itens/${idPropostaItem}/desconto`, form);
  }

  atualizarStatusPavimento(idPropostaItemStatus, idItem): Observable<any> {
    return this.httpClient.put(`${this.target}/proposta-itens/${idItem}/status`, idPropostaItemStatus);
  }

  pegarCentroCusto(idProjeto): Observable<any> {
    return this.httpClient.get<any[]>(`${environment.AwApiUrl}/centro-custos/${idProjeto}`);
  }

  pegarFase(idProposta): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.target}/${idProposta}/fases/`);
  }

  adicionarItemOmisso(form: AdicionarOmisso, idProposta): Observable<Item> {
    return this.httpClient.post<Item>(`${this.target}/${idProposta}/inclusao-omisso`, form);
  }
}

export const mapQuantitativo = (quantitativo: Quantitativo): Quantitativo => {
  return {
    ...quantitativo,
    fases: (quantitativo.fases ?? []).map(fase => ({
      ...fase,
      sites: orderBy(fase.sites ?? [], 'ordem'),
      edificios: orderBy(fase.edificios ?? [], 'ordem'),
      andares: orderBy(fase.andares ?? [], 'ordem'),
    })),
  };
};

export const mapItens = <T extends PavimentoGeneric>(pavimentos: T[]): T[] => {
  return orderBy(pavimentos, 'ordem').map(pavimento => ({
    ...pavimento,
    omissos: orderBy<Item>(pavimento.itens ?? [], orderByCodigo('numeracao'))
      .filter(val => val.idOrcamentoGrupoItem === 0)
      .map(omisso => ({ ...omisso, omisso: true })),
    itens: orderBy<Item>(pavimento.itens ?? [], orderByCodigo('numeracao')).filter(val => val.idOrcamentoGrupoItem > 0),
  }));
};

export const mapPavimento = (pavimento: Pavimento): Pavimento => {
  return {
    ...pavimento,
    andares: mapItens(pavimento.andares ?? []),
    edificios: mapItens(pavimento.edificios ?? []),
    sites: mapItens(pavimento.sites ?? []),
  };
};
