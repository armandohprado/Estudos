import { GrupoItemTecnico, GrupoItemTecnicoFilho } from '../../models/grupo-item';

export function getPaiFilho(
  grupoItens: GrupoItemTecnico[],
  idOrcamentoGrupoItemPai: number,
  idOrcamentoGrupoItem: number
): [GrupoItemTecnico, GrupoItemTecnicoFilho] {
  const grupoItemPai = grupoItens.find(gi => gi.idOrcamentoGrupoItem === idOrcamentoGrupoItemPai);
  const grupoItemFilho = grupoItemPai.filhos.find(gi => gi.idOrcamentoGrupoItem === idOrcamentoGrupoItem);
  return [grupoItemPai, grupoItemFilho];
}
