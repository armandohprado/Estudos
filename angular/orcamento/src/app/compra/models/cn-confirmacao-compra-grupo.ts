export interface CnConfirmacaoCompraGrupo {
  idConfirmacaoCompraClassificacao: number;
  idCompraNegociacaoGrupo: number;
  idCompraNegociacao: number;
  idOrcamentoGrupo: number;
  idGrupo: number;
  codigo: string;
  nome: string;
  idProjeto: number;
  nomeProjeto: string;
  numeroProjeto: string;
  prazoEntregaObra: number;
  prazoExecucaoObra: number;
  idOrcamentoCenarioGrupoContrato: number;
  condicaoPagamento: string;
  numeroInternoCliente: string;
  cepDocumento: string;
  enderecoDocumento: string;
  complementoDocumento: string;
  bairroDocumento: string;
  idCidadeDocumento: number;
  cidadeDocumento: string;
  idEstadoDocumento: number;
  estadoDocumento: string;
  idPaisDocumento: number;
  paisDocumento: string;
  cepEntrega: string;
  enderecoEntrega: string;
  complementoEntrega: string;
  bairroEntrega: string;
  idCidadeEntrega: number;
  cidadeEntrega: string;
  idEstadoEntrega: number;
  estadoEntrega: string;
  idPaisEntrega: number;
  paisEntrega: string;
  observacao: string;
}
