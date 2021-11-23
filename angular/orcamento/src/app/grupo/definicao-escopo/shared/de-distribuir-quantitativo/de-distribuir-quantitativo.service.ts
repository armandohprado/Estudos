import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { isNil } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class DeDistribuirQuantitativoService {
  constructor() {}

  private _loading = new Subject<{ [id: string]: boolean }>();
  private _focus$ = new Subject<string>();
  loading = this._loading.asObservable();
  focus$ = this._focus$.asObservable().pipe(debounceTime(50));

  emitLoading(
    idOrcamentoGrupoItem: number,
    idFase: number,
    idProjetoEdificioPavimento: number,
    idProjetoCentroCusto: number,
    loading: boolean,
    value?: number | null
  ): void {
    const id = this.createId(idOrcamentoGrupoItem, idFase, idProjetoEdificioPavimento, idProjetoCentroCusto);
    this._loading.next({ [id]: loading });
    if (!loading && !isNil(value)) {
      this._focus$.next(id);
    }
  }

  createId(
    idOrcamentoGrupoItem: number,
    idFase: number,
    idProjetoEdificioPavimento: number,
    idProjetoCentroCusto: number
  ): string {
    return '' + idOrcamentoGrupoItem + idFase + idProjetoEdificioPavimento + idProjetoCentroCusto;
  }
}
