import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GaAnexoAvulsoQuery } from '../state/anexo-avulso/ga-anexo-avulso.query';
import { GaAtividadeQuery } from '../state/atividade/ga-atividade.query';
import { GerenciadorArquivosService } from '../gerenciador-arquivos.service';
import { GaAnexoAvulso } from '../model/anexo-avulso';
import { downloadBase64 } from '../../../utils/util';

@Component({
  selector: 'app-ga-anexos-avulsos-wrapper',
  templateUrl: './ga-anexos-avulsos-wrapper.component.html',
  styleUrls: ['./ga-anexos-avulsos-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaAnexosAvulsosWrapperComponent implements OnInit {
  constructor(
    public gaAnexoAvulsoQuery: GaAnexoAvulsoQuery,
    public gaAtividadeQuery: GaAtividadeQuery,
    public gerenciadorArquivosService: GerenciadorArquivosService
  ) {}

  toggleAnexo([$event, anexo]: [boolean, GaAnexoAvulso]): void {
    this.gerenciadorArquivosService.toggleAnexo(anexo, $event).subscribe();
  }

  download(anexo: GaAnexoAvulso): void {
    const { idOrcamento, idOrcamentoGrupo } = this.gerenciadorArquivosService;
    this.gerenciadorArquivosService.getFileBase64(idOrcamento, idOrcamentoGrupo, anexo).subscribe(base64 => {
      downloadBase64(anexo.nomeOriginalArquivo, base64);
    });
  }

  ngOnInit(): void {}
}
