import { UploadPasta } from './upload-pasta';

export interface UploadFile {
  idUpload: number;
  idUploadPasta: number;
  nomeArquivo: string;
  caminhoArquivo: string;
  ativo: boolean;
  nomeOriginal: string;
  uploadPasta: UploadPasta;
}
