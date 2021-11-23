export interface Integracao {
  sessaoIntegracao: boolean;
}

export interface Pagamento {
  formaPagamento: string;
  bancoEspecificoDescricao: string;
  documentosExigidos: string;
  nfEspelhoPO: boolean;
  poMaisDeUmaNF: boolean;
  faturamentoClienteDias: string;
  faturamentoClienteDiasUteis: boolean;
  faturamentoAWDias: string;
  faturamentoAWDiasUteis: boolean;
  haveraDataCorte: boolean;
  corteClienteProdutoDias: number;
  corteClienteServicoDias: number;
  corteAWProdutoDias: number;
  corteAWServico: number;
}

export interface Faturamento {
  necessidadeCadastroPrevio: boolean;
  condicaoPagamento: string;
  impostoRetidos: string;
  tipoFaturamento?: boolean;
}

export interface Local {
  cidade: string;
  estado: string;
  pais: string;
  endereco: string;
  numero: string;
  complemento: string;
  cep: string;
  visita: Visita;
  localObraEstara: string;
  descricao: string;
  grupoRestricaoObra: GrupoRestricaoObra[];
}

export interface GrupoRestricaoObra {
  exibeComentario: boolean;
  idRestricaoObra: number;
  nome: string;
  restricaoObraHoraInicio?: string;
  restricaoObraHoraFim?: string;
  restricaoComentario?: string;
}

export interface Visita {
  id: number;
  necessariaVisita: boolean;
  contatoVisita: string;
  telefoneVisita: string;
}

export interface Geral {
  responsavel: string;
  areaTotalProjeto: string;
  prazoPropostaLimite: string;
  prazoObraInicio: string;
  prazoObraTermino: string;
}

export interface PropostaDetalhada {
  geral: Geral;
  local: Local;
  faturamento: Faturamento;
  pagamento: Pagamento;
  integracao: Integracao;
}
