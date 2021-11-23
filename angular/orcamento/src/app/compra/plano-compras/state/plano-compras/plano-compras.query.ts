import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { PlanoComprasState, PlanoComprasStore } from './plano-compras.store';
import { ErrorApi } from '../../../../grupo/definicao-escopo/model/error-api';
import { Observable } from 'rxjs';
import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';
import { KeyofPlanoCompras } from '../../models/plano-compras';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PlanoComprasQuery extends QueryEntity<PlanoComprasState> {
  constructor(protected store: PlanoComprasStore) {
    super(store);
  }

  loading$ = this.selectLoading();
  errorApi$ = this.selectError<ErrorApi>();
  rowData$ = this.selectAll();
  comentarioMetaCompraNegativa$ = this.rowData$.pipe(
    map(rows => {
      return rows.some(row => {
        return row.limiteCompra - row.metaCompra < 0 && !row.comentarioMetaCompra;
      });
    })
  );

  getStatus(id: string, property: KeyofPlanoCompras): Observable<AwInputStatus> {
    return this.selectEntity(id).pipe(map(planoCompra => planoCompra?.statusProperty?.[property]));
  }

  getErrorApi(id: string, property: KeyofPlanoCompras): Observable<ErrorApi> {
    return this.selectEntity(id).pipe(map(planoCompra => planoCompra.errorApi[property]));
  }
}
