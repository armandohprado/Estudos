import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CnGrupo, CnTipoGrupoEnum } from '../../../../../../../../../models/cn-grupo';
import { trackByFactory } from '@aw-utils/track-by';
import {
  CompraNegociacaoGrupoFichaAprovador,
  CompraNegociacaoGrupoFichaArquivo,
  CompraNegociacaoGrupoFichaTipoAreaCausa,
  CompraNegociacaoGrupoTransacao,
} from '../../../../../../../../../models/cn-mapa';
import { CnFornecedor } from '../../../../../../../../../models/cn-fornecedor';

@Component({
  selector: 'app-mapas-detalhes',
  templateUrl: './mapas-detalhes.component.html',
  styleUrls: ['./mapas-detalhes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapasDetalhesComponent implements OnInit {
  constructor() {}

  tipoGrupoEnum = CnTipoGrupoEnum;

  @Input() grupo: CnGrupo;

  trackByGrupoMapaFornecedor = trackByFactory<CnFornecedor>('idCompraNegociacaoGrupoMapaFornecedor');
  trackByGrupoTransacao = trackByFactory<CompraNegociacaoGrupoTransacao>('idCompraNegociacaoGrupoTransacao');
  trackByGrupoFichaAreaCausa = trackByFactory<CompraNegociacaoGrupoFichaTipoAreaCausa>(
    'idCompraNegociacaoGrupoFichaTipoAreaCausa'
  );
  trackByGrupoFichaArquivo = trackByFactory<CompraNegociacaoGrupoFichaArquivo>();
  trackByGrupoFichaAprovador = trackByFactory<CompraNegociacaoGrupoFichaAprovador>(
    'idCompraNegociacaoGrupoFichaAprovador'
  );

  ngOnInit(): void {}
}
