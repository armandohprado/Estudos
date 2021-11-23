import { Pipe, PipeTransform } from '@angular/core';
import { GruposTransferenciaCC, TransferenciaCC } from '@aw-models/transferencia-cc';
import { TipoConfirmacaoCompraEnum } from '../../../models/tipo-confirmacao-compra.enum';

export function filterCenarioGrupo(value: TransferenciaCC[]): GruposTransferenciaCC[] {
  return value
    .filter(cenario => cenario.contratoPrincipal)
    .reduce((accCenario, cenario) => {
      return [
        ...accCenario,
        ...cenario.familias.reduce((accFamilia, familia) => {
          return [
            ...accFamilia,
            ...familia.grupos.filter(
              grupo => grupo.idTipoConfirmacaoCompra === TipoConfirmacaoCompraEnum.Miscellaneous
            ),
          ];
        }, [] as GruposTransferenciaCC[]),
      ];
    }, [] as GruposTransferenciaCC[]);
}

@Pipe({ name: 'filterCenarioGrupo' })
export class FilterCenarioGrupoPipe implements PipeTransform {
  transform(value: TransferenciaCC[]): GruposTransferenciaCC[] {
    return filterCenarioGrupo(value);
  }
}
