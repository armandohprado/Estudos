import { AwComponentStatus } from '../util/types';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { AwDialogComponent } from './aw-dialog.component';

export interface AwDialogOptions {
  status: AwDialogStatus;
  title?: string;
  titleHtml?: string;
  titleClass?: string;
  content?: string;
  contentHtml?: string;
  contentClass?: string;
  primaryBtn?: AwDialogsBtnOptions;
  secondaryBtn?: AwDialogsBtnOptions;
  bsModalOptions?: ModalOptions<AwDialogComponent>;
}

export interface AwDialogsBtnOptions {
  title?: string;
  status?: AwComponentStatus;
  action?: (bsModalRef: BsModalRef) => any;
  useDefaultWidth?: boolean;
}

export type AwDialogStatus = 'error' | 'success' | 'info' | 'warning';
