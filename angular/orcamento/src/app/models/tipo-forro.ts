import { trackByFactory } from '../utils/track-by';

export interface TipoForro {
  idTipoForro: number;
  descricao: string;
}

export enum TipoForroEnum {
  comForro = 1,
  semForro,
  nuvem,
}

export const getTipoForroList = (): ReadonlyArray<TipoForro> => [
  {
    idTipoForro: 1,
    descricao: 'Com forro',
  },
  {
    idTipoForro: 2,
    descricao: 'Sem forro',
  },
  {
    idTipoForro: 3,
    descricao: 'Forro nuvem',
  },
];

export const trackByTipoForro = trackByFactory<TipoForro>('idTipoForro');
