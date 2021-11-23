import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PcResponsavelStore } from './pc-responsavel.store';
import { Observable } from 'rxjs';
import { Funcionario } from '../../../../models';
import { PcResponsabilidadeEnum, PcResponsavel } from '../../models/pc-responsavel';
import { environment } from '../../../../../environments/environment';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { catchErrorHandler } from '../../util/akita-util';
import { PcResponsavelQuery } from './pc-responsavel.query';
import { isBefore } from 'date-fns';

@Injectable({ providedIn: 'root' })
export class PcResponsavelService {
  constructor(
    public pcResponsavelStore: PcResponsavelStore,
    private http: HttpClient,
    private pcResponsavelQuery: PcResponsavelQuery
  ) {}

  target = `${environment.AwApiUrl}funcionario`;

  private cacheTLL: { [id: number]: Date } = {
    [PcResponsabilidadeEnum.responsavelNegociacao]: null,
    [PcResponsabilidadeEnum.responsavelBatidaMartelo]: null,
    [PcResponsabilidadeEnum.responsavelEscopo]: null,
  };

  private getByResponsabilidade(responsabilidade: PcResponsabilidadeEnum): Observable<PcResponsavel[]> {
    return this.http.get<Funcionario[]>(`${this.target}/ObterDadosFuncionario/${responsabilidade}/responsaveis`).pipe(
      map(funcionarios =>
        funcionarios.map(({ idFuncionario, nomeCargo, nomeFantasia }) => ({
          id: idFuncionario,
          nome: nomeFantasia,
          responsabilidades: [responsabilidade],
          cargo: nomeCargo,
        }))
      )
    );
  }

  setByResponsabilidadeApi(responsabilidade: PcResponsabilidadeEnum): void {
    if (this.pcResponsavelQuery.isLoading()) {
      return;
    }
    if (this.cacheTLL[responsabilidade] && this.pcResponsavelQuery.hasAny(responsabilidade)) {
      const now = new Date();
      const lastCall = this.cacheTLL[responsabilidade];
      if (isBefore(now, lastCall)) {
        return;
      }
    }
    this.pcResponsavelStore.setLoading(true);
    this.getByResponsabilidade(responsabilidade)
      .pipe(
        tap(responsaveis => {
          this.pcResponsavelStore.upsertMany(responsaveis);
          this.cacheTLL[responsabilidade] = new Date(new Date().getTime() + 450000);
        }),
        finalize(() => {
          this.pcResponsavelStore.setLoading(false);
        }),
        catchError(
          catchErrorHandler(
            this.pcResponsavelStore,
            'Erro ao carregar os responsáveis',
            this.setByResponsabilidadeApi.bind(this),
            [responsabilidade]
          )
        )
      )
      .subscribe();
  }
}
