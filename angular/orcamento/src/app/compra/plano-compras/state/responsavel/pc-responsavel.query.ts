import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { PcResponsavelState, PcResponsavelStore } from './pc-responsavel.store';
import { Observable } from 'rxjs';
import {
  PcResponsabilidadeEnum,
  PcResponsavel,
} from '../../models/pc-responsavel';

@Injectable({ providedIn: 'root' })
export class PcResponsavelQuery extends QueryEntity<PcResponsavelState> {
  constructor(protected store: PcResponsavelStore) {
    super(store);
  }

  getByResponsabilidade(
    responsabilidade: PcResponsabilidadeEnum
  ): Observable<PcResponsavel[]> {
    return this.selectAll({
      filterBy: entity => entity.responsabilidades.includes(responsabilidade),
    });
  }

  isLoading(): boolean {
    return this.getValue().loading;
  }

  hasAny(responsabilidade: PcResponsabilidadeEnum): boolean {
    return this.getAll().some(o =>
      o.responsabilidades.includes(responsabilidade)
    );
  }
}
