import { trackByFactory } from '@aw-utils/track-by';

export interface CnAdicionarGrupos {
  idOrcamento: number;
  idOrcamentoCenario: number;
  idPlanoCompra: number;
  grupoes: CnAgGrupao[];
}

export interface CnAgGrupao {
  idGrupao: number;
  numeroGrupao: number;
  descricaoGrupao: string;
  ativo: boolean;
  idFamilia: number;
  grupos: CnAgGrupo[];

  hasAnyGrupoSelected: boolean;
  opened: boolean;
}

export interface CnAgGrupo {
  idGrupo: number;
  idGrupao: number;
  codigoGrupo: string;
  nomeGrupo: string;
  descricaoComplementarGrupo?: string;
  idTipoGrupo: number;
  idGrupoClassificacao: number;
  idGrupoTipo: number;
  ativo: boolean;
  selecionado: boolean;
  complementoOrcamentoGrupo?: string;
  idOrcamentoGrupo?: number;
  idOrcamentoGrupoOrigem?: number;
  numeracao?: string;

  _id: number;
  grupoNaoPrevisto: boolean;
  duplicar: boolean;
  duplicarAtributos: boolean;
  duplicarFornecedor: boolean;
  duplicarQuantidades: boolean;
}

export const trackByCnAgGrupao = trackByFactory<CnAgGrupao>('idGrupao');
export const trackByCnAgGrupo = trackByFactory<CnAgGrupo>('_id');
