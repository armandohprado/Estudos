import { Fase, FasePayload } from './fase';
import { Grupao } from './grupao';
import { Datas } from './datas';
import { Edificio, EdificioPayload } from './edificio';

export interface Orcamento {
  idOrcamento: number;
  nomeOrcamento: string;
  idProjeto: number;
  registroAtivo: boolean;
  datas: Datas;
  edificios: Edificio[];
  fases: Fase[];
  grupoes: Grupao[];
  idProjetoModeloEap: number;
  valorPlanejadoVenda: number;
  valorCustoMeta: number;
  orcamentoCenario?: OrcamentoCenario[];
  orcamentoCenarioPadrao?: OrcamentoCenario;
}

export interface OrcamentoPayload extends Orcamento {
  edificios: EdificioPayload[];
  fases: FasePayload[];
}

export interface OrcamentoCenario extends ExistePlanoCompraNegociacao {
  idOrcamentoCenario: number;
  idOrcamento: number;
  nomeOrcamentoCenario: string;
  revisao: number;
  percentualBaseOrcamentoReferenciaAW: number;
  percentualBaseOrcamentoFornecedor: number;
  valorMargemContribuicao: number;
  valorImpostoFaturamento: number;
  idOrcamentoCenarioOrigem: number;
  descricaoOrcamentoCenario: string;
  valorTotalComImposto: number;
  idCenarioStatus: number;
  valorVenda: number;
}

export interface ExistePlanoCompraNegociacao {
  existeCompraNegociacao: boolean;
  existePlanoCompra: boolean;
  idOrcamentoCenario: number;
}
