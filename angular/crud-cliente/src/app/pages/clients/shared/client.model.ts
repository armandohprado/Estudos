export class Client {
  name?: string;
  email?: string;
  cpf?: string;
  data_nascimento?: string;
  cidade?: string;
  CEP?: string;
  estado?: string;
  id: any;
  constructor(
    name?: string,
    id?: number,
    email?: string,
    cpf?: string,
    data_nascimento?: string,
    cidade?: string,
    CEP?: string,
    estado?: string
  ) {}
}
