import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PcCabecalhoService } from './state/cabecalho/pc-cabecalho.service';
import { PcCabecalhoQuery } from './state/cabecalho/pc-cabecalho.query';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';

@Component({
  selector: 'app-plano-compras',
  templateUrl: './plano-compras.component.html',
  styleUrls: ['./plano-compras.component.scss'],
  animations: [fadeOutAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanoComprasComponent {
  constructor(public pcCabecalhoService: PcCabecalhoService, public pcCabecalhoQuery: PcCabecalhoQuery) {}
}
