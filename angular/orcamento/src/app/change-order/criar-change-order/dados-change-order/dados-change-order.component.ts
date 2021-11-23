import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RFI } from '@aw-models/rfi';
import { RfiService } from '@aw-services/projeto/rfi.service';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-dados-change-order',
  templateUrl: './dados-change-order.component.html',
  styleUrls: ['./dados-change-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DadosChangeOrderComponent implements OnInit {
  constructor(public rfiService: RfiService) {}

  @Input() form: FormGroup;

  trackByRfi = trackByFactory<RFI>('id');

  ngOnInit(): void {}
}
