import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeOrderFamiliaStore } from './change-order-familia.store';
import { Observable } from 'rxjs';
import { Familia, FamiliaCustomizada, Grupao, Grupo } from '@aw-models/index';
import { map, tap } from 'rxjs/operators';
import { ChangeOrderFamiliaQuery } from './change-order-familia.query';
import { arrayUpdate, setLoading } from '@datorama/akita';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChangeOrderFamiliaService {
  constructor(
    private changeOrderFamiliaStore: ChangeOrderFamiliaStore,
    private http: HttpClient,
    private changeOrderFamiliaQuery: ChangeOrderFamiliaQuery
  ) {}

  private target = environment.AwApiUrl + 'change-order';

  getFamilias(idOrcamentoChangeOrder?: number): Observable<Familia[]> {
    let params = new HttpParams();
    if (idOrcamentoChangeOrder) {
      params = params.set('idOrcamentoChangeOrder', '' + idOrcamentoChangeOrder);
    }
    return this.http
      .get<Familia[]>(
        `${this.target}/${
          idOrcamentoChangeOrder ? 'listar-familia-grupao-grupo/edicao' : 'listar-familia-grupao-grupo'
        }`,
        { params }
      )
      .pipe(
        map(familias => familias.filter(familia => familia.ativo)),
        map(familias =>
          familias.map(familia => ({
            ...familia,
            customizada: !!familia.idFamiliaCustomizada,
            id: `${familia.idFamilia ?? familia.idFamiliaCustomizada}${!!familia.idFamiliaCustomizada ? 'custom' : ''}`,
          }))
        ),
        map(familias => {
          if (idOrcamentoChangeOrder) {
            return familias.map(familia => {
              return {
                ...familia,
                grupoes: familia.grupoes.map(grupao => {
                  return {
                    ...grupao,
                    grupos: grupao.grupos.map(grupo => {
                      return {
                        ...grupo,
                        idOrcamentoGrupo: grupo.selecionado ? 1 : null,
                      };
                    }),
                  };
                }),
              };
            });
          }
          return familias;
        }),
        tap(familias => {
          this.changeOrderFamiliaStore.set(familias);
        })
      );
  }

  salvarFamiliaCustomizada(idOrcamento: number, idFamilia: string): Observable<FamiliaCustomizada> {
    const { idFamiliaCustomizada, descricaoFamilia } = this.changeOrderFamiliaQuery.getEntity(idFamilia);
    const familiaCustomizada: FamiliaCustomizada = {
      idFamiliaCustomizada,
      idOrcamento,
      nomeFamiliaCustomizada: descricaoFamilia,
    };
    return this.http
      .put<FamiliaCustomizada>(
        `${environment.ApiUrl}orcamentos/${idOrcamento}/familias-customizadas/${familiaCustomizada.idFamiliaCustomizada}`,
        familiaCustomizada
      )
      .pipe(setLoading(this.changeOrderFamiliaStore));
  }

  setActive(id: string): void {
    if (this.changeOrderFamiliaQuery.hasActive(id)) return;
    this.changeOrderFamiliaStore.setActive(id);
  }

  updateGrupo(id: string, idGrupao: number, idGrupo: number, partial: Partial<Grupo>): void {
    this.changeOrderFamiliaStore.update(id, familia => {
      return {
        ...familia,
        grupoes: familia.grupoes.map(grupao => {
          if (grupao.idGrupao === idGrupao) {
            grupao = {
              ...grupao,
              grupos: grupao.grupos.map(grupo => {
                if (grupo.idGrupo === idGrupo) {
                  grupo = { ...grupo, ...partial };
                }
                return grupo;
              }),
            };
          }
          return grupao;
        }),
      };
    });
  }

  updateGrupao(id: string, idGrupao: number, partial: Partial<Grupao>): void {
    this.changeOrderFamiliaStore.update(id, familia => {
      return {
        ...familia,
        grupoes: arrayUpdate(familia.grupoes, idGrupao, partial, 'idGrupao'),
      };
    });
  }

  addFamiliaCustomizada(idOrcamento: number, nome: string, id: number): Observable<Grupao[]> {
    return this.http.get<Grupao[]>(`${this.target}/listar-grupao-grupo`).pipe(
      setLoading(this.changeOrderFamiliaStore),
      map(grupoes =>
        grupoes.map(grupao => ({
          ...grupao,
          idFamilia: null,
          idFamiliaCustomizada: id,
          grupos: grupao.grupos.map(grupo => ({
            ...grupo,
            idFamilia: null,
            idFamiliaCustomizada: id,
          })),
        }))
      ),
      tap(grupoes => {
        this.changeOrderFamiliaStore.add({
          grupoes,
          idFamilia: null,
          ativo: true,
          idOrcamentoFamilia: null,
          id: id + 'custom',
          idFamiliaCustomizada: null,
          customizada: true,
          descricaoFamilia: nome,
          ordemFamilia: null,
          numeroFamilia: null,
          idOrcamentoCenario: 0,
        });
      })
    );
  }

  update(idFamilia: string, partial: Partial<Familia>): void {
    this.changeOrderFamiliaStore.update(idFamilia, partial);
  }

  destroy(): void {
    this.changeOrderFamiliaStore.setActive(null);
  }
}
