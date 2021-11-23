import { PlanilhaHibridaTransferirSaldoCC } from '../../orcamento/planilha-vendas-hibrida/models/transferir-saldo';
import { CnFornecedor } from './cn-fornecedor';
import { CnFichaPayloadMapa } from './cn-ficha-payload';
import { CnClassificacao } from './cn-classificacao';
import { EmpresaFaturamento } from '@aw-models/empresa-faturamento';
import { PlanoCompraQuestaoPayload } from '@aw-models/plano-compra-questao';

export interface CompraNegociacaoGrupoFichaAprovador {
  idCompraNegociacaoGrupoFichaAprovador: number;
  idCompraNegociacaoGrupoFicha: number;
  idAprovador: number;
  nome: string;
  tipo: boolean;
}

export interface CompraNegociacaoGrupoFichaTipoAreaCausa {
  idCompraNegociacaoGrupoFichaTipoAreaCausa: number;
  idCompraNegociacaoGrupoFicha: number;
  idCompraNegociacaoGrupoFichaTipo: number;
  compraNegociacaoGrupoFichaTipo: string;
  idFichaCausa: number;
  fichaCausa: string;
  idFichaArea: number;
  fichaArea: string;
  idOrcamentoGrupoFichaTipoAreaCausa: number;
  idOrcamentoGrupoFicha: number;
  idOrcamentoGrupoFichaTipo: number;
}

export interface CompraNegociacaoGrupoFicha {
  idCompraNegociacaoGrupoFicha: number;
  idCompraNegociacaoGrupo: number;
  idCompraNegociacaoStatus: number;
  compraNegociacaoStatus: string;
  data: Date;
  dataAprovacao: Date;
  detalhe: string;
  compraNegociacaoGrupoFichaAprovador: CompraNegociacaoGrupoFichaAprovador[];
  compraNegociacaoGrupoFichaArquivo: CompraNegociacaoGrupoFichaArquivo[];
  compraNegociacaoGrupoTransacao: CompraNegociacaoGrupoTransacao[];
  compraNegociacaoGrupoTransacaoCC: PlanilhaHibridaTransferirSaldoCC[];
  compraNegociacaoGrupoFichaTipoAreaCausa: CompraNegociacaoGrupoFichaTipoAreaCausa[];
}

export interface CompraNegociacaoGrupoTransacao {
  idCompraNegociacaoGrupoTransacao: number;
  codigo: string;
  idCompraNegociacaoGrupo: number;
  nome: string;
  idCompraNegociacaoGrupoFicha: number;
  idCompraNegociacaoStatus: number;
  compraNegociacaoStatus: string;
  data: Date;
  valor: number;
  posicao: number;
}

export interface CompraNegociacaoGrupoFichaArquivo {
  idCompraNegociacaoGrupoFichaArquivo: number;
  idOrcamentoGrupoFichaArquivo: number;
  idCompraNegociacaoGrupoFicha: number;
  idOrcamentoGrupoFicha: number;
  idUpload: number;
  idUploadPasta: number;
  nomeArquivo: string;
  caminhoArquivo: string;
  ativo: boolean;
  nomeOriginal: string;
}

export interface CnMapa {
  idCompraNegociacaoGrupoMapa: number;
  idCompraNegociacaoGrupo: number;
  idCompraNegociacaoStatus: number;
  compraNegociacaoStatus: string;
  valorLimiteCompra: number;
  valorMargemDiferenca: number;
  valorSaldoContingencia: number;
  valorMargemRevenda: number;
  valorMetaMiscellaneous: number;
  valorImposto: number;
  dataEnvio: Date;
  dataRecusa?: any;
  dataRetorno?: any;
  motivoRecusa?: any;
  compraNegociacaoGrupoFicha: CompraNegociacaoGrupoFicha;
  compraNegociacaoGrupoMapaFornecedor: CnFornecedor[];

  totalSelecionado?: CnMapaTotais;
  totalDiferencaMargem?: CnMapaTotais;
  totalSaldoContigenciaRetidoGrupo?: CnMapaTotais;
  total?: CnMapaTotais;
}

export interface CnMapaTotais {
  enviado: number;
  negociado: number;
  impostoRevenda: number;
  revenda: number;
}

export interface CnEnvioMapaPayload {
  idCompraNegociacaoGrupo: number;
  idGrupo: number;
  idProjeto: number;
  valorLimiteCompra: number;
  valorMargemDiferenca: number;
  valorSaldoContingencia: number;
  valorMargemRevenda: number;
  valorMetaMiscellaneous: number;
  valorImposto: number;
  idsFornecedoresSelecionados: number[];
  compraNegociacaoGrupoFicha?: CnFichaPayloadMapa;
  idConfirmacaoCompraClassificacao: number;
  idFaturamentoCobranca: number;
  planoCompraQuestoes: PlanoCompraQuestaoPayload[];
  dataFluxoSD?: Date;

  // Helpers
  confirmacaoCompraClassificacao?: CnClassificacao;
  faturamentoCobranca?: EmpresaFaturamento;
}
