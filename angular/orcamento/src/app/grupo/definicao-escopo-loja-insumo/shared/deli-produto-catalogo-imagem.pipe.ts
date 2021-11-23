import { Pipe, PipeTransform } from '@angular/core';
import { ProdutoCatalogo } from '../models/produto-catalogo';
import { environment } from '../../../../environments/environment';

@Pipe({
  name: 'deliProdutoCatalogoImagem',
})
export class DeliProdutoCatalogoImagemPipe implements PipeTransform {
  static URL_CENTRALIZACAO = `${environment.centralizacao}Projetos/Web/Fornecedores/Arquivos/ItemProdutoCatalogoImagens/`;
  static URL_AMAZON = 'http://s3-sa-east-1.amazonaws.com/prd-products/';
  static SEM_IMAGEM = '/front/orcamento/produto-sem-imagem.jpg';

  transform(value: ProdutoCatalogo): string {
    if (!value) return '';
    const { caminhoFisicoImagem, urlImagem } = value;
    if (caminhoFisicoImagem) {
      return /^http(s)?:\/\//.test(caminhoFisicoImagem)
        ? caminhoFisicoImagem
        : DeliProdutoCatalogoImagemPipe.URL_CENTRALIZACAO + caminhoFisicoImagem;
    } else if (urlImagem) {
      return /^http(s)?:\/\//.test(urlImagem) ? urlImagem : DeliProdutoCatalogoImagemPipe.URL_AMAZON + urlImagem;
    } else {
      return DeliProdutoCatalogoImagemPipe.SEM_IMAGEM;
    }
  }
}
