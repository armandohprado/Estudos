import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GaAndar, GaEdificio, GaSite, Pavimento } from '../../model/pavimento';
import { GerenciadorArquivosService } from '../../gerenciador-arquivos.service';
import { Observable } from 'rxjs';
import { GaPavimentoQuery } from '../../state/pavimento/ga-pavimento.query';
import { ProjetoAlt } from '../../../../models';

@Component({
  selector: 'app-ga-pavimento',
  templateUrl: './ga-pavimento.component.html',
  styleUrls: ['./ga-pavimento.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaPavimentoComponent implements OnInit {
  constructor(
    private gerenciadorArquivosService: GerenciadorArquivosService,
    private gaPavimentoQuery: GaPavimentoQuery
  ) {}

  @Input() projeto: ProjetoAlt;
  @Input() pavimento: Pavimento;
  @Input() site: GaSite;
  @Input() edificio: GaEdificio;
  @Input() andar: GaAndar;

  @Input() disabled: boolean;

  isActive$: Observable<boolean>;

  onSelect(): void {
    this.gerenciadorArquivosService.setPavimentoSelected(this.projeto, this.site, this.edificio, this.andar);
  }

  ngOnInit(): void {
    this.isActive$ = this.gaPavimentoQuery.isActive(this.site, this.edificio, this.andar, this.projeto);
  }
}
