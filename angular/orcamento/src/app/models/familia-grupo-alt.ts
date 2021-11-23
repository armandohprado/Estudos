import { FuncionarioAlt } from '@aw-models/funcionario-alt';
import { PropostaAlt } from '@aw-models/proposta-alt';

export interface FamiliaGrupoAlt {
  idOrcamentoFamilia: number;
  descricaoFamilia: string;
  idFamilia?: number;
  idFamiliaCustomizada?: number;

  idOrcamento: number;
  idOrcamentoGrupo: number;
  idOrcamentoCenarioGrupo: number;
  idOrcamentoCenario: number;
  idTipoGrupo: number;
  idGrupo: number;
  opcional: boolean;
  numeracao: string;
  codigoGrupo: string;
  nomeGrupo: string;
  valorSelecionado: number;
  custoEntregue: boolean;
  valorMetaGrupo: number;
  dataLimiteRecebimento?: Date;
  comentarioGrupo?: string;
  complementoGrupo?: string;
  necessariaVisita?: boolean;
  contatoVisita?: string;
  telefoneVisita?: string;
  liberarQuantitativo?: boolean;
  dataFimExecucaoServico?: Date;
  dataInicioExecucaoServico?: Date;
  dataLimiteEntregaMercadoria?: Date;
  idFuncionarioContato?: number;
  mensagemEnvioCotacao?: string;

  responsaveis: FuncionarioAlt[];
  propostas: PropostaAlt[];

  filtro: number;
  ordem: number;
}
