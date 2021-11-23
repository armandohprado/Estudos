import { AwInputStatus } from '@aw-components/aw-input/aw-input.type';

export interface PlanilhaHibridaGrupo {
  idOrcamentoCenario: number;
  idOrcamentoGrupo: number;
  idGrupao: number;
  idGrupo: number;
  codigoGrupo: string;
  nomeGrupo: string;
  descricaoComplementarGrupo: null;
  fornecedorOrcado: null;
  ativo: null;
  idPropostaItemQuantitativo: null;
  planilhaHibrida: PlanilhaHibrida;
  orcamentoGrupo: OrcamentoGrupo[];
  valorTotalTransferidoCC?: number;
  valorTransferencia?: number;
  idOrcamentoFamilia: number;
  grupoSemTaxa: boolean;
}

export interface OrcamentoGrupo {
  idOrcamentoGrupo: number;
  idOrcamento: number;
  idGrupo: number;
  dataLimiteEscopoOrcamentoGrupo: string;
  dataLimiteCustosOrcamentoGrupo: string;
  percentualUtilizado: number;
  idProjetoPercentualUtilizado: number;
  valorMetaPlanoOrcamentoGrupo: number;
  descricaoPlanoOrcamentoGrupo: string;
  idOrcamentoFamilia: number;
  complementoOrcamentoGrupo: string;
  comentarioOrcamentoGrupo: string;
  exibeComentarioPropostaOrcamentoGrupo: boolean;
  dataLimiteEntregaMercadoria: string;
  dataInicioExecucaoServico: string;
  dataFimExecucaoServico: string;
  mensagemEnvioCotacao: string;
  escopoEntregue: boolean;
  necessariaVisita: boolean;
  contatoVisita: string;
  telefoneVisita: string;
  liberarQuantitativo: boolean;
  dataAtualizaMatrizGrupoArquivo: string;
  indiceComparativa: number;
  idFuncionarioContato: number;
  idOrcamentoGrupoOrigem: number;
  ativo: boolean;
  orcamentoCenarioFamilia: any; // TODO tipo
  planilhaHibrida: any[];

  idOrcamentoCenarioGrupo: number;

  idRestricaoObra?: number;
  restricaoObraHoraInicio?: string;
  restricaoObraHoraFim?: string;
  restricaoComentario?: string;
}

export interface PlanilhaHibrida {
  idPlanilhaHibrida: number;
  idOrcamentoCenario: number;
  idOrcamentoGrupo: number;
  idGrupo: number;

  valorOrcado: number;
  subtotal1: number;
  valorTotal: number;
  percentualImposto: number;
  valorImposto: number;
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
  comentarioDescontoOportunidade: string;
  comentarioDescontoVPDNN: string;
  percentualRefValorTotal: number;
  percentualRefValorTotalVPDNN: number;
  valorTransferencia: number;
  compraNegociacaoGrupo: any[];
  planilhaHibridaFornecedor: PlanilhaHibridaFornecedor[];
  planoCompraGrupoPlanilhaHibrida: any[];
  grupoTaxa: boolean;
  grupoPlanoCompra: boolean;

  loading?: AwInputStatus;
  expand?: boolean;
  editComentarioDesconto?: boolean;
  loadingComentarioDesconto?: boolean;
  editComentarioOportunidade?: boolean;
  idOrcamentoCenarioFamilia?: number;
  labelPercentualDesconto?: boolean;
  labelPercentualMargemEmbutida?: boolean;
  labelPercentualOportunidade?: boolean;
  labelPercentualDescontoVPDNN?: boolean;
  idGrupoNavigation?: null;
  idOrcamentoCenarioGrupoContrato?: number;
  idOrcamentoCenarioGrupoContratoNavigation?: null;
  idOrcamentoCenarioNavigation?: null;
  idOrcamentoGrupoNavigation?: null;
}

export interface PlanilhaHibridaFornecedor {
  idPlanilhaHibridaFornecedor: number;
  idPlanilhaHibrida: number;
  idOrcamentoGrupoFornecedor: number;
  idOrcamentoGrupoFornecedorNavigation: IDOrcamentoGrupoFornecedorNavigation;
  idPlanilhaHibridaNavigation: null;
}

export interface IDOrcamentoGrupoFornecedorNavigation {
  idOrcamentoGrupoFornecedor: number;
  idOrcamentoGrupo: number;
  idFornecedor: number;
  favorito: boolean;
  situacaoFornecedor: number;
  fornecedorInterno: boolean;
  indicadorAWEstimado: boolean;
  idFornecedorNavigation: IDFornecedorNavigation;
  idOrcamentoGrupoNavigation: null;
  planilhaHibridaFornecedor: null;
  proposta: any[];
  propostaHistorico: any[];
}

export interface IDFornecedorNavigation {
  idFornecedor: number;
  idCanalEntrada: number;
  cnpj: string;
  nomeFantasia: string;
  razaoSocial: string;
  dataAberturaEmpresa: null;
  site: string;
  inscricaoEstadualIsento: boolean;
  inscricaoEstadual: null;
  inscricaoMunicipalIsento: boolean;
  inscricaoMunicipal: null;
  crea: null;
  cnae: null;
  quantidadeCLT: null;
  quantidadeTerceirizado: null;
  descricaoNegocio: null;
  obrasClientes: null;
  seguroRespCivilProfissional: boolean;
  simplesNacional: boolean;
  idBanco: null;
  idMotivo: null;
  contaBancariaAgencia: string;
  contaBancariaConta: string;
  idFuncionario: null;
  idFuncionarioAnalista: null;
  idFuncionarioSolicitante: null;
  prioridade: null;
  percentualConclusao: null;
  percentualFaturamento: number;
  idStatus: number;
  naoPreencheProposta: boolean;
  cadastroPrefeituraSP: boolean;
  liminarCofins: boolean;
  dataAlteracaoStatus: null;
  dataCriacao: string;
  dataAlteracao: null;
  idFornecedorLegado: number;
  importadoLegado: boolean;
  sincronizado: boolean;
  emAuditoria: null;
  aprovado: boolean;
  integrarFornecedor: null;
  grupoAW: null;
  idBancoNavigation: null;
  idCanalEntradaNavigation: null;
  idFuncionarioAnalistaNavigation: null;
  idFuncionarioNavigation: null;
  idFuncionarioSolicitanteNavigation: null;
  idMotivoNavigation: null;
  idStatusNavigation: null;
  arquiteturaArquivo: any[];
  arquivo: any[];
  avaliacaoEstrutural: any[];
  chat: any[];
  compraNegociacaoGrupoFicha: any[];
  compraNegociacaoGrupoMapaFornecedor: any[];
  contato: any[];
  dossie: any[];
  fornecedorChecklist: any[];
  fornecedorEndereco: any[];
  fornecedorFaturamento: any[];
  fornecedorGrupo: any[];
  fornecedorGrupoProjetoLiberacao: any[];
  fornecedorRelacionadoIdFornecedorNavigation: any[];
  fornecedorRelacionadoIdFornecedorRelacionadoNavigation: any[];
  fornecedorTipificacao: any[];
  grupoFabricanteIdEmpresaRepresentanteNavigation: any[];
  grupoFabricanteIdFabricanteNavigation: any[];
  grupoFornecedorCustoFinanceiro: any[];
  homologacaoHistorico: any[];
  orcamentoGrupoFornecedor: null;
  orcamentoGrupoItem: any[];
  percentualConclusaoNavigation: any[];
  produtoCatalogo: any[];
  projetoRealizado: any[];
  propostaAWEHistoricoAplicado: any[];
  propostaItem: any[];
  tac: any[];
}
