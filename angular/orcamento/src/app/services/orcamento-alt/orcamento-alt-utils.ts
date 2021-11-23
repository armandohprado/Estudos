import { FamiliaAlt, FamiliaAltTotal } from '@aw-models/familia-alt';
import { groupBy } from '@aw-utils/group-by';
import { statusBudgetValue } from '../../grupo/status-budget-value.pipe';
import { compareValuesKey, orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { FornecedorService } from '@aw-services/orcamento/fornecedor.service';
import { StatusPropostaValorOrcamento } from '@aw-models/status-proposta-valor-orcamento.enum';
import { FamiliaGrupoAlt } from '@aw-models/familia-grupo-alt';
import { GrupoAlt } from '@aw-models/grupo-alt';
import { PropostaAlt } from '@aw-models/proposta-alt';

export function mapFamiliasCotacao(
  familias: FamiliaAlt[],
  visualizarGruposEmLista: boolean,
  familiasTotais: FamiliaAltTotal[]
): FamiliaAlt[] {
  familias = mapFamiliasOpcionais(familias);
  familias = mapFamiliasTotais(familias, familiasTotais);
  familias = mapFamiliasGruposEmLista(familias, visualizarGruposEmLista, familiasTotais);

  return familias;
}

export function orderPropostasAlt(propostas: PropostaAlt[]): PropostaAlt[] {
  return [...propostas].sort((propostaA, propostaB) => {
    if (propostaA.fornecedor.fornecedorInterno !== propostaB.fornecedor.fornecedorInterno) {
      return +propostaB.fornecedor.fornecedorInterno - +propostaA.fornecedor.fornecedorInterno;
    } else {
      return compareValuesKey(propostaA, propostaB, 'idProposta');
    }
  });
}

export function mapPropostaAlt(proposta: PropostaAlt): PropostaAlt {
  return {
    ...proposta,
    dataRetornoProposta: proposta.dataRetornoProposta && new Date(proposta.dataRetornoProposta),
    dataSolicitacaoProposta: proposta.dataSolicitacaoProposta && new Date(proposta.dataSolicitacaoProposta),
    prazoEntrega: proposta.prazoEntrega && new Date(proposta.prazoEntrega),
    prazoExecucao: proposta.prazoExecucao && new Date(proposta.prazoExecucao),
  };
}

export function mapGrupoAlt(grupo: GrupoAlt, idOrcamentoCenario: number): GrupoAlt {
  return {
    ...grupo,
    propostas: orderPropostasAlt(
      grupo.propostas.map(proposta => {
        proposta = mapPropostaAlt(proposta);
        const equalizacaoSelecionada =
          statusBudgetValue(proposta, grupo.propostas) === StatusPropostaValorOrcamento.Total;
        return {
          ...proposta,
          equalizacaoSelecionada,
          idOrcamentoGrupo: grupo.idOrcamentoGrupo,
          idOrcamentoFamilia: grupo.idOrcamentoFamilia,
        };
      })
    ),
    responsaveis: orderBy(grupo.responsaveis ?? [], {
      principal: 'desc',
      idOrcamentoGrupoResponsavel: 'asc',
    }),
    somenteAwEstimado:
      grupo.propostas.length === 1 && grupo.propostas[0].idFornecedor === FornecedorService.idFornecedorAwEstimado,
    possuiMultiplasPropostas:
      grupo.propostas.filter(proposta => proposta.idFornecedor !== FornecedorService.idFornecedorAwEstimado).length > 1,
    possuiAwEstimado: grupo.propostas.some(
      proposta => proposta.idFornecedor === FornecedorService.idFornecedorAwEstimado
    ),
    codigoGrupo: grupo.numeracao ?? grupo.codigoGrupo,
    dataFimExecucaoServico: grupo.dataFimExecucaoServico && new Date(grupo.dataFimExecucaoServico),
    dataInicioExecucaoServico: grupo.dataInicioExecucaoServico && new Date(grupo.dataInicioExecucaoServico),
    dataLimiteEntregaMercadoria: grupo.dataLimiteEntregaMercadoria && new Date(grupo.dataLimiteEntregaMercadoria),
    dataLimiteRecebimento: grupo.dataLimiteRecebimento && new Date(grupo.dataLimiteRecebimento),
    idOrcamentoCenario,
  };
}

export function mapFromFamiliaGruposToFamiliasAlt(
  familiasGrupos: FamiliaGrupoAlt[],
  idOrcamentoCenario: number
): FamiliaAlt[] {
  const grouped = groupBy(familiasGrupos, 'idOrcamentoFamilia');
  const familiasAlt: FamiliaAlt[] = [];
  for (const [, grupos] of grouped) {
    const familiaGrupo = grupos[0];
    const familia: FamiliaAlt = {
      ...mapFromFamiliaGrupoToFamiliaAlt(familiaGrupo),
      customizada: !!familiaGrupo.idFamiliaCustomizada,
      grupos: grupos.map(grupo => mapGrupoAlt(grupo, idOrcamentoCenario)),
    };
    familiasAlt.push(familia);
  }
  return familiasAlt;
}

export function mapFamiliasGruposEmLista(
  familias: FamiliaAlt[],
  visualizarGruposEmLista: boolean,
  familiasTotais: FamiliaAltTotal[]
): FamiliaAlt[] {
  if (visualizarGruposEmLista) {
    return familias;
  }
  const newFamilias: FamiliaAlt[] = [];
  const familiaPadrao: FamiliaAlt = {
    descricaoFamilia: 'Padrão',
    idFamilia: -1,
    idOrcamentoFamilia: -1,
    grupos: [],
    customizada: false,
    totalSelecionado: 0,
    opcional: false,
  };
  const familiaPadraoOpcional: FamiliaAlt = {
    descricaoFamilia: 'Padrão (opcional)',
    idFamilia: -2,
    idOrcamentoFamilia: -2,
    grupos: [],
    opcional: true,
    customizada: false,
    totalSelecionado: 0,
  };
  for (const familiaTotal of familiasTotais) {
    if (familiaTotal.opcional) {
      familiaPadraoOpcional.totalSelecionado += familiaTotal.total;
    } else {
      familiaPadrao.totalSelecionado += familiaTotal.total;
    }
  }
  for (const familia of familias) {
    if (familia.idFamiliaCustomizada) {
      newFamilias.push(familia);
    } else if (familia.opcional) {
      familiaPadraoOpcional.grupos.push(...familia.grupos);
    } else {
      familiaPadrao.grupos.push(...familia.grupos);
    }
  }
  if (familiaPadraoOpcional.grupos.length) {
    newFamilias.unshift(familiaPadraoOpcional);
  }
  if (familiaPadrao.grupos.length) {
    newFamilias.unshift(familiaPadrao);
  }
  return newFamilias;
}

interface GrupoOpcionalConstraint {
  opcional: boolean;
}

interface FamiliaOpcionalConstraint {
  grupos: GrupoOpcionalConstraint[];
  optional?: boolean;
  descricaoFamilia: string;
}

/**
 * @description Separar as familias normais das familias opcionais, adiciona uma flag na familia (opcional), separa os grupos e
 * adiciona "Opcional" na descrição da familia
 */
export function mapFamiliasOpcionais<F extends FamiliaOpcionalConstraint>(familias: F[]): F[] {
  const familiasNormais: F[] = [];
  const familiasOpcionais: F[] = [];
  for (const familia of familias) {
    const grupos: GrupoOpcionalConstraint[] = [];
    const gruposOpcionais: GrupoOpcionalConstraint[] = [];
    for (const grupo of familia.grupos) {
      if (grupo.opcional) {
        gruposOpcionais.push(grupo);
      } else {
        grupos.push(grupo);
      }
    }
    if (grupos.length) {
      const familiaNormal: F = { ...familia, grupos, opcional: false };
      familiasNormais.push(familiaNormal);
    }
    if (gruposOpcionais.length) {
      const familiaOpcional: F = {
        ...familia,
        descricaoFamilia: `${familia.descricaoFamilia} (Opcional)`,
        opcional: true,
        grupos: gruposOpcionais,
      };
      familiasOpcionais.push(familiaOpcional);
    }
  }
  // Poderia fazer isso com um reduce, porém, ia ficar muito complexo para ler
  // Então resolvi fazer com um for of simples
  return [...familiasNormais, ...familiasOpcionais];
}

export function mapFamiliasTotais(familias: FamiliaAlt[], familiasTotais: FamiliaAltTotal[]): FamiliaAlt[] {
  return familias.map(familia => ({
    ...familia,
    totalSelecionado:
      familiasTotais.find(
        familiaTotal =>
          familiaTotal.idOrcamentoFamilia === familia.idOrcamentoFamilia && familia.opcional === familiaTotal.opcional
      )?.total ?? 0,
  }));
}

export function mapFromFamiliaGrupoToFamiliaAlt(familiaGrupo: FamiliaGrupoAlt): FamiliaAlt {
  return {
    grupos: [],
    idFamilia: familiaGrupo.idFamilia,
    descricaoFamilia: familiaGrupo.descricaoFamilia,
    idOrcamentoFamilia: familiaGrupo.idOrcamentoFamilia,
    idFamiliaCustomizada: familiaGrupo.idFamiliaCustomizada,
    customizada: !!familiaGrupo.idFamiliaCustomizada,
  };
}

export function getTotalPorPaginaOptions(): number[] {
  return [2, 10, 25, 50, 75, 100, 150, 200, 250];
}

export function validateTotalPorPaginaQueryParam(param: string | null | undefined): number {
  const options = getTotalPorPaginaOptions();
  return param && options.includes(+param) ? +param : options[1];
}
