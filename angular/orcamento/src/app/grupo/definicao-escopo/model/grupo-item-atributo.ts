export interface GrupoItemAtributo {
  idGrupoItem: number;
  ordem: number;
  grupoItemDadoAtributo: GrupoItemDadoAtributo[];
  loading?: boolean;
}

export interface GrupoItemDadoAtributo {
  idGrupoItemDadoAtributo: number;
  idGrupoItemAtributo: number;
  idOrcamentoGrupoItem: number;
  idOrcamentoGrupoItemAtributo: number;
  descricaoGrupoItemDadoAtributo: string;
  ordem: number;
  ativo: boolean;
  grupoItemDadoAtributoCombo: GrupoItemDadoAtributoCombo[];
  loading?: boolean;
}

export interface GrupoItemDadoAtributoCombo {
  idGrupoItemDadoAtributoCombo: number;
  idOrcamentoGrupoItemAtributoCombo: number;
  idGrupoItemDadoAtributo: number;
  idGrupoCombo: number;
  ordem: number;
  texto: string;
  ativo: boolean;
  grupoComboConteudo: GrupoComboConteudo[];
  loading?: boolean;
}

export interface GrupoComboConteudo {
  idGrupoComboConteudo: number;
  idGrupoCombo: number;
  idUnidade: number;
  descricaoCategoriaConteudo: string;
  ativo: boolean;

  descricaoReal: string;
}

export interface IncluirGrupoItemDadoAtributo {
  idOrcamentoGrupoItemAtributo: number;
  idOrcamentoGrupoItem: number;
  idGrupoItemDadoAtributo: number;
  descricao: string;
  ordem: number;
}

export interface IncluirGrupoItemDadoAtributoCombo {
  idOrcamentoGrupoItemAtributoCombo: number;
  idOrcamentoGrupoItemAtributo: number;
  idGrupoItemDadoAtributoCombo: number;
  idGrupoComboConteudo?: number;
  descricaoAtributoCombo: string;
  descricaoComboConteudo?: string;
  ordem: number;
}
