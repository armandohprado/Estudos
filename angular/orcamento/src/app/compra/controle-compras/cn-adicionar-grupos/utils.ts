import { CnAgGrupao, CnAgGrupo } from '../../models/cn-adicionar-grupos';
import { PcAddGruposPayloadGrupo } from '../../plano-compras/models/selecao-grupoes';

let uid = 1;

export function cnAgGetUid(): number {
  return uid++;
}

export function cnAgMapGrupoes(grupoes: CnAgGrupao[]): CnAgGrupao[] {
  return grupoes.map(grupao => ({ ...grupao, hasAnyGrupoSelected: grupao.grupos.some(grupo => grupo.selecionado) }));
}

export function cnAgMapGrupoesUid(grupoes: CnAgGrupao[]): CnAgGrupao[] {
  return grupoes.map(grupao => ({
    ...grupao,
    grupos: (grupao.grupos ?? []).map(grupo => {
      if (grupo.numeracao) {
        grupo = { ...grupo, codigoGrupo: grupo.numeracao };
      }
      return {
        ...grupo,
        _id: cnAgGetUid(),
        grupoNaoPrevisto: false,
      };
    }),
  }));
}

export function cnAgMapGrupoToPayload({
  idGrupo,
  grupoNaoPrevisto,
  idOrcamentoGrupo,
  duplicar,
  duplicarAtributos,
  duplicarFornecedor,
  duplicarQuantidades,
}: CnAgGrupo): PcAddGruposPayloadGrupo {
  const payloadGrupo: PcAddGruposPayloadGrupo = { idGrupo, grupoNaoPrevisto };
  if (duplicar) {
    payloadGrupo.idOrcamentoGrupo = idOrcamentoGrupo;
    payloadGrupo.manterAtributos = duplicarAtributos;
    payloadGrupo.manterFornecedor = duplicarFornecedor;
    payloadGrupo.manterQuantidades = duplicarQuantidades;
  }
  return payloadGrupo;
}
