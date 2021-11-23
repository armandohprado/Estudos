import { AnexoAvulso } from './anexo-avulso';
import { Arquivo } from './arquivo';

export interface Disciplina {
  idAtividade: number;
  nomeAtividade: string;
  arquivos: Arquivo[];
  qtdArquivosAtividade?: number;
  qtdArquivosSelecionados?: number;
  anexosAvulsos?: AnexoAvulso[];
  selecaoPadrao: boolean;
}
