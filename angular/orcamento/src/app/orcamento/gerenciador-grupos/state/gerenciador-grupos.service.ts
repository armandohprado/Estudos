import { Injectable } from '@angular/core';
import { GerenciadorGruposStore } from './gerenciador-grupos.store';
import { CenarioFamiliaGG, CenarioGG, FamiliaGG, GrupoGG } from './gerenciador-grupo.model';
import { isFunction } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class GerenciadorGruposService {
  constructor(private gerenciadorGruposStore: GerenciadorGruposStore) {}

  toggleCollapseGrupoes(idOrcamentoCenarioFamilia: number): void {
    this.gerenciadorGruposStore.update(idOrcamentoCenarioFamilia, familia => {
      return { ...familia, isCollapse: !familia.isCollapse };
    });
  }

  editandoFamilia(
    idOrcamentoFamilia: number | ((familia: FamiliaGG) => boolean),
    partial: Partial<FamiliaGG> | ((familia: FamiliaGG) => FamiliaGG)
  ): void {
    const predicate = isFunction(idOrcamentoFamilia)
      ? idOrcamentoFamilia
      : (familia: FamiliaGG) => familia.idOrcamentoFamilia === idOrcamentoFamilia;
    const update = isFunction(partial) ? partial : (oldUpdate: FamiliaGG) => ({ ...oldUpdate, ...partial });
    this.gerenciadorGruposStore.update(predicate, update);
  }

  editandoGrupo(
    idOrcamentoFamilia: number | ((familia: FamiliaGG) => boolean),
    idOrcamentoGrupo: number | ((grupo: GrupoGG) => boolean),
    partial: Partial<GrupoGG> | ((grupo: GrupoGG) => GrupoGG)
  ): void {
    const predicate = isFunction(idOrcamentoGrupo)
      ? idOrcamentoGrupo
      : (grupo: GrupoGG) => grupo.idOrcamentoGrupo === idOrcamentoGrupo;
    const update = isFunction(partial) ? partial : (oldUpdate: GrupoGG) => ({ ...oldUpdate, ...partial });
    this.editandoFamilia(idOrcamentoFamilia, familia => {
      return {
        ...familia,
        grupos: familia.grupos.map(grupo => {
          if (predicate(grupo)) {
            grupo = update(grupo);
          }
          return grupo;
        }),
      };
    });
  }

  editandoCenarioFamilia(
    idOrcamentoFamilia: number | ((familia: FamiliaGG) => boolean),
    idOrcamentoCenarioFamilia: number | ((cenarioFamilia: CenarioFamiliaGG) => boolean),
    partial: Partial<CenarioFamiliaGG> | ((cenario: CenarioFamiliaGG) => CenarioFamiliaGG)
  ): void {
    const predicate = isFunction(idOrcamentoCenarioFamilia)
      ? idOrcamentoCenarioFamilia
      : (cenarioFamilia: CenarioFamiliaGG) => cenarioFamilia?.idOrcamentoCenarioFamilia === idOrcamentoCenarioFamilia;
    const update = isFunction(partial) ? partial : (oldUpdate: CenarioFamiliaGG) => ({ ...oldUpdate, ...partial });
    this.editandoFamilia(idOrcamentoFamilia, familia => {
      return {
        ...familia,
        orcamentoCenarioFamilias: familia.orcamentoCenarioFamilias.map(orcamentoCenarioFamilia => {
          if (predicate(orcamentoCenarioFamilia)) {
            orcamentoCenarioFamilia = update(orcamentoCenarioFamilia);
          }
          return orcamentoCenarioFamilia;
        }),
      };
    });
  }

  editandoCenario(
    idOrcamentoCenario: number | ((cenario: CenarioGG) => boolean),
    idOrcamentoFamilia: number | ((familia: FamiliaGG) => boolean),
    idOrcamentoGrupo: number | ((grupo: GrupoGG) => boolean),
    partial: Partial<CenarioGG> | ((cenario: CenarioGG) => CenarioGG)
  ): void {
    const predicate = isFunction(idOrcamentoCenario)
      ? idOrcamentoCenario
      : (cenario: CenarioGG) => cenario?.idOrcamentoCenario === idOrcamentoCenario;
    const update = isFunction(partial) ? partial : (cenario: CenarioGG) => ({ ...cenario, ...partial });
    this.editandoGrupo(idOrcamentoFamilia, idOrcamentoGrupo, grupo => {
      return {
        ...grupo,
        cenarios: grupo.cenarios.map(cenario => {
          if (predicate(cenario)) {
            cenario = update(cenario);
          }
          return cenario;
        }),
      };
    });
  }
}
