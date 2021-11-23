export interface EpInformacoes {
  indiceComparativa: number;
  nomeGrupo: string;
  codigoGrupo: string;
  classificacao: number;
}

export interface EpInformacoesResponse extends EpInformacoes {
  fornecedores: any[];
}

export interface EpBloqueios {
  produto: boolean;
  servico: boolean;
}
