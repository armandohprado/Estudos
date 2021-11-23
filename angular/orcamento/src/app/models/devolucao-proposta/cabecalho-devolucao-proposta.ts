export interface CabecalhoDevolucaoProposta {
  classificacao?: number;
  idProposta?: number;
  versaoProposta?: number;
  valorTotalProdutoProposta?: number;
  valorTotalServicoProposta?: number;
  valorTotalProposta?: number;
  idGrupo?: number;
  visaoExcel?: boolean;
  codigoGrupo?: string;
  nomeGrupo?: string;
  valorMinimoFaturamento?: number;
  qtdItensOrcados?: number;
  qtdItensProposta?: number;
  horario?: string;
  dataInicioFase?: string;
  dataFimFase?: string;
  prazoNotasFiscais?: string;
  prazoPagamento?: string;
  cidade?: string;
  estado?: string;
  areaTotalProjeto?: number;
  observacoes?: string;
  prazoLimiteEnvioProposta?: string;
  mensagem?: null;
  necessarioVisita?: string;
  contatoVisita?: null;
  idProjeto?: number;
  telefoneVisita?: null;
  orcamentoGrupoRestricaoObra?: any[];
  nomeResponsavel?: string;
  restricaoObra?: null;
  dataEntregaProdutos?: null;
  prazoInicioObra?: string;
  prazoTerminoObra?: string;
  idOrcamento?: number;
  idOrcamentoGrupo?: number;
  possuiQuestionarioSeguro?: boolean;
  orcamentoFase?: OrcamentoFase[];
  endereco?: Endereco;
  nomeFornecedor?: string;
  retornoProposta?: boolean;
  idCompraNegociacaoGrupoMapaFornecedor?: number;
  idCompraNegociacaoGrupoMapa?: number;
  enviadoAprovacaoFornecedor?: boolean;
  questionarioDadosPublicados?: {
    bancoEspecifico?: null;
    bancoEspecificoDescricao?: null;
    condicaoPagamento?: string;
    corteAWProduto?: string;
    corteAWServico?: string;
    corteClienteProduto?: string;
    corteClienteServico?: string;
    documentosExigidos?: string;
    faturamentoAW?: string;
    faturamentoAWTipo?: string;
    faturamentoCliente?: string;
    faturamentoClienteTipo?: string;
    formaPagamento?: string;
    haveraDataCorte?: string;
    localObraEstara?: string;
    necessidadeCadastroPrevio?: string;
    nfEspelhoPO?: string;
    poMaisDeUmaNF?: string;
    prazoNotasFiscais?: string;
    prazoPagamento?: string;
    sessaoIntegracao?: string;
  };
}

export interface Endereco {
  cidade?: string;
  estado?: string;
  pais?: string;
  endereco?: string;
  bairro?: string;
  numero?: number;
  complemento?: string;
  cep?: string;
}

export interface OrcamentoFase {
  idFase?: number;
  idOrcamento?: number;
  nomeFase?: string;
  dataInicioFase?: string;
  dataFimFase?: string;
}
