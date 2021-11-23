export interface CardNovidades {
  id: number;
  titulo: string;
  urlImagem: string;
  link: string;
  funcionario: string;
  ordem: number;
  dataCadastro: Date;
  corFundo: string;
}

export interface UpdateAndCreateCardNovidades {
  id: number;
  titulo: string;
  link: string;
  imagem: string;
  corFundo: string;
  ordem: number;
}
