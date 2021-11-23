import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { UnidadeMedidaStore, UnidadeMedidasState } from './unidade-medida.store';
import { UnidadeMedida } from '../../models/unidade-medida';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UnidadeMedidaQuery extends QueryEntity<UnidadeMedidasState> {
  constructor(protected store: UnidadeMedidaStore) {
    super(store);
  }

  all$ = this.selectAll();

  getNome(nome: string): UnidadeMedida | undefined {
    return this.getAll().find(uni => {
      return uni.descricao === nome;
    });
  }

  selectNome(nome: string): Observable<UnidadeMedida | undefined> {
    return this.selectAll().pipe(
      map(unidades => {
        return unidades.find(uni => {
          return uni.descricao === nome;
        });
      })
    );
  }
}
