import { Orcamento } from './orcamento';
import { Funcionario } from './funcionario';

export interface ProjetoBase {
  idProjeto: number;
  numeroProjeto: string;
  nomeProjeto: string;
  idEquipeProjeto: number;
  idContaNegocio: number;
  metragemAbsoluta: number;
  idTipoProjeto?: number;
  idEscopo: number;
  idRegiao?: number;
  idAreaAtuacao: number;
  percentualMargemContribuicao: number;
  idCategoria: number;
  idGrupoComercial: number;

  categoria: string;
}

export interface Projeto extends ProjetoBase {
  valorProjeto: number;
  grupoComercial: string;
  orcamentos: Orcamento[];
  responsaveis: Funcionario[];
}

export interface ProjetoAlt extends ProjetoBase {
  idLiderEstrategico: number;
  idProjetoTipo: number;
}
