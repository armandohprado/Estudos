import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GaPavimentoQuery } from '../state/pavimento/ga-pavimento.query';
import { GaAtividadeQuery } from '../state/atividade/ga-atividade.query';
import { GaAtividade } from '../model/atividade';
import { trackByFactory } from '../../../utils/track-by';

@Component({
  selector: 'app-ga-atividades',
  templateUrl: './ga-atividades.component.html',
  styleUrls: ['./ga-atividades.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaAtividadesComponent implements OnInit {
  constructor(public gaPavimentoQuery: GaPavimentoQuery, public gaAtividadeQuery: GaAtividadeQuery) {}

  trackByAtividade = trackByFactory<GaAtividade>('id');

  defaultAtividades: GaAtividade[] = [];

  ngOnInit(): void {}
}
