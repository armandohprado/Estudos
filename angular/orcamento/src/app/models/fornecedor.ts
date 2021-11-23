import { SituacaoFornecedor } from './situacao-fornecedor.enum';
import { Contato } from './contato';
import { Cidade } from './enderecos/cidade';
import { Estado } from './enderecos/estado';

export interface Fornecedor {
  idFornecedor: number;
  idCanalEntrada: number;
  cnpj: string;
  nomeFantasia: string;
  razaoSocial: string;
  dataAberturaEmpresa: string;
  site: string;
  inscricaoEstadual: number;
  inscricaoMunicipal: number;
  crea: string;
  cnae: string;
  quantidadeCLT: number;
  faturamento: number;
  descricaoNegocio: string;
  obrasClientes: string;
  seguroRespCivilProfissional: boolean;
  simplesNacional: boolean;
  contaBancariaIdBanco: number;
  contaBancariaAgencia: string;
  contaBancariaConta: string;
  idFuncionario: number;
  idFuncionarioAnalista: number;
  prioridade: number;
  categoria: number;
  percentualConclusao: number;
  idStatus: number;
  dataCriacao: string;
  dataAlteracao: string;
  situacao: SituacaoFornecedor;
  tipoFornecedor: number;
  cadastroPrefeituraSP: boolean;
  liminarCofins: boolean;
  idOrcamentoGrupoFornecedor: number;
  idOrcamentoGrupo: number;
  favorito: boolean;
  fornecedorInterno: boolean;
  mensagemFornecedor: string;
  acaoFornecedor?: 'adicionar' | 'remover';
  contatos: Contato[];
  enderecos: FornecedorEndereco[];
  lastCall: boolean;
  desativaProposta: boolean;
  suspenso?: boolean;
  desomologado?: boolean;

  grupoAW: boolean;
  idFornecedorLegado: number;
  preHomologado: boolean;
  precoBaixo: boolean;
  idLiberaCotacao: number;
  avaliacao: number;
  volumeContratacao: boolean;

  liberaCotacao: boolean;
  selected?: boolean;
  isDisabled?: boolean;
  comentarioProposta?: string;
  idContatoFornecedor?: number;
  idProposta?: number;
  possuiConfirmacaoCompra?: boolean;
  possuiMapaEnviado?: boolean;
  fornecedorDisabledEnvioCotacao?: boolean;
  logradouro: string;
}

export interface FornecedorEndereco {
  bairro: string;
  cep: string;
  complemento: string;
  idEndereco: number;
  logradouro: string;
  numero: number;
  cidade: Cidade;
  estado: Estado;
}
