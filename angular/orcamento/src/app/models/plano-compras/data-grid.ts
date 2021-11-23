import { Fornecedor } from './fornecedor';
import { Pacote } from './pacote';
import { TipoFaturamento } from './tipo-faturamento';

export interface DataGrid {
  idPlanoCompra: number;
  idPlanoCompraGrupo: number;
  idPlanilhaHibrida: number;
  idOrcamentoCenario: number;
  status: string;
  statusDescricao: string;
  idGrupo: number;
  codigoGrupo: string;
  nomeGrupo: string;
  tipificacaoGrupoDNN: string;
  valorOrcadoDNN: number;
  fornecedorOrcadoDNN: string;
  valorVendaCongelada: number;
  idOrcamentoCenarioGrupoContrato: number;
  idTipoFaturamento: number;
  tipoFaturamento: string;
  tipoFaturamentoObj: TipoFaturamento;
  valorImposto: number;
  valorLucroPrevisto: number;
  valorAcrescDec: number;
  valorTaxaEmbutida: number;
  comentarioSaving: string;
  valorMetaCompra: number;
  valorMetaMiscelaneous: number;
  comentarioCompras: string;
  pacote: Pacote;
  idPacote: number;
  numero: number;
  prazo: number;
  dataInicioProcessoCompra: Date;
  tempoProcessamentoCotacao: number;
  idResponsavelEscopo: number;
  responsavelEscopo: string;
  idResponsavelNegociacao: number;
  responsavelNegociacao: string;
  dataLimiteComprasCC: Date;
  dataPrevistaEmissaoCC: Date;
  fornecedores: Fornecedor[];
  dataEmissaoCC: Date;
  fornecedorFechado: Fornecedor;
  diasCorridosMobilizacaoFabricacao: number;
  dataEntradaProduto: Date;
  dataInicioServico: Date;
  prazoExecucao: Date;
  dataTerminoServico: Date;
}

export type KeyofDataGrid = keyof DataGrid;
