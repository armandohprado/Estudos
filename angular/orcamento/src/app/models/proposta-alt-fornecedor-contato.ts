export interface PropostaAltFornecedorContato {
  idContato: number;
  ativo: boolean;
  principal: boolean;
  nome: string;
  email: string;
  telefonePrincipal?: string;
  celularPrincipal?: string;
}
