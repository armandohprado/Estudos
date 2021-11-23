import { ComboImposto } from './combo-imposto';
import { AwInputStatus } from '../../../aw-components/aw-input/aw-input.type';

export interface GrupoPlanilhaHibrida {
  idPlanilhaHibrida: number;
  idOrcamentoCenarioGrupoContrato: number;
  valorOrcado: number;
  subtotal1: number;
  valorTotal: number;
  percentualImposto: number;
  valorImposto: number;
  idOrcamentoCenario: number;
  idOrcamentoGrupo: number;
  idGrupo: number;
  percentualDesconto: number;
  valorDesconto: number;
  comentarioDesconto: string;
  percentualMargemEmbutida: number;
  valorMargemEmbutida: number;
  subTotal: number;
  percentualOportunidade: number;
  valorOportunidade: number;
  percentualDescontoVPDNN: number;
  valorDescontoVPDNN: number;
  valorTotalVPDNN: number;
  baseFornecedor: boolean;
  percentualTaxaAdmFamilia: number;
  valorTaxaAdmFamilia: number;
  percentualRefValorTotal: number;
  percentualRefValorTotalVPDNN: number;
  idOrcamentoCenarioGrupoContratoNavigation: ComboImposto;
  planilhaHibridaFornecedor: FornecedorPlanilhaHibrida[];

  loading: AwInputStatus;
  expand: false;
  editComentarioDesconto: false;
  editComentarioOportunidade: false;

  grupoPlanoCompra: boolean;
}

interface FornecedorPlanilhaHibrida {
  idPlanilhaHibridaFornecedor: number;
  idPlanilhaHibrida: number;
  idOrcamentoGrupoFornecedor: number;
  idOrcamentoGrupoFornecedorNavigation: OrcamentoGrupoFornecedorNavigation;
}

interface OrcamentoGrupoFornecedorNavigation {
  idOrcamentoGrupoFornecedor: number;
  idOrcamentoGrupo: number;
  idFornecedor: number;
  situacaoFornecedor: number;
  fornecedorInterno: false;
  indicadorAWEstimado: false;
  idFornecedorNavigation: FornecedorNavigation;
}

interface FornecedorNavigation {
  idFornecedor: number;
  nomeFantasia: string;
}
