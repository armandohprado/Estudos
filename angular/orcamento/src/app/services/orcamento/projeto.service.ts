import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProjetoAlt } from '@aw-models/projeto';
import { environment } from '../../../environments/environment';
import { Title } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import type { CnEnderecoObra } from '../../compra/models/cn-endereco-obra';
import { EmpresaFaturamento, EmpresaFaturamentoTipo } from '@aw-models/empresa-faturamento';
import { CacheService } from '@aw-services/cache/cache.service';

@Injectable({ providedIn: 'root' })
export class ProjetoService {
  constructor(private http: HttpClient, private title: Title, private cacheService: CacheService) {}

  private readonly _cache = this.cacheService.createCache();
  private readonly _target = environment.AwApiUrl + 'projetos';
  private readonly _projeto$ = new BehaviorSubject<ProjetoAlt | null>(null);

  readonly projeto$ = this._projeto$.asObservable();

  getProjetoSnapshot(): ProjetoAlt | null {
    return { ...this._projeto$.value };
  }

  get(idProjeto: number): Observable<ProjetoAlt> {
    return this.http.get<ProjetoAlt>(`${this._target}/${idProjeto}`).pipe(
      this._cache.use(idProjeto),
      tap(projeto => {
        this._projeto$.next(projeto);
        this.title.setTitle(`Orçamento - Focus - PRJ-${projeto.numeroProjeto}`);
      })
    );
  }

  getCnEnderecoObra(idProjeto: number): Observable<CnEnderecoObra> {
    return this.http.get<CnEnderecoObra>(`${this._target}/${idProjeto}/enderecos`);
  }

  putCnEnderecoObra(idProjeto: number, payload: CnEnderecoObra): Observable<void> {
    return this.http.put<void>(`${this._target}/${idProjeto}/enderecos`, payload);
  }

  getEmpresasFaturamento(idProjeto: number, tipo: EmpresaFaturamentoTipo): Observable<EmpresaFaturamento[]> {
    return this.http.get<EmpresaFaturamento[]>(`${this._target}/${idProjeto}/empresas-faturamento-${tipo}`);
  }
}
