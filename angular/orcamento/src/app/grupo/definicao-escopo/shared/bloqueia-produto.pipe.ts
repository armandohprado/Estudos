import { GrupoClassificacaoEnum } from '@aw-models/grupo-classificacao.enum';
import { Pipe, PipeTransform } from '@angular/core';

export function bloqueiaProduto(classificacao: GrupoClassificacaoEnum): boolean {
  return ![GrupoClassificacaoEnum.produto, GrupoClassificacaoEnum.empreitada].includes(classificacao);
}

@Pipe({ name: 'bloqueiaProduto' })
export class BloqueiaProdutoPipe implements PipeTransform {
  transform(classificacao: GrupoClassificacaoEnum): boolean {
    return bloqueiaProduto(classificacao);
  }
}
