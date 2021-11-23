import { LousaGrupo, LousaGrupoCirculoClass } from '../models/lousa-grupo';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { environment } from '../../../environments/environment';
import { isAfter } from 'date-fns';
import { orderByCodigoWithoutDefinedNumberOfDots } from '@aw-utils/grupo-item/sort-by-numeracao';

export function lousaMapGrupos(grupos: LousaGrupo[]): LousaGrupo[] {
  return orderBy(
    grupos.map(grupo => {
      // Transforma as datas de string para Date
      grupo = {
        ...grupo,
        dataLimiteCC: grupo.dataLimiteCC && new Date(grupo.dataLimiteCC),
        confirmacaoCompras: (grupo.confirmacaoCompras ?? []).map(confirmacaoCompra => {
          const numeracaoSemCC = confirmacaoCompra.numeracao.replace(/\D/g, '');
          return {
            ...confirmacaoCompra,
            dataEmissaoCC: confirmacaoCompra.dataEmissaoCC && new Date(confirmacaoCompra.dataEmissaoCC),
            urlCentralizacao: `${environment.centralizacao}projetos/web/printpagina/OpenReport.aspx?cce_id=${numeracaoSemCC}`,
          };
        }),
      };

      // Define qual será a cor do circulo
      let circuloClass: LousaGrupoCirculoClass = 'grey';
      if (grupo.confirmacaoCompras.length && grupo.dataLimiteCC) {
        if (
          grupo.confirmacaoCompras.some(confirmacaoCompra =>
            isAfter(confirmacaoCompra.dataEmissaoCC, grupo.dataLimiteCC)
          )
        ) {
          circuloClass = 'red';
        } else {
          circuloClass = 'green';
        }
      }
      return { ...grupo, circuloClass };
    }),
    orderByCodigoWithoutDefinedNumberOfDots<LousaGrupo>('codigo')
  );
}
