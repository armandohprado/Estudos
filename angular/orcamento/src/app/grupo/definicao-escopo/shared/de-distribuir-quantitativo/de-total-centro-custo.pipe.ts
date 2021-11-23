import { Pipe, PipeTransform } from '@angular/core';
import { Pavimento } from './model/pavimento';
import { CentroCusto } from './model/centro-custo';
import { sumBy } from 'lodash-es';

@Pipe({
  name: 'deTotalCentroCusto',
})
export class DeTotalCentroCustoPipe implements PipeTransform {
  transform(
    edificio: Pavimento,
    idProjetoCentroCusto: number,
    qtdeProperty: 'quantidadeReferencia' | 'quantidadeOrcada'
  ): number {
    const predicate = (centro: CentroCusto) => centro.idProjetoCentroCusto === idProjetoCentroCusto;
    const edificioCentroCusto = edificio.centrosDeCusto.find(predicate);
    const siteCentroCusto = edificio.site?.centrosDeCusto.find(predicate);
    const andaresCentroCustos = edificio.andares
      .map(andar => andar.centrosDeCusto.find(predicate))
      .filter(centro => centro);
    return (
      (siteCentroCusto?.[qtdeProperty] ?? 0) +
      (edificioCentroCusto?.[qtdeProperty] ?? 0) +
      (sumBy(andaresCentroCustos, qtdeProperty) ?? 0)
    );
  }
}
