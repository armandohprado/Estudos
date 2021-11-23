import { CnClassificacao } from './cn-classificacao';
import { Cidade } from '@aw-models/enderecos/cidade';
import { Estado } from '@aw-models/enderecos/estado';
import { Pais } from '@aw-models/enderecos/pais';
import { CnFornecedor } from './cn-fornecedor';

export interface CnConfirmacaoCompra {
  dadosGrupo: CnConfirmacaoCompraDadosGrupo;
  cliente: CnConfirmacaoCompraCliente;
}

export interface CnConfirmacaoCompraDadosGrupo {
  classificacao?: CnClassificacao;
  classificacaoRevenda?: CnClassificacao;
  prazoEntregaObra: number;
  prazoExecucaoObra: number;
  condicaoPagamento: string;
}

export interface CnConfirmacaoCompraCliente {
  numeroInterno: string;
  entregaDocumentos: CnConfirmacaoCompraEndereco;
  entregaProdutosServicos: CnConfirmacaoCompraEndereco;
}

export interface CnConfirmacaoCompraEndereco {
  endereco: string;
  complemento?: string;
  bairro: string;
  cep: string;
  cidade: Cidade;
  uf: Estado;
  pais: Pais;
  observacao?: string;
}

export interface CnConfirmacaoCompraFornecedor extends CnFornecedor {
  idCompraNegociacaoGrupoConfirmacaoCompra: number;
  idCompraNegociacaoGrupo: number;
  numeracao: string;
  data: string;
  hora: string;
  idCompraNegociacaoStatus: number;
  compraNegociacaoStatus: string;
  valorTotalNegociado: number;
  valorTotalImpostoRevenda: number;
  emitirMapaEmissaoCompra: boolean;
  emitirMapaEmissaoCompraMensagem: string;
  miscellaneous: boolean;

  propertyValor?: string;
  urlCentralizacao?: string;
}
