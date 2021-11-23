import { trackByFactory } from '@aw-utils/track-by';
import { EpPropostaItem } from './model/item';
import { EpFornecedor, EpFornecedorBase, EpFornecedorResponse } from './model/fornecedor';
import {
  EpOrcamentoGrupoItemQuantitativoFase,
  EpPropostaItemQuantitativoItem,
  EpPropostaItemQuantitativoNivel,
} from './model/item-quantitativo';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';

/**
 * @description retorna o valor total de um item
 */
export function epPropostaItemGetValorTotal({
  quantidadeItens,
  valorUnitarioServicoPropostaItem,
  valorUnitarioProdutoPropostaItem,
}: EpPropostaItem): number {
  return (valorUnitarioServicoPropostaItem + valorUnitarioProdutoPropostaItem) * quantidadeItens;
}

/**
 * @description retorna o valor total de varios itens
 */
export function epPropostaItemSumValorTotal(itens: EpPropostaItem[]): number {
  return itens.reduce((acc, item) => acc + epPropostaItemGetValorTotal(item), 0);
}

export const trackByEpPropostaItem = trackByFactory<EpPropostaItem>('idPropostaItem');
export const trackByEpFornecedor = trackByFactory<EpFornecedor>('idFornecedor');
export const trackByEpPropostaItemQuantitativoItem = trackByFactory<EpPropostaItemQuantitativoItem>('id');

/**
 * @description ordena os fornecedores na seguinte ordem: aw referencia, aw estimado e depois os outros por idFornecedor
 */
export function orderEpFornecedor<T extends EpFornecedorBase>(array: T[]): T[] {
  return [...array].sort((fornecedorA, fornecedorB) => {
    if (fornecedorA.indicadorAWReferencia !== fornecedorB.indicadorAWReferencia) {
      return +fornecedorB.indicadorAWReferencia - +fornecedorA.indicadorAWReferencia;
    }
    if (fornecedorA.indicadorAWEstimado !== fornecedorB.indicadorAWEstimado) {
      return +fornecedorB.indicadorAWEstimado - +fornecedorA.indicadorAWEstimado;
    }
    return fornecedorA.idFornecedor - fornecedorB.idFornecedor;
  });
}

/**
 * @description copia o quantitativo de um item para outro (sem mexer nos ids, somente os valores)
 */
export function epPropostaItemCopyQuantitativo(
  item: EpPropostaItem,
  quantitativos: EpPropostaItemQuantitativoItem[]
): EpPropostaItem {
  return {
    ...item,
    quantitativos: item.quantitativos.map(quantitativo => {
      const { quantidade } = quantitativos.find(
        quantitativoF => quantitativoF.idFasePavimentoCentro === quantitativo.idFasePavimentoCentro
      );
      return { ...quantitativo, quantidade };
    }),
  };
}

/**
 * @description mapeia o retorno do quantitativo do back-end para um item, em um formato mais simples de renderizar na tela
 * @see EpPropostaItemQuantitativoItem
 */
export function mapQuantitativoToPropostaItem(
  idPropostaItem: number,
  idFornecedor: number,
  fases: EpOrcamentoGrupoItemQuantitativoFase[]
): EpPropostaItemQuantitativoItem[] {
  const dummy: Partial<EpPropostaItemQuantitativoItem> = {
    quantidade: 0,
    indicadorAWReferencia: false,
    idFase: -1,
    indicadorAWEstimado: false,
    labelOnly: true,
    idProjetoEdificioPavimento: -1,
    idProjetoCentroCusto: -1,
    idFornecedor,
    idFasePavimentoCentro: '',
    idPropostaItem,
  };
  return fases.reduce(
    (faseAcc, fase) => [
      ...faseAcc,
      {
        ...dummy,
        idFase: fase.idFase,
        id: `${fase.idFase}`,
        nomeFase: fase.nomeFase,
        nivel: EpPropostaItemQuantitativoNivel.fase,
        label: fase.nomeFase,
      },
      ...fase.pavimentos.reduce(
        (pavimentoAcc, pavimento) => [
          ...pavimentoAcc,
          {
            ...dummy,
            idFase: fase.idFase,
            idProjetoEdificioPavimento: pavimento.idProjetoEdificioPavimento,
            id: `${fase.idFase}-${pavimento.idProjetoEdificioPavimento}`,
            nomeFase: fase.nomeFase,
            nomePavimento: pavimento.nomePavimento,
            nivel: EpPropostaItemQuantitativoNivel.pavimento,
            label: pavimento.nomePavimento,
          },
          ...pavimento.centrosCustos.reduce(
            (centroCustoAcc, centroCusto) => [
              ...centroCustoAcc,
              ...centroCusto.fornecedores
                .filter(fornecedor => fornecedor.idFornecedor === idFornecedor)
                .map(
                  fornecedor =>
                    ({
                      ...fornecedor,
                      idFase: fase.idFase,
                      idProjetoCentroCusto: centroCusto.idProjetoCentroCusto,
                      idProjetoEdificioPavimento: pavimento.idProjetoEdificioPavimento,
                      labelOnly: false,
                      id: `${fase.idFase}-${pavimento.idProjetoEdificioPavimento}-${centroCusto.idProjetoCentroCusto}-${fornecedor.idFornecedor}`,
                      idFasePavimentoCentro: `${fase.idFase}-${pavimento.idProjetoEdificioPavimento}-${centroCusto.idProjetoCentroCusto}`,
                      nivel: EpPropostaItemQuantitativoNivel.centroCusto,
                      nomeFase: fase.nomeFase,
                      nomePavimento: pavimento.nomePavimento,
                      nomeCentroCusto: centroCusto.nomeCentroCusto,
                      label: centroCusto.nomeCentroCusto,
                      idPropostaItem,
                    } as EpPropostaItemQuantitativoItem)
                ),
            ],
            []
          ),
        ],
        []
      ),
    ],
    []
  );
}

