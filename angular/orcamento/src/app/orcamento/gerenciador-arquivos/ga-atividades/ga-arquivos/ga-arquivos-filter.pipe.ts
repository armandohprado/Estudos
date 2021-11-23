import { Pipe, PipeTransform } from '@angular/core';
import { GaArquivo } from '../../model/atividade';

@Pipe({
  name: 'gaArquivosFilter',
})
export class GaArquivosFilterPipe implements PipeTransform {
  transform(arquivos: GaArquivo[], onlySelected: boolean): GaArquivo[] {
    if (arquivos?.length && onlySelected) {
      arquivos = arquivos.filter(arquivo => arquivo.checked);
    }
    return arquivos;
  }
}
