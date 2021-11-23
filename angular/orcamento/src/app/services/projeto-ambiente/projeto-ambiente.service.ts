import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProjetoAmbienteStore } from './projeto-ambiente.store';
import { Observable } from 'rxjs';
import { ProjetoAmbiente, ProjetoAmbienteSelecionarPayload } from '../../models/projeto-ambiente';
import { finalize, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProjetoAmbienteQuery } from './projeto-ambiente.query';

@Injectable({ providedIn: 'root' })
export class ProjetoAmbienteService {
  constructor(
    private projetoAmbienteStore: ProjetoAmbienteStore,
    private http: HttpClient,
    private projetoAmbienteQuery: ProjetoAmbienteQuery
  ) {}

  target = environment.AwApiUrl + 'projetos/ambiente';

  getByProjetoEdificioPavimento(idProjetoEdificioPavimento: number): Observable<ProjetoAmbiente[]> {
    return this.http.get<ProjetoAmbiente[]>(`${this.target}/${idProjetoEdificioPavimento}`).pipe(
      tap(ambientes => {
        this.projetoAmbienteStore.upsertMany(ambientes);
      })
    );
  }

  criar(payload: ProjetoAmbiente): Observable<ProjetoAmbiente> {
    const newPayload = { ...payload, idProjetoAmbiente: 0 };
    if (payload.idProjetoAmbiente <= 0) {
      this.projetoAmbienteStore.update(payload.idProjetoAmbiente, { saving: true });
    }
    return this.http.post<ProjetoAmbiente>(this.target, newPayload).pipe(
      tap(ambiente => {
        if (payload.idProjetoAmbiente <= 0) {
          this.projetoAmbienteStore.update(payload.idProjetoAmbiente, { ...ambiente, saving: false });
        } else {
          this.projetoAmbienteStore.add(ambiente);
        }
      }),
      finalize(() => {
        if (payload.idProjetoAmbiente <= 0) {
          this.projetoAmbienteStore.update(payload.idProjetoAmbiente, { saving: false });
        }
      })
    );
  }

  atualizar(payload: ProjetoAmbiente): Observable<ProjetoAmbiente> {
    this.projetoAmbienteStore.update(payload.idProjetoAmbiente, { saving: true });
    return this.http.put<ProjetoAmbiente>(this.target, payload).pipe(
      tap(ambiente => {
        this.projetoAmbienteStore.update(ambiente.idProjetoAmbiente, ambiente);
      }),
      finalize(() => {
        this.projetoAmbienteStore.update(payload.idProjetoAmbiente, { saving: false });
      })
    );
  }

  excluir(idProjetoAmbiente: number): Observable<void> {
    this.projetoAmbienteStore.update(idProjetoAmbiente, { deleting: true });
    return this.http.delete<void>(`${this.target}/${idProjetoAmbiente}`).pipe(
      tap(() => {
        this.projetoAmbienteStore.remove(idProjetoAmbiente);
      }),
      finalize(() => {
        this.projetoAmbienteStore.update(idProjetoAmbiente, { deleting: false });
      })
    );
  }

  selecionarAmbientes(payload: ProjetoAmbienteSelecionarPayload): Observable<void> {
    return this.http.put<void>(`${this.target}/selecionar`, payload);
  }

  addNew(idProjetoEdificioPavimento: number): ProjetoAmbiente {
    const minId = this.projetoAmbienteQuery.getMinId();
    const projetoAmbiente: ProjetoAmbiente = {
      idProjetoAmbiente: minId - 1,
      forro: '',
      idTipoForro: 1,
      peDireito: 0,
      metragem: 0,
      nomeAmbiente: '',
      idProjetoEdificioPavimento,
    };
    this.projetoAmbienteStore.add(projetoAmbiente);
    return projetoAmbiente;
  }

  deleteNew(idProjetoAmbiente: number): void {
    this.projetoAmbienteStore.remove(idProjetoAmbiente);
  }

  clearNew(): void {
    this.projetoAmbienteStore.remove(projetoAmbiente => projetoAmbiente.idProjetoAmbiente <= 0);
  }

  update(idProjetoAmbiente: number, partial: Partial<ProjetoAmbiente>): void {
    this.projetoAmbienteStore.update(idProjetoAmbiente, partial);
  }
}
