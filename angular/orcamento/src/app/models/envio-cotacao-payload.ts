import { GaAnexoAvulso } from '../orcamento/gerenciador-arquivos/model/anexo-avulso';
import { GrupoRestricaoObra } from './proposta-detalhada';

export interface EnvioCotacaoPayloadFornecedorContato {
  idFornecedor: number;
  idContatoFornecedor: number;
  comentarioProposta: string;
  idProposta?: number;
}

export interface EnvioCotacaoPayload {
  dataLimiteDefinicao: Date;
  dataLimiteEntregaMercadoria: Date;
  dataInicioExecucaoServico: Date;
  dataFimExecucaoServico: Date;
  mensagemEnvioCotacao: string;
  idFuncionarioContato: number;
  fornecedorContato: EnvioCotacaoPayloadFornecedorContato[];
  arquivoAnexo: GaAnexoAvulso[];
  contatoVisita: string | null;
  necessariaVisita: boolean;
  telefoneVisita: string | null;
  grupoRestricaoObra: GrupoRestricaoObra[];
  tipoFaturamento: boolean;
  liberarQuantitativo: boolean;
  idOrcamentoGrupo: number;
  faseDNN: boolean;
}
