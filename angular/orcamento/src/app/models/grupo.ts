import { Funcionario } from './funcionario';
import { Fornecedor } from './fornecedor';
import { Proposta } from './proposta';
import { AnexoAvulso } from './anexo-avulso';
import { Itens } from '../change-order/models/itens';

export interface Grupo {
  especialistas?: Funcionario[];
  arquitetura?: Funcionario[];
  dataLimiteDefinicao?: Date;
  dataLimiteRecebimento?: Date;
  idGrupao?: number;
  descricaoComplementarGrupo?: string;
  apoioVertical?: boolean;
  apoioArquitetura?: boolean;
  selecionado?: boolean;
  grupoNaoPrevisto?: boolean;
  valorMetaGrupo?: number;
  percentualUtilizado?: number;
  percentualHistorico?: number;
  escopoEntregue?: boolean;
  idFamilia?: number;
  complementoGrupo?: string;
  comentarioGrupo?: string;
  exibeComentarioPropostaGrupo?: string;
  dataLimiteEntregaMercadoria?: Date;
  dataInicioExecucaoServico?: Date;
  dataFimExecucaoServico?: Date;
  nomeProjeto?: string;
  anexosAvulsos?: AnexoAvulso[];
  idGrupoClassificacao?: number;
  idGrupoTipo?: number;
  idFamiliaCustomizada?: number;
  mensagemEnvioCotacao?: string;
  idFuncionarioContato?: number;
  liberarQuantitativo?: boolean;
  necessariaVisita?: boolean;
  contatoVisita?: string;
  telefoneVisita?: string;
  ativo?: boolean;
  ativoPlanilha?: boolean;
  exibeGrupo?: boolean;
  valorTotalOrcado?: number;
  valorTotaldaVenda?: number;
  valorTransferido?: number;
  itens?: Itens[];
  percentualImposto?: number;

  idOrcamentoCenario: number;
  numeracao: string;

  isSelectable?: boolean;
  isSelected?: boolean;
  selecionadoPlanoCompras?: boolean;

  descricaoFamilia: string;
  idOrcamentoFamilia: number;
  idOrcamento: number;
  idOrcamentoGrupo: number;
  idOrcamentoCenarioGrupo: number;
  idTipoGrupo: number;
  idGrupo: number;
  opcional: boolean;
  codigoGrupo: string;
  nomeGrupo: string;
  valorSelecionado: number;
  custoEntregue: boolean;

  fornecedores: Fornecedor[];
  responsaveis: Funcionario[];
  propostas: Proposta[];

  filtro: number;
  ordem: number;
}

export const AW_REFERENCIA_REGEXP = /\(AW( )?REFER[E|Ê]NCIA\)/i;

export function isAwReferencia(nomeGrupo: string): boolean {
  return AW_REFERENCIA_REGEXP.test(nomeGrupo);
}
