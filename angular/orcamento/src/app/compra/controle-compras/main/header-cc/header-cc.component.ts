import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CcCabecalhoQuery } from '../../state/cabecalho/cc-cabecalho.query';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Component({
  selector: 'app-header-cc',
  templateUrl: './header-cc.component.html',
  styleUrls: ['./header-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderCcComponent {
  constructor(public ccCabecalhoQuery: CcCabecalhoQuery, private projetoService: ProjetoService) {}

  projeto$ = this.projetoService.projeto$;
}
