export interface CronogramaItem {
  _id: number;
  _idCronograma: number;
  idCheckListCronograma: number;
  idProjetoCheckListCronogramaItem: number;
  descricao: string;
  dataPrevista?: Date;
  dataRealizada?: Date;
  bloquearDataPrevista: boolean;
}

export interface Cronograma {
  _id: number;
  idCheckListCronograma: number;
  descricao: string;
  itens: CronogramaItem[];
}

export interface Cronogramas {
  idProjeto: number;
  numeroProjeto: string;
  nomeProjeto: string;
  publicado: boolean;
  cronogramas: Cronograma[];
}

export interface CronogramaItemAtualizarPayload {
  idProjetoCheckListCronogramaItem: number;
  dataPrevista?: Date;
  dataRealizada?: Date;
}
