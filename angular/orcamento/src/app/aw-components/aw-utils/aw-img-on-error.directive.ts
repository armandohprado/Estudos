import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

/*
 * Como usar
 *
 * Coloque o atributo awImgOnError na sua tag de imagem (com property bind para a imagem "padrão")
 * E.g.
 *
 * <img src="endereco.que.pode.dar.erro.com" awImgOnError="imagem.padrao.que.nao.da.erro">
 *
 * Se der erro na imagem do src, a diretiva irá substituir pela imagem do awImgOnError
 *
 * */

@Directive({
  selector: 'img[awImgOnError]',
})
export class AwImgOnErrorDirective {
  constructor(private elementRef: ElementRef<HTMLImageElement>, private renderer2: Renderer2) {}

  @Input() awImgOnError: string;

  @HostListener('error')
  onError(): void {
    if (!this.awImgOnError || this.elementRef.nativeElement.src.endsWith(this.awImgOnError)) {
      return;
    }
    this.renderer2.setProperty(this.elementRef.nativeElement, 'src', this.awImgOnError);
  }
}
