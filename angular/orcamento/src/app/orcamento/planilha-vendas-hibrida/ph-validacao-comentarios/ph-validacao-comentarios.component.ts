import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ValidarComentarios, ValidarComentariosGrupo } from '../models/validar-comentarios';
import { trackByFactory } from '../../../utils/track-by';

@Component({
  selector: 'app-ph-validacao-comentarios',
  templateUrl: './ph-validacao-comentarios.component.html',
  styleUrls: ['./ph-validacao-comentarios.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhValidacaoComentariosComponent implements OnInit {
  constructor() {}

  @Input() validarComentarios: ValidarComentarios;

  trackByGrupo = trackByFactory<ValidarComentariosGrupo>('idGrupo');

  ngOnInit(): void {}
}
