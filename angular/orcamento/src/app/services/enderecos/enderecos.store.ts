import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Pais } from '../../models/enderecos/pais';
import { Estado } from '../../models/enderecos/estado';
import { Cidade } from '../../models/enderecos/cidade';

export interface EnderecosState {
  paises: Pais[];
  estados: Estado[];
  cidades: Cidade[];
}

export function createInitialState(): EnderecosState {
  return {
    cidades: [],
    estados: [],
    paises: [],
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'enderecos' })
export class EnderecosStore extends Store<EnderecosState> {
  constructor() {
    super(createInitialState());
  }
}
