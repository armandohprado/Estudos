export interface Transacao {
  idCompraNegociacaoGrupoTransacao: number;
  idCompraNegociacao: number;
  idCompraNegociacaoGrupo: number;
  idPlanoCompraGrupo: number;
  idOrcamentoGrupo: number;
  idPlanilhaHibridaOrigem: number;
  idPlanilhaHibridaDestino: number;
  idGrupo: number;
  codigo: string;
  nome: string;
  idCompraNegociacaoStatus: number;
  compraNegociacaoStatus: string;
  data: string;
  dataEfetivacao?: string;
  valor: number;
  saldo: number;
  valorTransferido?: number;
}

export interface GrupoTransacao {
  idGrupo: number;
  codigo: string;
  nome: string;
  valorTransferidoCP: number;
  valorTotalOrcado: number;
  valorTotalVenda: number;
  saldo: number;
  transacoes: Transacao[];
  idPlanilhaHibrida: number;

  idCompraNegociacaoGrupoConfirmacaoCompra?: number;
  numeracao?: string;
  valorTransferidoCC?: number;
}

export interface GrupaoTransacao {
  idGrupao: number;
  numeroGrupao: number;
  descricaoGrupao: string;
  ativo: boolean;
  idFamilia: number;
  valorTransferidoCP: number;
  grupos: GrupoTransacao[];
  valorTotalOrcado: number;
  valorTotalVenda: number;
  saldo: number;

  valorTransferidoCC?: number;
}

export interface FamiliaTransacao {
  idOrcamentoFamilia: number;
  nomeOrcamentoFamilia: string;
  ordemOrcamentoFamilia: number;
  idOrcamento: number;
  idFamilia?: number;
  descricaoFamilia: string;
  idFamiliaCustomizada?: number;
  nomeFamiliaCustomizada: string;
  valorTotalTransferidoCP: number;
  grupoes: GrupaoTransacao[];
  valorTotalOrcado: number;
  valorTotalVenda: number;
  saldo: number;
  valorTotalTransferidoCC?: number;
}
