export interface ValidarComentariosFamilia {
  idFamilia: number;
}

export interface ValidarComentariosGrupo {
  idGrupo: number;
  codigoGrupo: string;
  nomeGrupo: string;
  grupoOpcional: boolean;
}

export interface ValidarComentarios {
  grupos: ValidarComentariosGrupo[];
  gruposOpcionais: ValidarComentariosGrupo[];
  quantidadeDesconto: ValidarComentariosGrupo[];
  quantidadeOportunidade: ValidarComentariosGrupo[];
  quantidadeVPDNN: ValidarComentariosGrupo[];
  comentariosFamilias: ValidarComentariosFamilia[];
}
