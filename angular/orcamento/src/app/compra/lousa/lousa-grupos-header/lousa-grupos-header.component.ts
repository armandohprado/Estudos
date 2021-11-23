import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LousaService } from '../lousa.service';
import { LousaGrupo, LousaSort } from '../../models/lousa-grupo';
import { AwFilterPipeProperties } from '@aw-components/aw-filter/aw-filter.pipe';

@Component({
  selector: 'app-lousa-grupos-header',
  templateUrl: './lousa-grupos-header.component.html',
  styleUrls: ['./lousa-grupos-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LousaGruposHeaderComponent {
  constructor(public lousaService: LousaService) {}

  @Input() sort?: LousaSort;
  @Input() filtros: AwFilterPipeProperties<LousaGrupo> = {};
  @Input() hiddenColumns = true;
}
