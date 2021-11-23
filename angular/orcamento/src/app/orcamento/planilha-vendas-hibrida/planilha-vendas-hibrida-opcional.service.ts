import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlanilhaHibrida } from './models/grupo';
import { finalize, tap } from 'rxjs/operators';

import { FamiliaGrupoOpcional, GrupaoOpcional, TaxasGruposOpcionais } from './models/grupo-opcional';

@Injectable({ providedIn: 'root' })
export class PlanilhaVendasHibridaOpcionalService {
  constructor(private http: HttpClient) {}

  urlAPI = `${environment.AwApiUrl}planilha-vendas-hibrida`;
  _familias$ = new BehaviorSubject<FamiliaGrupoOpcional[]>([]);
  familias$ = this._familias$.asObservable();
  _taxasCenario$ = new BehaviorSubject<TaxasGruposOpcionais>(null);

  atualizarPlanilhaHibridaOpc(
    idOrcamentoFamilia: number,
    idGrupao: number,
    objPlanilhaHibrida: PlanilhaHibrida,
    idOrcamento: number,
    idOrcamentoCenario: number
  ): Observable<any> {
    const url = `${this.urlAPI}/CalcularPlanilhaHibrida`;
    return this.http.put(url, objPlanilhaHibrida).pipe(
      finalize(() => {
        this.updateGrupo(objPlanilhaHibrida.idOrcamentoCenarioFamilia);
      })
    );
  }

  getFamiliaGruposOpcionais(idOrcamentoCenario: number): Observable<FamiliaGrupoOpcional[]> {
    const url = `${this.urlAPI}/orcamento-cenarios/${idOrcamentoCenario}/orcamento-cenarios-familias`;
    return this.http.get<FamiliaGrupoOpcional[]>(url).pipe(
      tap(familias => {
        {
          this._familias$.next(familias);
        }
      })
    );
  }

  getGrupaoOpcional(idOrcamentoCenarioFamilia: number): Observable<GrupaoOpcional[]> {
    const url = `${this.urlAPI}/orcamento-cenarios-familias/${idOrcamentoCenarioFamilia}`;
    return this.http.get<GrupaoOpcional[]>(url);
  }

  getTaxasGrupaoOpcional(idOrcamentoCenario: number): Observable<TaxasGruposOpcionais> {
    const url = `${this.urlAPI}/orcamento-cenarios/${idOrcamentoCenario}/taxas-administrativas-grupo-opcional`;
    return this.http.get<TaxasGruposOpcionais>(url).pipe(tap(taxas => this._taxasCenario$.next(taxas)));
  }

  putFamiliaGrupoOpcional(payload: {
    idOrcamentoCenarioFamilia: number;
    idOrcamentoCenario: number;
    percentual: number;
    valor: number;
    origem: number;
    fixoFinalProposta: boolean;
  }): Observable<any> {
    const url = `${this.urlAPI}/calcular-colunas-planilha-hibrida-opcional`;
    return this.http.put(url, payload);
  }

  private updateGrupo(idOrcamentoCenarioFamilia: number): void {
    this.getGrupaoOpcional(idOrcamentoCenarioFamilia).pipe();
  }
}