/**
 * @description orderna os fornecedores, mapeia algumas propriedades dos itens e ordena os itens
 */
export function mapEpFornecedoresItens(fornecedores: EpFornecedorResponse[]): EpFornecedorResponse[] {
  return orderEpFornecedor(fornecedores).map(fornecedor => ({
    ...fornecedor,
    itens: orderBy(
      fornecedor.itens
        .filter(item => item.idPropostaItem !== -1)
        .map(item => ({
          ...item,
          idFornecedor: fornecedor.idFornecedor,
          omisso: !item.idOrcamentoGrupoItem,
          orderOmisso: !item.idOrcamentoGrupoItem ? +item.numeracaoPropostaItem.replace('O', '') : 0,
          indicadorAWReferencia: fornecedor.indicadorAWReferencia,
          indicadorAWEstimado: fornecedor.indicadorAWEstimado,
          descricaoCompleta: [
            item.descricaoPropostaItem,
            item.atributo1,
            item.atributo2,
            item.atributo3,
            item.atributo4,
            item.complemento,
          ]
            .filter(Boolean)
            .join(' '),
        })),
      orderByCodigo<EpPropostaItem>('numeracaoPropostaItem')
    ),
    selecionado: true,
    indicadorAWEstimado: !!fornecedor.indicadorAWEstimado,
    indicadorAWReferencia: !!fornecedor.indicadorAWReferencia,
  }));
}

/**
 * @description verifica se todos os fornecedores possuem todos os itens do AWReferencia,
 * se não possuir, adicionar o mesmo item do aw referencia com valores zerados
 * porém com uma flag para nao renderizar ele na tela
 * Foi preciso fazer isso, para nao ficar com "buracos" na tela
 */
export function mapEpFornecedoresItensNaoPreenchidos(fornecedores: EpFornecedorResponse[]): EpFornecedorResponse[] {
  let idPropostaItemNaoPreenchido = -99;
  const itensAwReferencia = fornecedores
    .find(fornecedor => fornecedor.indicadorAWReferencia)
    .itens.filter(item => !item.omisso);
  return fornecedores.map(fornecedor => {
    if (!fornecedor.indicadorAWReferencia) {
      const itens = fornecedor.itens.filter(item => !item.omisso);
      const itensOmissos = fornecedor.itens.filter(item => item.omisso);
      fornecedor = {
        ...fornecedor,
        itens: [
          ...itensAwReferencia.map(
            itemRef =>
              itens.find(item => item.idOrcamentoGrupoItem === itemRef.idOrcamentoGrupoItem) ?? {
                ...itemRef,
                itemNaoPreenchido: true,
                indicadorAWReferencia: false,
                idPropostaItem: idPropostaItemNaoPreenchido--,
                idFornecedor: fornecedor.idFornecedor,
                quantidadeItens: 0,
                valorTotal: 0,
                valorUnitarioProdutoPropostaItem: 0,
                valorUnitarioServicoPropostaItem: 0,
                valorUnitario: 0,
              }
          ),
          ...itensOmissos,
        ],
      };
    }
    return fornecedor;
  });
}
