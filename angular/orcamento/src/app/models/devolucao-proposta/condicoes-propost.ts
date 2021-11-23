export interface CondicaoProposta {
  areaTotalProjeto: number;
  observacoes: string;
  prazoLimiteEnvioProposta: string;
  mensagem: null;
  necessarioVisita: string;
  contatoVisita: null;
  telefoneVisita: null;
  orcamentoGrupoRestricaoObra: any[];
  nomeResponsavel: string;
  restricaoObra: null;
  dataEntregaProdutos: null;
  prazoInicioObra: string;
  prazoTerminoObra: string;
  orcamentoFase: OrcamentoFase[];
  endereco: Endereco;
  questionarioDadosPublicados: { [key: string]: null | string };
  idProposta: number;
  versaoProposta: number;
  valorTotalProdutoProposta: number;
  valorTotalServicoProposta: number;
  valorTotalProposta: number;
  idGrupo: number;
  codigoGrupo: string;
  nomeGrupo: string;
  valorMinimoFaturamento: number;
  qtdItensOrcados: number;
  qtdItensProposta: number;
  horario: any[];
  dataInicioFase: string;
  dataFimFase: string;
  prazoNotasFiscais: string;
  prazoPagamento: string;
  cidade: string;
  estado: string;
}
export interface Endereco {
  cidade: string;
  estado: string;
  pais: string;
  endereco: string;
  bairro: string;
  numero: number;
  complemento: string;
  cep: string;
}

export interface OrcamentoFase {
  idFase: number;
  idOrcamento: number;
  nomeFase: string;
  dataInicioFase: string;
  dataFimFase: string;
}
