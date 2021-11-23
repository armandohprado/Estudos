import { Item } from './item';
import { CentrosDeCusto } from './centro-custo-dp';

export interface PavimentoGeneric {
  itens: Item[];
  omissos?: Item[];
  centrosDeCusto?: CentrosDeCusto[];
  nomePavimento?: string;
  nomeFantasia?: string;
  tipo: string;
  calcTotal: number;
  idPropostaItem: number;
  idPropostaItemQuantitativo: number;
  idOrcamentoGrupoItem: number;
  idProjetoEdificioPavimento: number;
  idEdificioPavimento: number;
  idEdificio: number;
  idPavimento: number;
  idCondominio: number;
  idProposta: number;
  descontoProduto: number;
  descontoServico: number;
  qtdItensOrcados: number;
  qtdItens: number;
  valorTotalProduto: number;
  valorTotalProdutoSemDesconto: number;
  valorTotalServico: number;
  valorTotalServicoSemDesconto: number;
  valorTotal: number;
  quantidadeTotal: number;
  idFase: number;
  siglaPavimento?: string | number;
  ordem: number;
  currentPage: number;
  currentPageOmisso: number;
  addOmisso: boolean;
  open: boolean;
}
