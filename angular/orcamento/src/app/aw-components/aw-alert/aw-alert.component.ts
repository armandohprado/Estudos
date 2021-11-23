import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';

export type AwAlertType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'aw-alert',
  templateUrl: './aw-alert.component.html',
  styleUrls: ['./aw-alert.component.scss'],
  exportAs: 'aw-alert',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwAlertComponent implements OnInit {
  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  @Input() tipo: AwAlertType = 'info';
  @Input() dismissible: boolean;
  @Input() dismissOnTimeout: number;
  @Input() isOpen = true;
  @Output() closeAlert = new EventEmitter<void>();

  close(): void {
    this.isOpen = false;
    this.closeAlert.emit();
    this.changeDetectorRef.markForCheck();
  }

  open(): void {
    this.isOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  ngOnInit(): void {
    if (this.dismissOnTimeout) {
      setTimeout(() => {
        this.close();
      }, this.dismissOnTimeout);
    }
  }
}
