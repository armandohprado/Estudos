import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ChangeOrderFamiliaStore, ChangeOrderFamiliaState } from './change-order-familia.store';
import { Familia } from '@aw-models/index';
import { PayloadChangeOrderFamilia } from '../../models/payload-change-order';

@Injectable({ providedIn: 'root' })
export class ChangeOrderFamiliaQuery extends QueryEntity<ChangeOrderFamiliaState> {
  constructor(protected store: ChangeOrderFamiliaStore) {
    super(store);
  }

  all$ = this.selectAll();
  loading$ = this.selectLoading();

  getFamiliaPayload(filterCreated?: boolean): PayloadChangeOrderFamilia[] {
    const familias: Familia[] = this.getAll()
      .map(familia => {
        return {
          ...familia,
          grupoes: familia.grupoes
            .map(grupao => {
              let grupos = grupao.grupos.filter(grupo => grupo.selecionado);
              if (filterCreated) {
                grupos = grupos.filter(grupo => !grupo.idOrcamentoGrupo);
              }
              return {
                ...grupao,
                grupos,
              };
            })
            .filter(grupao => grupao.grupos.length),
        };
      })
      .filter(familia => familia.grupoes.length);
    return familias.map(familia => {
      return {
        descricaoFamilia: familia.descricaoFamilia,
        grupao: familia.grupoes.map(grupao => {
          return {
            idGrupao: grupao.idGrupao,
            descricaoGrupao: grupao.descricaoGrupao,
            ativo: grupao.ativo,
            grupo: grupao.grupos.map(grupo => {
              return {
                idGrupo: grupo.idGrupo,
                nomeGrupo: grupo.nomeGrupo,
                codigoGrupo: grupo.nomeGrupo,
              };
            }),
          };
        }),
        idFamilia: familia.idFamilia,
        idFamiliaCustomizada: familia.idFamiliaCustomizada,
        numeroFamilia: familia.numeroFamilia,
        ordemFamilia: familia.ordemFamilia,
        idOrcamentoFamilia: familia.idOrcamentoFamilia,
      };
    });
  }

  getFirstFamilia(): Familia {
    return this.getAll()[0];
  }
}
