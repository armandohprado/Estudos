import { Component, Inject, Input } from '@angular/core';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { Andar } from '@aw-models/devolucao-proposta/andar-dp';
import { AwSelectFooterOptions } from '@aw-components/aw-select/aw-select.type';
import { Item } from '@aw-models/devolucao-proposta/item';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { CabecalhoDevolucaoProposta } from '@aw-models/devolucao-proposta/cabecalho-devolucao-proposta';
import { GerenciadorArquivosService } from '../../../../../orcamento/gerenciador-arquivos/gerenciador-arquivos.service';
import { WINDOW_TOKEN } from '@aw-shared/tokens/window';
import { Pavimento } from '@aw-models/devolucao-proposta/pavimento-dp';

@Component({
  selector: 'app-lista-documentos',
  templateUrl: './lista-documentos.component.html',
  styleUrls: ['./lista-documentos.component.scss'],
})
export class ListaDocumentosComponent {
  constructor(
    public devolucaoPropostaService: DevolucaoPropostaService,
    public dataDevolucaoProposta: DataDevolucaoPropostaService,
    private gerenciadorArquivosService: GerenciadorArquivosService,
    @Inject(WINDOW_TOKEN) private window: Window
  ) {}

  @Input() interno: boolean;
  @Input() proposta: Pavimento;

  cabecalho$ = this.devolucaoPropostaService.cabecalhoProposta$;

  awSelectFooterOptions: AwSelectFooterOptions = {
    secondaryBtn: {
      defaultAction: true,
      title: 'Limpar',
    },
    primaryBtn: {
      defaultAction: true,
      title: 'Aplicar',
    },
  };

  async listarDocumentos(): Promise<void> {
    const { idProjeto, idOrcamento, idOrcamentoGrupo, codigoGrupo, nomeGrupo } =
      this.devolucaoPropostaService.cabecalhoProposta;
    await this.gerenciadorArquivosService.showModal(
      {
        idOrcamento,
        idOrcamentoGrupo,
        idProjeto,
        readonly: true,
        title: 'Listagem de documentos',
        nomeGrupo: `${codigoGrupo} ${nomeGrupo}`,
        apenasSelecionados: true,
      },
      { ignoreBackdropClick: true }
    );
  }

  download(cabecalho: CabecalhoDevolucaoProposta): void {
    const url = `${this.dataDevolucaoProposta.target}/arquivos/download/questionario-seguro?idProjeto=${cabecalho.idProjeto}&idGrupo=${cabecalho.idGrupo}`;
    this.window.open(url, '_blank');
  }

  filtrarAndares($event: Andar[]): void {
    this.devolucaoPropostaService.andaresFiltrados = $event;
  }

  filtrarItens($event: Item[]): void {
    this.devolucaoPropostaService.itensFiltrados = $event;
  }
}
