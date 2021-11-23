import { Pipe, PipeTransform } from '@angular/core';
import { TransferenciaCC } from '../../../../models/transferencia-cc';

@Pipe({
  name: 'filterFamiliaGrupoTransferenciaCc',
})
export class FilterFamiliaGrupoTransferenciaCcPipe implements PipeTransform {
  transform(transferenciaCC: TransferenciaCC[], familias: number[], grupos: number[]): TransferenciaCC[] {
    if ((!grupos?.length && !familias?.length) || !transferenciaCC?.length) {
      return transferenciaCC ?? [];
    }
    let transferenciasCopia = [...transferenciaCC];
    if (familias.length) {
      transferenciasCopia = transferenciasCopia
        .map(cop => ({ ...cop }))
        .map(transferencia => {
          transferencia.familias = transferencia.familias.filter(familia => {
            return familias.includes(familia.idOrcamentoFamilia);
          });
          return transferencia;
        })
        .filter(transferencia => {
          return transferencia.familias.length;
        });
    }
    if (grupos.length) {
      transferenciasCopia = transferenciasCopia
        .map(cop => ({ ...cop }))
        .map(transferencia => {
          transferencia.familias = transferencia.familias
            .map(cop => ({ ...cop }))
            .map(familia => {
              familia.grupos = familia.grupos.filter(grupo => {
                return grupos.includes(grupo.idCompraNegociacaoGrupo);
              });
              return familia;
            })
            .filter(familia => {
              return familia.grupos.length;
            });
          return transferencia;
        })
        .filter(transferencia => {
          return transferencia.familias.length;
        });
    }
    return transferenciasCopia;
  }
}
