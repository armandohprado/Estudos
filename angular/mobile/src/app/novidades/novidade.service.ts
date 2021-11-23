import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, switchMap, switchMapTo, tap } from 'rxjs';
import { CardNovidades, UpdateAndCreateCardNovidades } from './models/novidade';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@aw-environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NovidadeService {
  constructor(private httpClient: HttpClient) {}
  target = `${environment.api}/cartao-novidade`;
  targetGA = `${environment.gerenciadorArquivo}`;
  listaCard$ = new BehaviorSubject<CardNovidades[]>([]);

  getCartaoNovidade(): Observable<CardNovidades[]> {
    return this.httpClient.get<CardNovidades[]>(`${this.target}`).pipe(tap(cards => this.listaCard$.next(cards)));
  }

  excluirCardNovidade(idCartaoNovidade: number): void {
    this.httpClient
      .delete(`${this.target}/${idCartaoNovidade}`)
      .pipe(switchMapTo(this.getCartaoNovidade()))
      .subscribe();
  }

  editarCardNovidade(card: UpdateAndCreateCardNovidades): void {
    this.httpClient.put(`${this.target}/${card.id}`, card).pipe(switchMapTo(this.getCartaoNovidade())).subscribe();
  }

  adicionarCardNovidades(card: Omit<UpdateAndCreateCardNovidades, 'id'>): void {
    card = { ...card, corFundo: card.corFundo.substr(1) };
    this.httpClient.post(`${this.target}`, card).pipe(switchMapTo(this.getCartaoNovidade())).subscribe();
  }

  sendFile(files: any): Observable<{ arquivo: string }> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('arquivo', file, file.name);
    }

    const headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');

    return this.httpClient.post<{ arquivo: string }>(`${this.targetGA}`, formData, {
      headers,
    });
  }
}
