import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DefinicaoEscopoService } from '../definicao-escopo.service';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Component({
  selector: 'app-de-info-projeto-grupo',
  templateUrl: './de-info-projeto-grupo.component.html',
  styleUrls: ['./de-info-projeto-grupo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeInfoProjetoGrupoComponent {
  constructor(public definicaoEscopoService: DefinicaoEscopoService, public projetoService: ProjetoService) {}
}
