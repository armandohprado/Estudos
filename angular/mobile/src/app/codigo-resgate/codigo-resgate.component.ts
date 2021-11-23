import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { AwMobileService } from './codigo-resgate.service';
import { catchError, finalize, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-codigo-resgate',
  templateUrl: './codigo-resgate.component.html',
  styleUrls: ['./codigo-resgate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodigoResgateComponent {
  constructor(private awMobileService: AwMobileService, private changeDetectorRef: ChangeDetectorRef) {}

  @ViewChild('cel') celRef!: ElementRef<HTMLInputElement>;

  toogleForm = false;
  toogleMsg = false;
  celular = '';
  mensagem = {
    mensagem: 'Obrigado. Já enviamos um SMS para você, logo deve chegar o link para download.',
    class: 'sucesso',
  };

  openForm(): void {
    this.toogleForm = true;
    setTimeout(() => {
      this.celRef?.nativeElement.focus();
    });
  }

  enviar(): void {
    if (!this.celular) {
      return;
    }
    this.awMobileService
      .post({ celular: this.celular })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err?.error) {
            this.mensagem = { mensagem: err?.error.erros[0].mensagem, class: 'erro' };
          }
          return throwError(() => err);
        }),
        finalize(() => {
          this.toogleMsg = true;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }
}
