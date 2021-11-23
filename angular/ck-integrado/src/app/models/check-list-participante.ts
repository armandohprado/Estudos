export interface CheckListParticipante {
  _id: number;
  _row: number;
  idCheckListParticipante: number;
  idProjetoCheckListIntegrado: number;
  idCheckListParticipanteStatus: number;
  nome: string;
  email: string;
  importadoAutomatico: boolean;
  _button: undefined;
}

export interface CheckListParticipanteAdicionarPayload {
  idCheckListParticipante: number;
  idProjetoCheckListIntegrado: number;
  idCheckListParticipanteStatus: number;
  importadoAutomatico: boolean;
  nome: string;
  email: string;
}
