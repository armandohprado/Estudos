import { SetLoading } from './set-loading';
import { SetErrorApi } from './set-error-api';
import { ClearState } from './clear-state';
import { SetGrupoItensApi } from './set-grupo-itens-api';
import { SetGrupoItemStatus } from './set-grupo-item-status';
import { SetGrupoItemLoading } from './set-grupo-item-loading';
import { SetGrupoItemEditing } from './set-grupo-item-editing';
import { UpdateGrupoItem } from './update-grupo-item';
import { UpdateGrupoItemComplementoApi } from './update-grupo-item-complemento-api';
import { UpdateGrupoItemTagApi } from './update-grupo-item-tag-api';
import { IncluirGrupoItemApi } from './incluir-grupo-item-api';
import { ExcluirGrupoItemApi } from './excluir-grupo-item-api';
import { DuplicarGrupoItemApi } from './duplicar-grupo-item-api';
import { SetGrupoItemFilhoProdutosApi } from './set-grupo-item-filho-produtos-api';
import { IncluirProdutoGrupoItemFilhoApi } from './incluir-produto-grupo-item-filho-api';
import { UpdateProdutoGrupoItemFilho } from './update-produto-grupo-item-filho';
import { AddProdutoGrupoItemFilho } from './add-produto-grupo-item-filho';
import { UpdateProdutoGrupoItemFilhoApi } from './update-produto-grupo-item-filho-api';
import { SetProdutoSelecionadoGrupoItemFilhoApi } from './set-produto-selecionado-grupo-item-filho-api';
import { ExcluirProdutoGrupoItemFilhoApi } from './excluir-produto-grupo-item-filho-api';
import { UpdateCatalogoGrupoItemFilho } from './update-catalogo-grupo-item-filho';
import { UpdateFiltroCatalogoGrupoItemFilho } from './update-filtro-catalogo-grupo-item-filho';
import { SetGrupoItemQuantitativoApi } from './set-grupo-item-quantitativo-api';
import { UpdateGrupoItemQuantitativoApi } from './update-grupo-item-quantitativo-api';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { SetGrupoItemFilhosApi } from './set-grupo-item-filhos-api';
import { SetGrupoItemFilhoStatus } from './set-grupo-item-filho-status';
import { RemoveProdutoCataloto } from './remove-produto-catalogo';
import { SetVariacoesProdutoCatalogoApi } from './set-variacoes-produto-catalogo-api';
import { RefreshFilhos } from './refresh-filhos';
import { ChangeVariacaoProdutoSelecionado } from './change-variacao-produto-selecionado';
import { SetVariacoesProdutoSelecionadoApi } from './set-variacoes-produto-selecionado-api';
import { UpdateGrupoItemQuantitativo } from './update-grupo-item-quantitativo';
import { RecalcularValoresProduto } from './recalcular-valores-produto';
import { RefreshQuantitativo } from './refresh-quantitativo';
import { ToggleAllAtivos } from './toggle-all-ativos';

export const DefinicaoEscopoLojaInsumoActions = {
  setLoading: SetLoading,
  setErrorApi: SetErrorApi,
  setGrupoItensApi: SetGrupoItensApi,
  clearState: ClearState,
  setGrupoItemStatus: SetGrupoItemStatus,
  setGrupoItemLoading: SetGrupoItemLoading,
  setGrupoItemEditing: SetGrupoItemEditing,
  updateGrupoItem: UpdateGrupoItem,
  updateGrupoItemComplementoApi: UpdateGrupoItemComplementoApi,
  updateGrupoItemTagApi: UpdateGrupoItemTagApi,
  incluirGrupoItemApi: IncluirGrupoItemApi,
  excluirGrupoItemApi: ExcluirGrupoItemApi,
  duplicarGrupoItemApi: DuplicarGrupoItemApi,
  setGrupoItemFilhoProdutosApi: SetGrupoItemFilhoProdutosApi,
  incluirProdutoGrupoItemFilhoApi: IncluirProdutoGrupoItemFilhoApi,
  updateProdutoGrupoItemFilho: UpdateProdutoGrupoItemFilho,
  addProdutoGrupoItemFilho: AddProdutoGrupoItemFilho,
  updateProdutoGrupoItemFilhoApi: UpdateProdutoGrupoItemFilhoApi,
  setProdutoSelecionadoGrupoItemFilhoApi: SetProdutoSelecionadoGrupoItemFilhoApi,
  excluirProdutoGrupoItemFilhoApi: ExcluirProdutoGrupoItemFilhoApi,
  updateCatalogoGrupoItem: UpdateCatalogoGrupoItemFilho,
  updateFiltroCatalogoGrupoItemFilho: UpdateFiltroCatalogoGrupoItemFilho,
  setGrupoItemQuantitativoApi: SetGrupoItemQuantitativoApi,
  updateGrupoItemQuantitativoApi: UpdateGrupoItemQuantitativoApi,
  updateGrupoItemFilho: UpdateGrupoItemFilho,
  setGrupoItemFilhosApi: SetGrupoItemFilhosApi,
  setGrupoItemFilhoStatus: SetGrupoItemFilhoStatus,
  removeProdutoCatalogo: RemoveProdutoCataloto,
  setVariacoesProdutoCatalogoApi: SetVariacoesProdutoCatalogoApi,
  refreshFilhos: RefreshFilhos,
  changeVariacaoProdutoSelecionado: ChangeVariacaoProdutoSelecionado,
  setVariacoesProdutoSelecionadoApi: SetVariacoesProdutoSelecionadoApi,
  updateGrupoItemQuantitativo: UpdateGrupoItemQuantitativo,
  recalcularValoresProduto: RecalcularValoresProduto,
  refreshQuantitaivo: RefreshQuantitativo,
  toggleAllAtivos: ToggleAllAtivos,
};
export const DefinocaoEscopoLojaInsumoActionsArray = Object.values(DefinicaoEscopoLojaInsumoActions);
