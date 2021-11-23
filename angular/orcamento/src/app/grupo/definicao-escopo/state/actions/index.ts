import { SetLoading } from './set-loading';
import { ClearState } from './clear-state';
import { AddGrupoItem } from './add-grupo-item';
import { UpdateGrupoItem } from './update-grupo-item';
import { SetGrupoItemAtributosApi } from './set-grupo-item-atributos-api';
import { SetGrupoItemNextTab } from './set-grupo-item-next-tab';
import { UpdateGrupoItemComplementoApi } from './update-grupo-item-complemento-api';
import { UpdateGrupoItemValoresTagApi } from './update-grupo-item-valores-tag-api';
import { DuplicarGrupoItemApi } from './duplicar-grupo-item-api';
import { SetGruposItens } from './set-grupos-itens';
import { SetErrorApi } from './set-error-api';
import { SetGrupoItemQuantitativoApi } from './set-grupo-item-quantitativo-api';
import { UpdateGrupoItemQuantitativo } from './update-grupo-item-quantitativo';
import { UpdateGrupoItemQuantitativoApi } from './update-grupo-item-quantitativo-api';
import { IncluirGrupoItemApi } from './incluir-grupo-item-api';
import { ExcluirGrupoItemApi } from './excluir-grupo-item-api';
import { SetGrupoItemPesquisaReferenciaApi } from './set-grupo-item-pesquisa-referencia-api';
import { SetGrupoItemAtributoTexto } from './set-grupo-item-atributo-texto';
import { SetMode } from './set-mode';
import { SetFornecedoresApi } from './set-fornecedores-api';
import { UpdateFornecedorGrupoItemApi } from './update-fornecedor-grupo-item-api';
import { RefreshNumeracaoApi } from './refresh-numeracao-api';
import { ChangeAtributo } from './change-atributo';
import { ToggleAllAtivos } from './toggle-all-ativos';

export const DefinicaoEscopoActions = {
  setLoading: SetLoading,
  setGruposItens: SetGruposItens,
  setErrorApi: SetErrorApi,
  setMode: SetMode,
  clearState: ClearState,
  addGrupoItem: AddGrupoItem,
  updateGrupoItem: UpdateGrupoItem,
  setGrupoItemAtributosApi: SetGrupoItemAtributosApi,
  setGrupoItemNextTab: SetGrupoItemNextTab,
  updateGrupoItemComplementoApi: UpdateGrupoItemComplementoApi,
  updateGrupoItemValoresTagApi: UpdateGrupoItemValoresTagApi,
  duplicarGrupoItemApi: DuplicarGrupoItemApi,
  setGrupoItemQuantitativoApi: SetGrupoItemQuantitativoApi,
  updateGrupoItemQuantitativo: UpdateGrupoItemQuantitativo,
  updateGrupoItemQuantitativoApi: UpdateGrupoItemQuantitativoApi,
  incluirGrupoItemApi: IncluirGrupoItemApi,
  excluirGrupoItemApi: ExcluirGrupoItemApi,
  setGrupoItemPesquisaReferenciaApi: SetGrupoItemPesquisaReferenciaApi,
  setGrupoItemAtributoTexto: SetGrupoItemAtributoTexto,
  setFornecedoresApi: SetFornecedoresApi,
  updateFornecedorGrupoItemApi: UpdateFornecedorGrupoItemApi,
  refreshNumeracaoApi: RefreshNumeracaoApi,
  changeAtributo: ChangeAtributo,
  toggleAllAtivos: ToggleAllAtivos,
};

export const DefinicaoEscopoActionsArray = Object.values(DefinicaoEscopoActions);
