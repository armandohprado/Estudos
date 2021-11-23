import { Component, ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { NovidadeService } from '../novidade.service';
import { catchError, of, tap, throwError } from 'rxjs';
import { environment } from '@aw-environments/environment';

@Component({
  selector: 'app-nov-card-c',
  templateUrl: './nov-card-c.component.html',
  styleUrls: ['./nov-card-c.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovCardCComponent {
  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private novidadeService: NovidadeService,
    private changeDetectorRef: ChangeDetectorRef,
    private bsModalService: BsModalService
  ) {}

  modalRefError!: BsModalRef;
  formAdcCardNovidades = this.formBuilder.group({
    titulo: '',
    link: '',
    imagem: ['', Validators.required],
    corFundo: '',
    ordem: ['', Validators.required],
  });

  previewImagem = '';

  _uploadFile($event: Event, template: TemplateRef<any>): void {
    $event.preventDefault();
    $event.stopPropagation();
    const files = ($event.target as HTMLInputElement).files;
    this.enviarArquivos(files, template);
  }

  enviarArquivos(files: FileList | null, template: TemplateRef<any>): void {
    if (files?.length) {
      this.novidadeService
        .sendFile(files)
        .pipe(
          tap(resp => {
            this.formAdcCardNovidades.get('imagem')?.setValue(resp.arquivo);
            this.previewImagem = `${environment.preview}${resp.arquivo}`;
            this.changeDetectorRef.markForCheck();
          }),
          catchError(() => {
            this.modalRefError = this.bsModalService.show(template, { class: 'modal-sm' });
            return of();
          })
        )
        .subscribe();
    }
  }

  salvar(): void {
    this.novidadeService.adicionarCardNovidades(this.formAdcCardNovidades.value);
    this.bsModalRef.hide();
  }
}
