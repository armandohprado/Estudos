import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs';
import { CotacaoService } from '@aw-services/cotacao/cotacao.service';
import { PropostaComercial } from '@aw-models/PropostaComercial';
import { PropostaAlt } from '../../models';
import { trackByFactory } from '@aw-utils/track-by';
import { downloadBase64 } from '@aw-utils/util';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

@Component({
  selector: 'app-modal-upload-proposta',
  templateUrl: './modal-upload-proposta.component.html',
  styleUrls: ['./modal-upload-proposta.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalUploadPropostaComponent implements OnInit {
  constructor(
    public bsModalRef: BsModalRef,
    private cotacaoService: CotacaoService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() proposta: PropostaAlt;
  @Input() nomeFantasia: string;
  @Input() nomeGrupo: string;
  @Input() codigoGrupo: string;
  @Input() idGrupo: number;
  @Input() idOrcamento: number;

  propostaVersaoAtual?: PropostaComercial;
  fileUploadError = false;
  fileList: FileList | null = null;

  propostasComerciais: PropostaComercial[] = [];
  loadingPropostas = true;
  loadingUpload = false;

  loadingEntity: Record<number, boolean> = {};

  readonly trackByPropostaComercial = trackByFactory<PropostaComercial>('idPropostaComercial');

  private _setData(propostasComerciais: PropostaComercial[]): void {
    const propostas: PropostaComercial[] = [];
    for (const propostaComercial of propostasComerciais) {
      if (propostaComercial.versaoAtual) {
        this.propostaVersaoAtual = propostaComercial;
      } else {
        propostas.push(propostaComercial);
      }
    }
    this.propostasComerciais = propostas;
    this.changeDetectorRef.markForCheck();
  }

  setLoading(id: number, loading: boolean): void {
    this.loadingEntity = { ...this.loadingEntity, [id]: loading };
  }

  onDownloadFile(fileName: string, originalFileName: string, idPropostaComercial: number): void {
    this.setLoading(idPropostaComercial, true);
    this.cotacaoService
      .downloadFile(this.idOrcamento, this.idGrupo, this.proposta.idProposta, fileName)
      .pipe(
        finalize(() => {
          this.setLoading(idPropostaComercial, false);
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(({ data }) => {
        downloadBase64(originalFileName, data);
      });
  }

  sendPropostaComercialFile(fileList: FileList): void {
    this.loadingUpload = true;
    this.cotacaoService
      .sendPropostaComercialFile(this.idOrcamento, this.idGrupo, this.proposta.idProposta, fileList)
      .pipe(
        finalize(() => {
          this.loadingUpload = false;
          this.fileList = null;
        }),
        catchAndThrow(() => {
          this.fileUploadError = true;
        })
      )
      .subscribe(propostasComerciais => {
        this.fileUploadError = false;
        this._setData(propostasComerciais);
      });
  }

  ngOnInit(): void {
    this.cotacaoService
      .getPropostaComercialFiles(this.idOrcamento, this.idGrupo, this.proposta.idProposta)
      .pipe(
        finalize(() => {
          this.loadingPropostas = false;
        })
      )
      .subscribe(propostasComerciais => {
        this._setData(propostasComerciais);
      });
  }
}
