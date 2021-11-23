import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AwDialogOptions, AwDialogsBtnOptions, AwDialogStatus } from './aw-dialog-types';
import { AwDialogComponent } from './aw-dialog.component';
import { isString } from 'lodash-es';

export const DEFAULT_AW_DIALOG_OPTIONS: Partial<AwDialogOptions> = {
  contentClass: '',
  titleClass: '',
};

export const DEFAULT_MODAL_OPTIONS: ModalOptions<AwDialogComponent> = {
  class: 'aw-dialog',
};

export const DEFAULT_BTN_OPTIONS: AwDialogsBtnOptions = {
  useDefaultWidth: true,
};

export const DEFAULT_SECONDARY_BTN_OPTIONS: AwDialogsBtnOptions = {
  title: 'Fechar',
  status: 'secondary',
  action: bsModalRef => bsModalRef.hide(),
};

export const getDefaultOptions = (
  status: AwDialogStatus,
  options: Partial<AwDialogOptions> = {}
): ModalOptions<AwDialogComponent> => {
  const clazz = options.bsModalOptions?.class
    ? `${options.bsModalOptions.class} ${DEFAULT_MODAL_OPTIONS.class}`
    : DEFAULT_MODAL_OPTIONS.class;
  const initialState: AwDialogOptions = {
    ...DEFAULT_AW_DIALOG_OPTIONS,
    ...options,
    bsModalOptions: { ...DEFAULT_MODAL_OPTIONS, ...options.bsModalOptions, class: clazz },
    secondaryBtn:
      options.secondaryBtn === null
        ? null
        : {
            ...DEFAULT_SECONDARY_BTN_OPTIONS,
            ...DEFAULT_BTN_OPTIONS,
            ...options.secondaryBtn,
          },
    primaryBtn: options.primaryBtn ? { ...DEFAULT_BTN_OPTIONS, ...options.primaryBtn } : null,
    status,
  };
  return { initialState, ...initialState.bsModalOptions };
};

@Injectable({ providedIn: 'root' })
export class AwDialogService {
  constructor(private bsModalService: BsModalService) {}

  private showModal(
    status: AwDialogStatus,
    title: string | Partial<AwDialogOptions>,
    content?: string,
    options?: Partial<AwDialogOptions>
  ): BsModalRef {
    let newOptions: Partial<AwDialogOptions>;
    if (isString(title)) {
      newOptions = { title, content, ...options };
    } else {
      newOptions = title;
    }
    return this.bsModalService.show(AwDialogComponent, getDefaultOptions(status, newOptions));
  }

  error(
    titleOrOptions: string | Partial<AwDialogOptions>,
    content?: string,
    options?: Partial<AwDialogOptions>
  ): BsModalRef {
    return this.showModal('error', titleOrOptions, content, options);
  }

  success(
    titleOrOptions: string | Partial<AwDialogOptions>,
    content?: string,
    options?: Partial<AwDialogOptions>
  ): BsModalRef {
    return this.showModal('success', titleOrOptions, content, options);
  }

  warning(
    titleOrOptions: string | Partial<AwDialogOptions>,
    content?: string,
    options?: Partial<AwDialogOptions>
  ): BsModalRef {
    return this.showModal('warning', titleOrOptions, content, options);
  }

  info(
    titleOrOptions: string | Partial<AwDialogOptions>,
    content?: string,
    options?: Partial<AwDialogOptions>
  ): BsModalRef {
    return this.showModal('info', titleOrOptions, content, options);
  }
}
