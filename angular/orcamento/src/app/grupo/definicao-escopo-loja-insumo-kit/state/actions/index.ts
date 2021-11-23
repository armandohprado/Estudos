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
import { SetGrupoItemProdutosApi } from './set-grupo-item-produtos-api';
import { IncluirProdutoGrupoItemApi } from './incluir-produto-grupo-item-api';
import { UpdateProdutoGrupoItem } from './update-produto-grupo-item';
import { AddProdutoGrupoItem } from './add-produto-grupo-item';
import { UpdateProdutoGrupoItemApi } from './update-produto-grupo-item-api';
import { SetProdutoSelecionadoGrupoItemApi } from './set-produto-selecionado-grupo-item-api';
import { ExcluirProdutoGrupoItemApi } from './excluir-produto-grupo-item-api';
import { UpdateCatalogoGrupoItem } from './update-catalogo-grupo-item';
import { UpdateFiltroCatalogoGrupoItem } from './update-filtro-catalogo-grupo-item';
import { SetGrupoItemQuantitativoApi } from './set-grupo-item-quantitativo-api';
import { UpdateGrupoItemQuantitativoApi } from './update-grupo-item-quantitativo-api';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { SetGrupoItemFilhosApi } from './set-grupo-item-filhos-api';
import { SetGrupoItemFilhoStatus } from './set-grupo-item-filho-status';
import { ToggleCollapseGrupoItem } from './toggle-collapse-grupo-item';
import { RefreshFilhos } from './refresh-filhos';
import { UpdateGrupoItemQuantitativo } from './update-grupo-item-quantitativo';
import { CalcularValorReferenciaGrupoItem } from './calcular-valor-referencia-grupo-item';
import { RefreshQuantitativo } from './refresh-quantitativo';
import { ToggleAllAtivos } from './toggle-all-ativos';

export const DefinicaoEscopoLojaInsumoKitActions = {
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
  setGrupoItemProdutosApi: SetGrupoItemProdutosApi,
  incluirProdutoGrupoItemApi: IncluirProdutoGrupoItemApi,
  updateProdutoGrupoItem: UpdateProdutoGrupoItem,
  addProdutoGrupoItem: AddProdutoGrupoItem,
  updateProdutoGrupoItemApi: UpdateProdutoGrupoItemApi,
  setProdutoSelecionadoGrupoItemApi: SetProdutoSelecionadoGrupoItemApi,
  excluirProdutoGrupoItemApi: ExcluirProdutoGrupoItemApi,
  updateCatalogoGrupoItem: UpdateCatalogoGrupoItem,
  updateFiltroCatalogoGrupoItem: UpdateFiltroCatalogoGrupoItem,
  setGrupoItemQuantitativoApi: SetGrupoItemQuantitativoApi,
  updateGrupoItemQuantitativoApi: UpdateGrupoItemQuantitativoApi,
  updateGrupoItemFilho: UpdateGrupoItemFilho,
  setGrupoItemFilhosApi: SetGrupoItemFilhosApi,
  setGrupoItemFilhoStatus: SetGrupoItemFilhoStatus,
  toggleCollapseGrupoItem: ToggleCollapseGrupoItem,
  refreshFilhos: RefreshFilhos,
  updateGrupoItemQuantitativo: UpdateGrupoItemQuantitativo,
  calcularValorReferenciaGrupoItem: CalcularValorReferenciaGrupoItem,
  refreshQuantitativo: RefreshQuantitativo,
  toggleAllAtivos: ToggleAllAtivos,
};
export const DefinocaoEscopoLojaInsumoKitActionsArray = Object.values(DefinicaoEscopoLojaInsumoKitActions);
