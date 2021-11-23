import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { Cidade } from '../../models/enderecos/cidade';
import { Estado } from '../../models/enderecos/estado';
import { Pais } from '../../models/enderecos/pais';
import { tap } from 'rxjs/operators';
import { EnderecosStore } from './enderecos.store';
import { unionBy } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class EnderecosService {
  constructor(
    private http: HttpClient,
    private enderecosStore: EnderecosStore
  ) {}

  static enderecoAw = {
    cidade: {
      idEstado: 28,
      idCidade: 8957,
      nome: 'SÃO PAULO',
    },
    estado: {
      idEstado: 28,
      idPais: 1,
      nome: 'São Paulo',
      sigla: 'SP  ',
    },
    pais: {
      idPais: 1,
      nome: 'BRASIL',
    },
  };

  private target = environment.AwApiUrl + 'enderecos';

  getCidades(idEstado?: number): Observable<Cidade[]> {
    const url = idEstado ? `/estados/${idEstado}/cidades` : '/cidades';
    if (idEstado) {
      const cidades = this.enderecosStore
        .getValue()
        .cidades.filter(o => o.idEstado === idEstado);
      if (cidades.length) {
        return of(cidades);
      }
    }
    return this.http.get<Cidade[]>(`${this.target}${url}`).pipe(
      tap(cidades => {
        this.enderecosStore.update(state => {
          const cidadesToInsert = unionBy(state.cidades, cidades, 'idCidade');
          return {
            ...state,
            cidades: cidadesToInsert,
          };
        });
      })
    );
  }

  getEstados(idPais?: number): Observable<Estado[]> {
    const url = idPais ? `/paises/${idPais}/estados` : '/estados';
    if (idPais) {
      const estados = this.enderecosStore
        .getValue()
        .estados.filter(o => o.idPais === idPais);
      if (estados.length) {
        return of(estados);
      }
    }
    return this.http.get<Estado[]>(`${this.target}${url}`).pipe(
      tap(estados => {
        this.enderecosStore.update(state => {
          const estadosToInsert = unionBy(state.estados, estados, 'idEstado');
          return {
            ...state,
            estados: estadosToInsert,
          };
        });
      })
    );
  }

  getPaises(): Observable<Pais[]> {
    const paisesStored = this.enderecosStore.getValue().paises;
    if (paisesStored?.length) {
      return of(paisesStored);
    }
    return this.http.get<Pais[]>(`${this.target}/paises`).pipe(
      tap(paises => {
        if (!this.enderecosStore.getValue()?.paises?.length) {
          this.enderecosStore.update({ paises });
        }
      })
    );
  }
}
