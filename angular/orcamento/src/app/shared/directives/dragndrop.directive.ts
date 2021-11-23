import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from '@angular/core';

// class ImageSnippet {
//   pending = false;
//   status = 'init';
//   constructor(public src: string, public file: File) {}
// }

@Directive({
  selector: '[appDragndrop]',
})
export class DragndropDirective {
  constructor() {}

  @Output() fileDropped = new EventEmitter<any>();

  @HostBinding('style.opacity') private opacity = '1';
  @HostBinding('style.border-color') private borderColor = '#048dbc';
  @HostBinding('style.color') private color = '#048dbc';
  // @HostBinding('innerHtml') private text = 'selecione ou arraste o logo aqui'

  // Dragover listener
  @HostListener('dragover', ['$event'])
  onDragOver(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.opacity = '0.8';
    this.borderColor = '#4d8012';
    this.color = '#4d8012';
    // this.text = 'solte o logo aqui'
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.borderColor = '#048dbc';
    this.color = '#048dbc';
    // this.text = 'selecione ou arraste o logo aqui'
    this.opacity = '1';
  }

  // Drop listener
  @HostListener('drop', ['$event'])
  public ondrop(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.opacity = '1';
    const file = evt.dataTransfer.files[0];
    if (file) {
      this.fileDropped.emit(file);
    }
  }
}
