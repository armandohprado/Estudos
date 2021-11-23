export enum CheckListParticipanteStatusEnum {
  Ausente = 1,
  Presente,
  Ciente,
}

export interface CheckListParticipanteStatus {
  id: number;
  descricao: string;
}

export function getCheckListParticipantesList(): CheckListParticipanteStatus[] {
  return [
    { id: 1, descricao: 'Ausente' },
    { id: 2, descricao: 'Presente' },
    { id: 3, descricao: 'Ciente' },
  ];
}
