import { InformacaoArquivo } from './informacao-arquivo';

export interface Arquivo {
  idArquiteturaArquivo: number;
  folhaArquivo: string;
  assuntoArquivo: string;
  desatualizadoTexto: string;
  statusTexto: string;
  arquivoSelecionado: boolean;
  caminhoArquivo: string;
  informacoesArquivo: InformacaoArquivo;
  extensoes: string[];
}
