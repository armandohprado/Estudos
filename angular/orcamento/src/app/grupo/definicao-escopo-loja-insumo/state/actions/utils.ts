import { GrupoItemDELI, GrupoItemDELIFilho } from '../../models/grupo-item';

export function getPaiFilho(
  grupoItens: GrupoItemDELI[],
  idOrcamentoGrupoItemPai: number,
  idOrcamentoGrupoItem: number
): [GrupoItemDELI, GrupoItemDELIFilho] {
  const grupoItemPai = grupoItens.find(gi => gi.idOrcamentoGrupoItem === idOrcamentoGrupoItemPai);
  const grupoItemFilho = grupoItemPai.filhos.find(gi => gi.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
  return [grupoItemPai, grupoItemFilho];
}
