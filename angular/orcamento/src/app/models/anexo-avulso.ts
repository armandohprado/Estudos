export interface AnexoAvulso {
  idOrcamentoGrupoAnexo: number;
  idOrcamentoGrupo: number;
  nomeOriginalArquivo: string;
  nomeArquivo: string;
  caminhoArquivo: string;
  data: Date | string;
  ativo: boolean;
}
