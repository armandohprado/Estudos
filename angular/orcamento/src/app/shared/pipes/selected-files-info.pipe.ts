import { Pipe, PipeTransform } from '@angular/core';
import { Arquivo } from '../../models';

interface SelectedFilesInfo {
  parcial?: boolean;
  counter: number;
}

@Pipe({ name: 'selectedFilesInfo' })
export class SelectedFilesInfoPipe implements PipeTransform {
  transform(arquivos: Arquivo[]): SelectedFilesInfo {
    if (arquivos && arquivos.length) {
      const list = arquivos.filter(arquivo => arquivo.arquivoSelecionado);
      return {
        parcial: list.length < arquivos.length,
        counter: list.length,
      };
    }
  }
}
