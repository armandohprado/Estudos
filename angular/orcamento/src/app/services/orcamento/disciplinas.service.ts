import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Disciplina, DisciplinaFilters } from '../../models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { filter, finalize, shareReplay, switchMap } from 'rxjs/operators';
import { AwHttpParams } from '@aw-utils/http-params';

@Injectable({
  providedIn: 'root',
})
export class DisciplinasService {
  constructor(private http: HttpClient) {}

  private disciplinaFilters$ = new BehaviorSubject<[idProjeto: number, filters: DisciplinaFilters]>([null, null]);

  loading$ = new BehaviorSubject<boolean>(false);

  disciplinas$: Observable<Disciplina[]> = this.disciplinaFilters$.pipe(
    filter(([idProjeto, filters]) => !!idProjeto && !!filters),
    switchMap(([idProjeto, filters]) => {
      this.loading$.next(true);
      const params = new AwHttpParams(filters);
      return this.http.get<Disciplina[]>(`${environment.ApiUrl}projetos/${idProjeto}/disciplinas`, { params }).pipe(
        finalize(() => {
          this.loading$.next(false);
        })
      );
    }),
    shareReplay()
  );

  applyFilters(idProjeto: number, filters: DisciplinaFilters): void {
    this.disciplinaFilters$.next([idProjeto, filters]);
  }
}
