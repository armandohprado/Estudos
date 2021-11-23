import { Pipe, PipeTransform } from '@angular/core';
import { GrupoComboConteudo } from '../../../model/grupo-item-atributo';

@Pipe({
  name: 'findGrupoComboConteudoAtivo',
})
export class FindGrupoComboConteudoAtivoPipe implements PipeTransform {
  transform(grupoComboConteudo: GrupoComboConteudo[]): GrupoComboConteudo {
    return grupoComboConteudo.find(value => value.ativo);
  }
}
