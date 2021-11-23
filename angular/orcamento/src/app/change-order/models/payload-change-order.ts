export interface PayloadChangeOrder {
  idOrcamento: number;
  nome: string;
  descricao: string;
  dataFinalizacao: string;
  prazoValidade: number;
  destacarImpostos: false;
  omitirDetalhamento: false;
  familia: PayloadChangeOrderFamilia[];

  idOrcamentoChangeOrder?: number;
  idOrcamentoGrupoClassificacao?: number;
  idOrcamentoCenarioOrigem?: number;
  idRfi?: number;
}

export interface PayloadChangeOrderFamilia {
  idFamilia: number;
  idFamiliaCustomizada: number;
  idOrcamentoFamilia: number;
  numeroFamilia: number;
  descricaoFamilia: string;
  ordemFamilia: number;
  grupao: Grupao[];
}

interface Grupao {
  idGrupao: number;
  descricaoGrupao: string;
  ativo: boolean;
  grupo: Grupo[];
}

interface Grupo {
  idGrupo: number;
  codigoGrupo: string;
  nomeGrupo: string;
}
