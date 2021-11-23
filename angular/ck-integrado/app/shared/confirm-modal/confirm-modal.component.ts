import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { isObservable, Observable } from 'rxjs';
import { StateComponent } from '../common/state-component';
import { take, takeUntil } from 'rxjs/operators';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { isFunction } from '@aw-utils/utils';

export interface ConfirmModalOptions {
  btnYes?: string;
  yesAction?: ((modalRef: BsModalRef<ConfirmModalComponent>) => any) | Observable<any>;
  btnNo?: string;
  noAction?: ((modalRef: BsModalRef<ConfirmModalComponent>) => any) | Observable<any>;
  title?: string;
  content?: string;
}

export interface ConfirmModalState {
  loading: boolean;
}

@Component({
  selector: 'aw-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent extends StateComponent<ConfirmModalState> implements ConfirmModalOptions {
  constructor(public bsModalRef: BsModalRef<ConfirmModalComponent>) {
    super({ loading: false });
  }

  loading$ = this.selectState('loading');

  btnYes?: string;
  yesAction?: ((modalRef: BsModalRef<ConfirmModalComponent>) => any) | Observable<any>;
  btnNo?: string;
  noAction?: ((modalRef: BsModalRef<ConfirmModalComponent>) => any) | Observable<any>;
  title?: string;
  content?: string;

  private _proccessObservable(observable: Observable<any>): void {
    this.updateState({ loading: true });
    observable
      .pipe(
        take(1),
        takeUntil(this.destroy$),
        catchAndThrow(() => {
          this.updateState({ loading: false });
        })
      )
      .subscribe(() => {
        this.updateState({ loading: false });
        this.bsModalRef.hide();
      });
  }

  yes(): void {
    if (isObservable(this.yesAction)) {
      this._proccessObservable(this.yesAction);
    } else if (isFunction(this.yesAction)) {
      const result = this.yesAction(this.bsModalRef);
      if (isObservable(result)) {
        this._proccessObservable(result);
      }
    } else {
      this.bsModalRef.hide();
    }
  }

  no(): void {
    if (isObservable(this.noAction)) {
      this._proccessObservable(this.noAction);
    } else if (isFunction(this.noAction)) {
      const result = this.noAction(this.bsModalRef);
      if (isObservable(result)) {
        this._proccessObservable(result);
      }
    } else {
      this.bsModalRef.hide();
    }
  }
}
