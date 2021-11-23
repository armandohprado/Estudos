export interface GaAnexoAvulso {
  idOrcamentoGrupoAnexo: number;
  idOrcamentoGrupo: number;
  nomeOriginalArquivo: string;
  nomeArquivo: string;
  caminhoArquivo: string;
  ativo: boolean;
  data: string;

  loading?: boolean;
  downloading?: boolean;
}
