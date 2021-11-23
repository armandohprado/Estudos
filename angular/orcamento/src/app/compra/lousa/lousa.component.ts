import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { LousaService } from './lousa.service';

@Component({
  selector: 'app-lousa',
  templateUrl: './lousa.component.html',
  styleUrls: ['./lousa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LousaComponent implements OnDestroy {
  constructor(public lousaService: LousaService) {}

  ngOnDestroy(): void {
    this.lousaService.destroy();
  }
}
