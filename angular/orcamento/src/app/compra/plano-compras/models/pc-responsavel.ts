export interface PcResponsavel {
  id: number;
  nome: string;
  cargo?: string;
  responsabilidades?: PcResponsabilidadeEnum[];
}

export enum PcResponsabilidadeEnum {
  responsavelEscopo = 1,
  responsavelNegociacao,
  responsavelBatidaMartelo,
}
