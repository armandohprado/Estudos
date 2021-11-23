import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GaPavimentoQuery } from '../state/pavimento/ga-pavimento.query';
import { GaAndar, GaEdificio, GaSite } from '../model/pavimento';
import { GaEtapaQuery } from '../state/etapa/ga-etapa.query';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { trackByFactory } from '../../../utils/track-by';

@Component({
  selector: 'app-ga-pavimentos',
  templateUrl: './ga-pavimentos.component.html',
  styleUrls: ['./ga-pavimentos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaPavimentosComponent implements OnInit {
  constructor(
    public gaPavimentoQuery: GaPavimentoQuery,
    public gaEtapaQuery: GaEtapaQuery,
    public gerenciadorArquivosService: GerenciadorArquivosService
  ) {}

  trackBySite = trackByFactory<GaSite>('id');
  trackByEdificio = trackByFactory<GaEdificio>('id');
  trackByAndar = trackByFactory<GaAndar>('id');

  ngOnInit(): void {}
}
