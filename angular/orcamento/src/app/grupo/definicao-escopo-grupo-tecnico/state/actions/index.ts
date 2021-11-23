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
import { DuplicarGrupoItemFilhoApi } from './duplicar-grupo-item-filho-api';
import { SetGrupoItemFilhoQuantitativoApi } from './set-grupo-item-filho-quantitativo-api';
import { UpdateGrupoItemFilhoQuantitativoApi } from './update-grupo-item-filho-quantitativo-api';
import { UpdateGrupoItemFilho } from './update-grupo-item-filho';
import { SetGrupoItemFilhosApi } from './set-grupo-item-filhos-api';
import { SetGrupoItemFilhoStatus } from './set-grupo-item-filho-status';
import { RefreshFilhos } from './refresh-filhos';
import { UpdateGrupoItemFilhoQuantitativo } from './update-grupo-item-filho-quantitativo';
import { SetGrupoItemFilhoAmbientesQuantitativoApi } from './set-grupo-item-filho-ambientes-quantitativo';
import { ExcluirGrupoItemFilhoApi } from './excluir-grupo-item-filho-api';
import { ToggleAmbiente } from './toggle-ambiente';
import { DeleteAmbientesSelecionadosIfNoValue } from './delete-ambientes-selecionados-if-no-value';
import { UpdateAmbiente } from './update-ambiente';
import { SelecionarAmbiente } from './selecionar-ambiente';
import { RefreshQuantitativos } from './refresh-quantitativos';
import { ToggleAllAtivos } from './toggle-all-ativos';

export const DefinicaoEscopoGrupoTecnicoActions = {
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
  duplicarGrupoItemFilhoApi: DuplicarGrupoItemFilhoApi,
  setGrupoItemFilhoQuantitativoApi: SetGrupoItemFilhoQuantitativoApi,
  updateGrupoItemFilhoQuantitativoApi: UpdateGrupoItemFilhoQuantitativoApi,
  updateGrupoItemFilho: UpdateGrupoItemFilho,
  setGrupoItemFilhosApi: SetGrupoItemFilhosApi,
  setGrupoItemFilhoStatus: SetGrupoItemFilhoStatus,
  refreshFilhos: RefreshFilhos,
  updateGrupoItemQuantitativo: UpdateGrupoItemFilhoQuantitativo,
  setGrupoItemFilhoAmbientesQuantitativoApi: SetGrupoItemFilhoAmbientesQuantitativoApi,
  excluirGrupoItemFilhoApi: ExcluirGrupoItemFilhoApi,
  toggleAmbiente: ToggleAmbiente,
  deleteAmbientesSelecionadosIfNoValue: DeleteAmbientesSelecionadosIfNoValue,
  updateAmbiente: UpdateAmbiente,
  selecionarAmbiente: SelecionarAmbiente,
  refreshQuantitativos: RefreshQuantitativos,
  toggleAllAtivos: ToggleAllAtivos,
};
export const DefinocaoEscopoGrupoTecnicoActionsArray = Object.values(DefinicaoEscopoGrupoTecnicoActions);
