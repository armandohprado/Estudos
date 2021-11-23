import { PropostaAltFornecedorContato } from '@aw-models/proposta-alt-fornecedor-contato';

export interface PropostaAltFornecedor {
  idFornecedor: number;
  fornecedorInterno: boolean;
  nomeFantasia: string;
  razaoSocial: string;
  favorito: boolean;
  logradouro: string;
  cnpj: string;
  contatos: PropostaAltFornecedorContato[];
  inscricaoEstadual?: number;
  inscricaoMunicipal?: number;

  grupoAW: boolean;
  idFornecedorLegado: number;
}
