import { Orcamento } from './orcamento';
import { Grupo } from './grupo';

export interface OrcamentoGrupo {
  orcamento: Orcamento;
  grupo: Grupo;
  idOrcamentoGrupo: number;
  idOrcamento: number;
  idGrupo: number;
  dataLimiteCustosOrcamentoGrupo: Date | string;
  dataLimiteEntregaMercadoria: Date | string;
  dataInicioExecucaoServico: Date | string;
  dataFimExecucaoServico: Date | string;
  mensagemEnvioCotacao: string;

  complementoOrcamentoGrupo: string;
}
