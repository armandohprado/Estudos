import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { AwDialogOptions, AwDialogsBtnOptions, AwDialogStatus } from './aw-dialog-types';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { isObservable, Subject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { isNil } from 'lodash-es';

@Component({
  selector: 'aw-dialog',
  templateUrl: './aw-dialog.component.html',
  styleUrls: ['./aw-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwDialogComponent implements OnInit, AwDialogOptions, OnDestroy {
  constructor(public bsModalRef: BsModalRef, public changeDetectorRef: ChangeDetectorRef) {}

  private _destroy$ = new Subject<void>();

  title: string;
  content: string;
  primaryBtn: AwDialogsBtnOptions;
  secondaryBtn: AwDialogsBtnOptions;
  bsModalOptions: ModalOptions<AwDialogComponent>;
  status: AwDialogStatus;
  contentHtml: string;
  contentClass: string;
  titleHtml: string;
  titleClass: string;

  icon: string;

  loading = false;

  close(key: keyof Pick<AwDialogComponent, 'primaryBtn' | 'secondaryBtn'>): void {
    const result = this[key].action?.(this.bsModalRef);
    if (isNil(result)) {
      this.bsModalRef.hide();
    }
    if (isObservable(result)) {
      this.loading = true;
      this.changeDetectorRef.detectChanges();
      result
        .pipe(
          take(1),
          finalize(() => {
            this.loading = false;
            this.changeDetectorRef.detectChanges();
          })
        )
        .subscribe();
    }
  }

  ngOnInit(): void {
    switch (this.status) {
      case 'warning':
        this.icon = 'aw-icon-alerta';
        break;
      case 'info':
        this.icon = 'icon-information';
        break;
      case 'error':
        this.icon = 'aw-icon-erro';
        break;
      case 'success':
        this.icon = 'aw-icon-sucesso';
        break;
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
