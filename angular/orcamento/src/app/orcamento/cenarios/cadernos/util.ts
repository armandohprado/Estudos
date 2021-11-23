import { Caderno } from '@aw-models/cadernos/caderno';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';

export function mapCadernos(cadernos: Caderno[]): Caderno[] {
  return cadernos.map(caderno => ({
    ...caderno,
    cadernoPlanilhaHistoricos: orderBy(
      (caderno.cadernoPlanilhaHistoricos ?? []).map(cadernoPlanilhaHistorico => ({
        ...cadernoPlanilhaHistorico,
        extensao: cadernoPlanilhaHistorico.url.toLowerCase().endsWith('.pdf') ? 'PDF' : 'EXCEL',
        dataGeracao: cadernoPlanilhaHistorico.dataGeracao && new Date(cadernoPlanilhaHistorico.dataGeracao),
      })),
      'dataGeracao',
      'desc'
    ),
  }));
}
