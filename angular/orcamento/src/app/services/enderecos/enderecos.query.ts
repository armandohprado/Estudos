import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { EnderecosStore, EnderecosState } from './enderecos.store';
import { Observable } from 'rxjs';
import { Estado } from '@aw-models/enderecos/estado';
import { map } from 'rxjs/operators';
import { Cidade } from '@aw-models/enderecos/cidade';

@Injectable({ providedIn: 'root' })
export class EnderecosQuery extends Query<EnderecosState> {
  constructor(protected store: EnderecosStore) {
    super(store);
  }

  paises$ = this.select('paises');
  estados$ = this.select('estados');
  cidades$ = this.select('cidades');

  selectEstadosByPais(idPais: number): Observable<Estado[]> {
    return this.estados$.pipe(map(estados => estados.filter(estado => estado.idPais === idPais)));
  }

  getEstadosByPaises(...idPais: number[]): Estado[] {
    idPais = idPais.filter(Boolean);
    return this.getValue().estados.filter(estado => idPais.includes(estado.idPais));
  }

  selectCidadesByEstado(idEstado: number): Observable<Cidade[]> {
    return this.cidades$.pipe(map(cidades => cidades.filter(cidade => cidade.idEstado === idEstado)));
  }

  getCidadeById(idCidade: number): Cidade | undefined {
    return this.getValue().cidades.find(cidade => cidade.idCidade === idCidade);
  }

  getCidadeByNome(nome: string): Cidade | undefined {
    return this.getValue().cidades.find(cidade => cidade.nome === nome);
  }
}
