import { Pipe, PipeTransform } from '@angular/core';
import {
  FiltroProdutoCatalogo,
  ProdutoCatalogo,
} from '../models/produto-catalogo';
import { search } from '@aw-components/aw-utils/aw-search/aw-search.pipe';
import { Kit } from '../../definicao-escopo-loja-insumo-kit/models/kit';

@Pipe({ name: 'deliFiltroProdutosCatalogo' })
export class DeliFiltroProdutosCatalogoPipe implements PipeTransform {
  transform(
    value: Array<ProdutoCatalogo | Kit>,
    filtros?: FiltroProdutoCatalogo[],
    term?: string
  ): Array<ProdutoCatalogo | Kit> {
    if (term) {
      value = search(value, 'nome', term);
    }
    if (filtros?.length) {
      value = value.filter(produto => {
        return filtros.every(filtro => {
          return produto.filtros.some(
            f => f.nome === filtro.nome && f.valor === filtro.valor
          );
        });
      });
    }
    return value;
  }
}
