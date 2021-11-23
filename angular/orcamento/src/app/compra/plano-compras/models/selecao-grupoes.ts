import { Grupao } from '../../../models';

export interface PcSelecaoGrupoes {
  idOrcamento: number;
  idOrcamentoCenario: number;
  idPlanoCompra: number;
  grupoes: Grupao[];
}

export interface PcAddGruposPayload {
  idOrcamento: number;
  idOrcamentoCenario: number;
  idPlanoCompra: number;
  grupos: PcAddGruposPayloadGrupo[];
}

export interface PcAddGruposPayloadGrupo {
  idGrupo: number;
  grupoNaoPrevisto: boolean;
  idOrcamentoGrupo?: number;
  manterFornecedor?: boolean;
  manterAtributos?: boolean;
  manterQuantidades?: boolean;
}
