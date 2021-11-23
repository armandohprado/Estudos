import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliProdutoCatalogoComponent } from './deli-produto-catalogo/deli-produto-catalogo.component';
import { SharedModule } from '@aw-shared/shared.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { DeliProdutoDetalhesComponent } from './deli-produto-detalhes/deli-produto-detalhes.component';
import { DeliProdutoListCatalogoComponent } from './deli-produto-list-catalogo/deli-produto-list-catalogo.component';
import { DeliCatalogoFiltrosComponent } from './deli-catalogo-filtros/deli-catalogo-filtros.component';
import { DeliCatalogoComponent } from './deli-catalogo/deli-catalogo.component';
import { DeliFiltroProdutosCatalogoPipe } from './deli-filtro-produtos-catalogo.pipe';
import { DeliProdutoCatalogoImagemPipe } from './deli-produto-catalogo-imagem.pipe';
import { DeliProdutoSelecionadoComponent } from './deli-produto-selecionado/deli-produto-selecionado.component';
import { DeliProdutoListSelecionadoComponent } from './deli-produto-list-selecionado/deli-produto-list-selecionado.component';
import { DeliHeaderComponent } from './deli-header/deli-header.component';

@NgModule({
  imports: [CommonModule, SharedModule, AwComponentsModule],
  declarations: [
    DeliProdutoCatalogoComponent,
    DeliProdutoDetalhesComponent,
    DeliProdutoListCatalogoComponent,
    DeliCatalogoFiltrosComponent,
    DeliCatalogoComponent,
    DeliFiltroProdutosCatalogoPipe,
    DeliProdutoCatalogoImagemPipe,
    DeliProdutoSelecionadoComponent,
    DeliProdutoListSelecionadoComponent,
    DeliHeaderComponent,
  ],
  exports: [
    DeliProdutoCatalogoComponent,
    DeliProdutoDetalhesComponent,
    DeliProdutoListCatalogoComponent,
    DeliCatalogoFiltrosComponent,
    DeliCatalogoComponent,
    DeliFiltroProdutosCatalogoPipe,
    DeliProdutoCatalogoImagemPipe,
    DeliProdutoSelecionadoComponent,
    DeliProdutoListSelecionadoComponent,
    DeliHeaderComponent,
  ],
})
export class DefinicaoEscopoLojaInsumoSharedModule {}
