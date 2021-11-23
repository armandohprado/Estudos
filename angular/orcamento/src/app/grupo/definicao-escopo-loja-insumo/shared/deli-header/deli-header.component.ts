import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DefinicaoEscopoLojaService } from '../../../definicao-escopo-loja/definicao-escopo-loja.service';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';
import { GrupoAlt } from '@aw-models/grupo-alt';

@Component({
  selector: 'app-deli-header',
  templateUrl: './deli-header.component.html',
  styleUrls: ['./deli-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliHeaderComponent {
  constructor(private definicaoEscopoLojaService: DefinicaoEscopoLojaService, private projetoService: ProjetoService) {}

  @Input() grupo: GrupoAlt;

  readonly projeto$ = this.projetoService.projeto$;
}
