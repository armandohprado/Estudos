export interface CheckListStatus {
  id: number;
  descricao: string;
  idCheckListTipoStatus: number;
}

export enum CheckListTipoStatusEnum {
  Comum = 1,
  Checklist,
  ChangeOrder,
}

export enum CheckListStatusEnum {
  NA = 1,
  Atrasado,
  EmAndamento,
  Alerta,
  Concluido,
  ConcluidoComAtraso,
  Aprovada,
  NaoAprovada,
  EmAnalise,
}

export enum CheckListStatusDescricaoEnum {
  NA = 'NA',
  Atrasado = 'Atrasado',
  EmAndamento = 'Em Andamento',
  Alerta = 'Alerta',
  Concluido = 'Concluído',
  ConcluidoComAtraso = 'Concluído com Atraso',
  Aprovada = 'Aprovada',
  NaoAproavada = 'Não Aprovada',
  EmAnalise = 'Em Análise',
}
