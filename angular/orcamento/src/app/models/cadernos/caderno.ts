import { Planilha } from '../planilha';

export interface Caderno {
  idCaderno: number;
  idOrcamentoCenario: number;
  nomeCaderno: string;
  descricaoCaderno: string;
  enviadoCliente: boolean;
  cadernoPadrao: boolean;
  nomeCondicaoGeral: string;
  descricaoCondicaoGeral: string;
  habilitadoCondicaoGeral: boolean;
  nomeItemExcluso: string;
  descricaoItemExcluso: string;
  arquivoLogotipoNome: string;
  arquivoLogotipoContentType: string;
  habilitadoItemExcluso: boolean;
  cadernoPlanilha: Planilha[];
  cadernoPlanilhaHistoricos: PlanilhaHistorico[];
  collapse?: boolean;
  // todo
  cadernoConfiguracaoAndar: CadernoPavimentoOrcamentoFiltro[];
  cadernoConfiguracaoCentroCusto: CadernoCentroCustoOrcamentoFiltro[];
  cadernoConfiguracaoGrupo: CadernoGrupoOrcamentoFiltro[];

  cadernoConfiguracaoColunasTipo: CadernoConfiguracaoColunasTipo[];
  cadernoConfiguracaoNivel: CadernoConfiguracaoNivel[];

  loading?: boolean;
}

export interface PlanilhaHistorico {
  idCadernoPlanilhaHistorico: number;
  idCaderno: number;
  idFuncionario: number;
  valorTotalPlanilha: number;
  url: string;
  dataGeracao: Date;
  funcionario: PlanilhaHistoricoFuncionario;
  nome: string;
  extensao: string;
}

export interface PlanilhaHistoricoFuncionario {
  idFuncionario: number;
  nome: string;
  nomeFantasia: string;
  email: string;
  idAgrupadorCargo: number;
  urlFoto: string;
  loginRede: string;
  idCargo: number;
  idEquipe: number;
  flagResponsavel: any;
  ativo: boolean;
  dataCadastro: string;
  principal: boolean;
  selecionado: boolean;
  telefoneParticular: any;
  cargo: any;
}

export interface PlanilhaOpcaoRelatorio {
  idCaderno: number;
  idOrcamentoCenario: number;
  idCadernoLayout: number;
  nomeCaderno: string;
  nome: string;
  modelo: string;
  nomeReport: string;
  loadingPdf: boolean;
  loadingExcel: boolean;
}

export interface PlanilhaOpcaoRelatorioPost {
  idCaderno: number;
  idOrcamentoCenario: number;
  idCadernoLayout: number;
  tipoArquivo: number;
  taxaDiluida: boolean;
  nomeReport: string;
  impostoDiluido: boolean;
}

export interface CadernoConfiguracaoColunasTipo {
  idCadernoConfiguracaoColunasTipo?: number;
  idCaderno?: number;
  exibeValorUnitarioProduto: boolean;
  exibeDescontoProduto: boolean;
  exibeValorUnitarioServico: boolean;
  exibeDescontoServico: boolean;
  exibeValorUnitarioProdutoServico: boolean;
  exibeValorTotal: boolean;
  exibeAndaresColunados: boolean;
}

export interface CadernoConfiguracaoNivel {
  idCadernoConfiguracaoNivel: number;
  idCaderno: number;
  nivel: string;
  exibe: boolean;
  ordem: number;
}

export interface CadernoPavimentoOrcamentoFiltro {
  idPavimento: number;
  idCaderno: number;
  nomePavimento: string;
  siglaPavimento: string;
  ordem: number;
  site: boolean;
  edificio: boolean;
  exibe: boolean;
  idProjetoEdificioPavimento: number;
  arquiteturaArquivo: any[];
  edificioPavimento: any[];
}

export interface CadernoCentroCustoOrcamentoFiltro {
  idProjetoCentroCusto: number;
  idCaderno: number;
  idProjeto: number;
  descricaoProjetoCentroCusto: string;
  exibe: boolean;
  cor: string;
  ordem: number;
  principal: boolean;
}

export interface CadernoGrupoOrcamentoFiltro {
  idOrcamentoGrupo: number;
  idCaderno: number;
  idGrupo: number;
  codigoGrupo: string;
  exibe: boolean;
  nomeGrupo: string;
  opcional: boolean;
}
