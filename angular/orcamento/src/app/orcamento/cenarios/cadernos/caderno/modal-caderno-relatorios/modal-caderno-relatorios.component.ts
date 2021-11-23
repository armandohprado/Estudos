import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { Caderno, PlanilhaOpcaoRelatorio } from '@aw-models/cadernos/caderno';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { finalize, tap } from 'rxjs/operators';
import { WINDOW_TOKEN } from '@aw-shared/tokens/window';
import { refresh } from '@aw-utils/rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';
import { isFunction } from 'lodash-es';

@Component({
  selector: 'app-modal-caderno-relatorios',
  templateUrl: './modal-caderno-relatorios.component.html',
  styleUrls: ['./modal-caderno-relatorios.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalCadernoRelatoriosComponent implements OnInit {
  constructor(
    private bsModalRef: BsModalRef,
    private cadernosService: CadernosService,
    @Inject(WINDOW_TOKEN) private window: Window,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() caderno: Caderno;
  @Input() idOrcamentoCenario: number;

  taxaDiluida = false;
  imposto = true;

  loading = true;
  opcaoRelatorios: PlanilhaOpcaoRelatorio[] = [];
  tipoArquivo = TipoArquivo;

  trackByOpcaoRelatorio = trackByFactory<PlanilhaOpcaoRelatorio>('idCadernoLayout');

  private _updateOpcaoRelatorio(
    idCadernoLayout: number,
    partial: Partial<PlanilhaOpcaoRelatorio> | ((opcaoRelatorio: PlanilhaOpcaoRelatorio) => PlanilhaOpcaoRelatorio)
  ): void {
    const update = isFunction(partial)
      ? partial
      : (opcaoRelatorio: PlanilhaOpcaoRelatorio) => ({ ...opcaoRelatorio, ...partial });
    this.opcaoRelatorios = this.opcaoRelatorios.map(opcaoRelatorio => {
      if (opcaoRelatorio.idCadernoLayout === idCadernoLayout) {
        opcaoRelatorio = update(opcaoRelatorio);
      }
      return opcaoRelatorio;
    });
    this.changeDetectorRef.markForCheck();
  }

  close(): void {
    this.bsModalRef.hide();
  }

  openRelatorio(opcaoRelatorio: PlanilhaOpcaoRelatorio, tipoArquivo: TipoArquivo): void {
    const payload = { ...opcaoRelatorio, tipoArquivo, taxaDiluida: this.taxaDiluida, impostoDiluido: this.imposto };
    const key = tipoArquivo === TipoArquivo.excel ? 'loadingExcel' : 'loadingPdf';
    this._updateOpcaoRelatorio(opcaoRelatorio.idCadernoLayout, { [key]: true });
    this.cadernosService
      .postOpcoesRelatorios(payload)
      .pipe(
        refresh(this.cadernosService.getCadernos(this.idOrcamentoCenario)),
        tap(retorno => {
          this.window.open(retorno + '', '_blank');
        }),
        finalize(() => {
          this._updateOpcaoRelatorio(opcaoRelatorio.idCadernoLayout, { [key]: false });
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.cadernosService
      .getOpcoesRelatorios(this.caderno.idCaderno)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(opcoesRelatorios => {
        this.opcaoRelatorios = opcoesRelatorios;
      });
  }
}

export enum TipoArquivo {
  // IDS
  pdf = 1,
  excel,
}
