export interface FornecedorSelecionadoContato {
  idContato: number;
  idFornecedor: number;
  principal: boolean;
  nome: string;
  email: string;
  celularPrincipal: string;
  celularSecundario?: any;
  telefonePrincipal: string;
  telefoneSecundario: string;
}

export interface FornecedorSelecionado {
  idFornecedor: number;
  nomeFantasia: string;
  contato: FornecedorSelecionadoContato[];
}
