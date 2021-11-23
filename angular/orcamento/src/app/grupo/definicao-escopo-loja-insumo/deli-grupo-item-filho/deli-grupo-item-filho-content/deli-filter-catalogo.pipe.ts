import { Pipe, PipeTransform } from '@angular/core';
import { ProdutoCatalogo } from '../../models/produto-catalogo';

@Pipe({
  name: 'deliFilterCatalogo',
})
export class DeliFilterCatalogoPipe implements PipeTransform {
  transform(
    catalogo: ProdutoCatalogo[],
    selecionados: ProdutoCatalogo[]
  ): ProdutoCatalogo[] {
    return catalogo.filter(produto => {
      return !selecionados.some(
        selecionado => selecionado.idProduto === produto.idProduto
      );
    });
  }
}
