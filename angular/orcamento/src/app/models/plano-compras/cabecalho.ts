export interface Cabecalho {
  numeroProjeto: number;
  nomeProjeto: string;
  planilhaHybrida: PlanilhaHybrida;
  planoCompraDados: PlanoCompraDados;
  prazos: Prazos;
}

export interface PlanilhaHybrida {
  valorOrcado: number;
  valorVendaCongelada: number;
  impostoPrevistoDNN: number;
  potencialLucroPrevisto: number;
}

export interface PlanoCompraDados {
  metaCompra: number;
  impostoPrevistoDesenvolvimento: number;
  metaMiscelaneous: number;
}

export interface Prazos {
  liberacaoInicioCompras: string;
  ep2Aprovado: string;
  apAprovado: string;
  projetosTecnicosEntregues: string;
  inicioObrasFase1: string;
}
