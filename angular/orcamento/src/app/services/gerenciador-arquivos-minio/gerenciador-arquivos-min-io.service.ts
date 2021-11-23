import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { UploadPasta } from '../../models/gerenciador-arquivos-minio/upload-pasta';
import { UploadFile } from '../../models/gerenciador-arquivos-minio/upload-file';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GerenciadorArquivosMinIOService {
  constructor(private http: HttpClient) {}

  target = `${environment.AwApiUrl}gerenciador-arquivos-MinIO`;

  getPastas(): Observable<UploadPasta[]> {
    return this.http.get<UploadPasta[]>(`${this.target}/ListarPastas`);
  }

  getArquivosPorPasta(idPasta: number): Observable<UploadFile[]> {
    return this.http.get<UploadFile[]>(`${this.target}/ListarArquivosPorPasta/${idPasta}`);
  }

  getArquivo(idArquivo: number): Observable<UploadFile> {
    return this.http.get<UploadFile>(`${this.target}/ObterArquivo/${idArquivo}`);
  }

  getDownloadArquivo(idArquivo: number): Observable<UploadFile> {
    return this.http.get<UploadFile>(`${this.target}/DownloadArquivo/${idArquivo}`);
  }

  postAdicionarPasta(nome: string, diretorio: string): Observable<UploadPasta> {
    const insertPasta = {
      nome,
      diretorio,
      ativo: true,
    };
    return this.http.put<any>(`${this.target}/AdicionarPasta`, insertPasta);
  }

  private putUploadArquivo(file: File, idPasta = 1): Observable<UploadFile> {
    const formData = new FormData();
    const params = new HttpParams().set('idPasta', '' + idPasta);
    const headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');

    formData.append('file', file, file.name);

    return this.http.put<UploadFile>(`${this.target}/UploadArquivo`, formData, {
      headers,
      params,
    });
  }

  uploadArquivo(nomePasta: string, file: File): Observable<UploadFile> {
    const pasta$ = this.getPastas().pipe(map(pastas => pastas?.find(pasta => pasta?.nome === nomePasta)));
    const req$ = (idPasta: number): Observable<UploadFile> => this.putUploadArquivo(file, idPasta);
    const adicionarPasta$ = this.postAdicionarPasta(nomePasta, nomePasta).pipe(
      switchMap(pasta => {
        return req$(pasta.idUploadPasta);
      })
    );
    return pasta$.pipe(
      switchMap(pasta => {
        if (pasta?.idUploadPasta) {
          return req$(pasta?.idUploadPasta);
        } else {
          return adicionarPasta$;
        }
      })
    );
  }

  uploadArquivos(nomePasta: string, fileList: FileList): Observable<UploadFile[]> {
    const pasta$ = this.getPastas().pipe(map(pastas => pastas?.find(pasta => pasta?.nome === nomePasta)));
    const req$ = (idPasta: number) => this.uploadMultiplosArquivos(idPasta, fileList);
    const adicionarPasta$ = this.postAdicionarPasta(nomePasta, nomePasta).pipe(
      switchMap(pasta => {
        return req$(pasta.idUploadPasta);
      })
    );
    return pasta$.pipe(
      switchMap(pasta => {
        if (pasta?.idUploadPasta) {
          return req$(pasta?.idUploadPasta);
        } else {
          return adicionarPasta$;
        }
      })
    );
  }

  private uploadMultiplosArquivos(idPasta: number, fileList: FileList): Observable<UploadFile[]> {
    if (!fileList?.length) return of([]);
    const requests = Array.from(fileList).map(file => this.putUploadArquivo(file, idPasta));
    return forkJoin(requests);
  }
}
