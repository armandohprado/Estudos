import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PcCabecalhoQuery } from '../state/cabecalho/pc-cabecalho.query';
import { PcCabecalhoService } from '../state/cabecalho/pc-cabecalho.service';
import { PcCabecalhoValor } from '../models/pc-cabecalho';
import { trackByFactory } from '@aw-utils/track-by';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Component({
  selector: 'app-pc-cabecalho',
  templateUrl: './pc-cabecalho.component.html',
  styleUrls: ['./pc-cabecalho.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PcCabecalhoComponent {
  constructor(
    public pcCabecalhoQuery: PcCabecalhoQuery,
    private pcCabecalhoService: PcCabecalhoService,
    private projetoService: ProjetoService
  ) {}

  @Input() minified: boolean;

  readonly projeto$ = this.projetoService.projeto$;

  readonly trackBy = trackByFactory<PcCabecalhoValor>('title');
}
