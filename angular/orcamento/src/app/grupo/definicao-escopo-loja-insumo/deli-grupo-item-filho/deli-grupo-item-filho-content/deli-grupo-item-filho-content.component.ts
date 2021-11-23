import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GrupoItemDELIFilho } from '../../models/grupo-item';
import { DefinicaoEscopoLojaInsumoService } from '../../definicao-escopo-loja-insumo.service';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { FiltroProdutoCatalogo, ProdutoCatalogo } from '../../models/produto-catalogo';

@Component({
  selector: 'app-deli-grupo-item-filho-content',
  templateUrl: './deli-grupo-item-filho-content.component.html',
  styleUrls: ['./deli-grupo-item-filho-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class DeliGrupoItemFilhoContentComponent implements OnInit {
  constructor(public definicaoEscopoLojaService: DefinicaoEscopoLojaInsumoService) {}

  @Input() grupoItemFilho: GrupoItemDELIFilho;
  @Input() idOrcamentoGrupoItemPai: number;

  btnDisabledFn = (produtoA: ProdutoCatalogo, produtoB: ProdutoCatalogo) =>
    produtoA.idProdutoCatalogo === produtoB.idProdutoCatalogo;

  toggleCatalogo(): void {
    this.definicaoEscopoLojaService.updateGrupoItemFilho(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      {
        openedCatalogo: !this.grupoItemFilho.openedCatalogo,
      }
    );
  }

  updateFiltro(filtro: FiltroProdutoCatalogo): void {
    this.definicaoEscopoLojaService.updateFiltroCatalogoGrupoItemFilho(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      filtro
    );
  }

  updateTerm(term: string): void {
    this.definicaoEscopoLojaService.updateGrupoItemFilho(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      {
        term,
      }
    );
  }

  onProdutoSelecionadoCatalogo(produtoCatalogo: ProdutoCatalogo): void {
    if (produtoCatalogo.selecionadoCatalogo) {
      this.definicaoEscopoLojaService.excluirProdutoGrupoItemFilhoApi(
        this.idOrcamentoGrupoItemPai,
        this.grupoItemFilho.idOrcamentoGrupoItem,
        produtoCatalogo.idProdutoCatalogo
      );
    } else {
      this.definicaoEscopoLojaService.incluirProdutoGrupoItemFilhoApi(
        this.idOrcamentoGrupoItemPai,
        this.grupoItemFilho.idOrcamentoGrupoItem,
        {
          idProdutoCatalogo: produtoCatalogo.idProdutoCatalogo,
          complemento: produtoCatalogo.complemento,
          idOrcamentoGrupoItem: this.grupoItemFilho.idOrcamentoGrupoItem,
          idOrcamentoGrupoItemProdutoCatalogo: 0,
          selecionado: false,
          idFornecedor: produtoCatalogo.idFornecedor,
        }
      );
    }
  }

  setVariacoesProdutoCatalogo(produtoCatalogo: ProdutoCatalogo): void {
    this.definicaoEscopoLojaService.setVariacoesProdutoCatalogoApi(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      produtoCatalogo.idProdutoCatalogo
    );
  }

  setVariacoesProdutoSelecionado(produtoCatalogo: ProdutoCatalogo): void {
    this.definicaoEscopoLojaService.setVariacoesProdutoSelecionadoApi(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      produtoCatalogo.idOrcamentoGrupoItemProdutoCatalogo
    );
  }

  deletarProduto(produto: ProdutoCatalogo): void {
    this.definicaoEscopoLojaService.excluirProdutoGrupoItemFilhoApi(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      produto.idProdutoCatalogo
    );
  }

  changeVariacao([produtoOld, produtoNew]: [ProdutoCatalogo, ProdutoCatalogo]): void {
    this.definicaoEscopoLojaService.changeVariacaoProdutoSelecionado(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      produtoOld.idProdutoCatalogo,
      {
        complemento: produtoNew.complemento,
        idOrcamentoGrupoItem: this.grupoItemFilho.idOrcamentoGrupoItem,
        idOrcamentoGrupoItemProdutoCatalogo: 0,
        idProdutoCatalogo: produtoNew.idProdutoCatalogo,
        selecionado: produtoOld.selecionado,
        idFornecedor: produtoNew.idFornecedor,
      }
    );
  }

  onProdutoSelecionado(produto: ProdutoCatalogo): void {
    this.definicaoEscopoLojaService.setProdutoSelecionadoGrupoItemFilho(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      produto.idOrcamentoGrupoItemProdutoCatalogo,
      true
    );
  }

  ngOnInit(): void {}
}
