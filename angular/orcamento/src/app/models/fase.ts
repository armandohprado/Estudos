export interface Fase {
  idFase: number;
  nomeFase: string;
  dataInicioFase: Date;
  dataFimFase: Date;
  dataCriacao: Date;
  dataAlteracao: Date;
  nomeUsuario: string;
  idOrcamento: number;

  canRemove: boolean;
}

export interface FasePayload extends Fase {
  remove?: boolean;
}
