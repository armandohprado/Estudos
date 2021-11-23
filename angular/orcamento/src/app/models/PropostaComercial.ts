export interface PropostaComercial {
  idPropostaComercial: number;
  idProposta: number;
  nomeOriginalArquivo: string;
  nomeArquivo: string;
  caminhoArquivo: string;
  data: Date | string;
  versaoAtual: boolean;
}
