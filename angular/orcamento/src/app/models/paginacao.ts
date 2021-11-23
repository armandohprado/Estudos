export interface PaginacaoMetadata {
  paginaAtual: number;
  totalPaginas: number;
  totalPorPagina: number;
  totalItens: number;
}

export interface PaginacaoRange {
  descricao: string;
  pagina: number;
}

export interface PaginacaoMetadataComRange extends PaginacaoMetadata {
  range: PaginacaoRange[];
}

export interface Paginacao<T> extends PaginacaoMetadata {
  retorno: T[];
}

export interface PaginacaoComRange<T> extends PaginacaoMetadataComRange {
  retorno: T[];
}
