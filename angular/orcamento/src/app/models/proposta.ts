import { StatusProposta } from './status-proposta.enum';
import { Fornecedor } from './fornecedor';

export interface Proposta {
  versaoProposta: number;
  dataVersaoProposta?: Date;
  retornoProposta: boolean;
  valorTotalServicoProposta: number;
  valorTotalProdutoProposta: number;
  valorParcialProposta: number;
  valorTotalProposta: number;
  prazoEntrega?: Date;
  prazoExecucao?: Date;
  dataSolicitacaoProposta?: Date;
  dataRetornoProposta?: Date;
  desatualizadoProposta: boolean;
  idCenarioGrupo: number;
  idGrupoFornecedor: number;
  comentarioProposta?: any;
  desativaProposta: boolean;
  declinadaProposta: boolean;
  status: StatusProposta;
  idContatoFornecedor: number;
  preenchida: boolean;
  declinadaPropostaNome: string;
  declinadaPropostaMotivo: string;

  idProposta: number;
  idFornecedor: number;
  fornecedor: Fornecedor;
  possuiConfirmacaoCompra: boolean;
  possuiMapaEnviado: boolean;
  lastCall: boolean;
  equalizacaoSelecionada?: boolean;
}

export interface PropostaHistorico {
  idPropostaHistorico: number;
  idProposta: number;
  versaoProposta: number;
  valorTotalProposta: number;
  valorTotalServicoProposta: number;
  valorTotalProdutoProposta: number;
  prazoEntrega: number;
  prazoExecucao: number;
  dataRetornoProposta: string;
  dataSolicitacaoProposta?: string;
  desatualizadoProposta: boolean;
  idOrcamentoCenarioGrupo: number;
  idOrcamentoGrupoFornecedor: number;
  comentarioProposta: string;
  desativaProposta: boolean;
  declinadaProposta: boolean;
  declinadaPropostaNome?: string;
  declinadaPropostaMotivo?: string;
  idContato: number;
  retornoProposta: boolean;
  nomeResponsavelProposta: string;
  dataValidadeProposta: string;
  montagemInstalacaoInclusa: boolean;
  nomeLiderEquipe: string;
  quantidadeFuncionario: number;
  prazoMobilizacao: number;
  prazoExecucaoServico: number;
  adicionaisInclusos: boolean;
  dataVersaoProposta: string;
  idFornecedor: number;
}
