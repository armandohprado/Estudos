import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ProjetoAmbienteStore, ProjetoAmbienteState } from './projeto-ambiente.store';
import { Observable } from 'rxjs';
import { ProjetoAmbiente } from '../../models/projeto-ambiente';
import { minBy } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class ProjetoAmbienteQuery extends QueryEntity<ProjetoAmbienteState> {
  constructor(protected store: ProjetoAmbienteStore) {
    super(store);
  }

  selectProjetoEdificioPavimento(idProjetoEdificioPavimento: number): Observable<ProjetoAmbiente[]> {
    return this.selectAll({
      filterBy: projetoAmbiente => projetoAmbiente.idProjetoEdificioPavimento === idProjetoEdificioPavimento,
    });
  }

  getMinId(): number {
    const min = minBy(this.getAll(), 'idProjetoAmbiente')?.idProjetoAmbiente ?? 0;
    return min <= 0 ? min : 0;
  }
}
