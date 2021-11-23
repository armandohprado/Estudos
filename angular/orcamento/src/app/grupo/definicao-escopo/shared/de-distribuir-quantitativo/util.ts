import { Pavimento } from './model/pavimento';
import { sumBy } from 'lodash-es';
import { Fase } from './model/fase';
import { CentroCusto } from './model/centro-custo';
import { Quantitativo } from './model/quantitativo';

export function getValorTotalEdificio(
  edificio: Pavimento,
  property: 'quantidadeReferencia' | 'quantidadeOrcada' = 'quantidadeReferencia'
): number {
  return (
    sumBy(edificio.centrosDeCusto, property) +
    edificio.andares.reduce((accAndares, andar) => accAndares + sumBy(andar.centrosDeCusto, property), 0) +
    (edificio.site ? sumBy(edificio.site.centrosDeCusto, property) : 0)
  );
}

export function getTotalPavimento(
  fases: Fase[],
  idFase: number,
  pavimento: Pavimento,
  property: 'quantidadeReferencia' | 'quantidadeOrcada'
): number {
  return fases.reduce((acc, fase) => {
    if (fase.idFase === idFase) {
      switch (pavimento.tipo) {
        case 'Andar': {
          acc +=
            fase?.edificios?.reduce((acc1, edificio) => {
              if (edificio.idEdificio === pavimento.idEdificio) {
                acc1 +=
                  edificio?.andares?.reduce((acc2, andar) => {
                    if (andar.idPavimento === pavimento.idPavimento) {
                      acc2 += sumBy(andar?.centrosDeCusto, property);
                    }
                    return acc2;
                  }, 0) ?? 0;
              }
              return acc1;
            }, 0) ?? 0;
          break;
        }
        case 'Prédio': {
          acc +=
            fase?.edificios?.reduce((acc1, edificio) => {
              if (edificio.idEdificio === pavimento.idEdificio) {
                acc1 += sumBy(edificio.centrosDeCusto, property);
              }
              return acc1;
            }, 0) ?? 0;
          break;
        }
        case 'Site': {
          acc +=
            fase?.edificios?.reduce((acc1, edificio) => {
              if (edificio.idEdificio === pavimento.idEdificio) {
                acc1 += sumBy(edificio.site.centrosDeCusto, property);
              }
              return acc1;
            }, 0) ?? 0;
          break;
        }
      }
    }
    return acc;
  }, 0);
}

export function getQtdeTotal(
  fases: Fase[],
  property: 'quantidadeReferencia' | 'quantidadeOrcada' = 'quantidadeReferencia'
): number {
  return fases.reduce(
    (accFase, fase) =>
      accFase +
      fase.edificios.reduce((accEdificio, edificio) => accEdificio + getValorTotalEdificio(edificio, property), 0),
    0
  );
}

export function updateCentroCusto(
  pavimento: Pavimento,
  idProjetoCentroCusto: number,
  centroCusto: Partial<CentroCusto>
): Pavimento {
  const newPavimento = { ...pavimento };
  newPavimento.centrosDeCusto = pavimento.centrosDeCusto.map(centro => {
    if (centro.idProjetoCentroCusto === idProjetoCentroCusto) {
      centro = { ...centro, ...centroCusto };
    }
    return centro;
  });
  return newPavimento;
}

export function mapFase(fase: Fase): Fase {
  return {
    ...fase,
    edificios: fase.edificios.map(edificio => {
      const site = fase.sites.find(s => s.idEdificio === edificio.idEdificio);
      return { ...edificio, site: site ? { ...site, tipo: 'Site' } : null };
    }),
  };
}

export function mapCentroCusto(centroCusto: CentroCusto): CentroCusto {
  return {
    ...centroCusto,
    ativo:
      !!centroCusto.idOrcamentoGrupoItemQuantitativo ||
      !!centroCusto.idPropostaItemQuantitativo ||
      !!centroCusto.quantidadeReferencia,
  };
}

export function mapQuantitativoPavimentosPermitidos(
  quantitativo: Quantitativo,
  pavimentosPermitidos: number[]
): Quantitativo {
  const pavimentosPermitidosSet = new Set(pavimentosPermitidos);
  const permitido = (idProjetoEdificioPavimento: number): boolean =>
    !pavimentosPermitidos.length || pavimentosPermitidosSet.has(idProjetoEdificioPavimento);
  return {
    ...quantitativo,
    fases: quantitativo.fases.map(fase => ({
      ...fase,
      edificios: (fase.edificios ?? []).map(edificio => ({
        ...edificio,
        permitido: permitido(edificio.idProjetoEdificioPavimento),
        andares: (edificio.andares ?? [])
          .map(andar => ({ ...andar, permitido: permitido(andar.idProjetoEdificioPavimento) }))
          .filter(andar => andar.permitido),
        site: edificio.site &&
          permitido(edificio.site.idProjetoEdificioPavimento) && {
            ...edificio.site,
            permitido: permitido(edificio.site.idProjetoEdificioPavimento),
          },
      })),
      sites: (fase.sites ?? [])
        .map(site => ({
          ...site,
          permitido: permitido(site.idProjetoEdificioPavimento),
        }))
        .filter(site => site.permitido),
      andares: (fase.andares ?? [])
        .map(andar => ({ ...andar, permitido: permitido(andar.idProjetoEdificioPavimento) }))
        .filter(andar => andar.permitido),
    })),
  };
}
