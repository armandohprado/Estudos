import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { CnGrupo } from '../../../../../models/cn-grupo';
import { CcGrupoService } from '../../../../state/grupos/cc-grupo.service';
import { CcGrupoQuery } from '../../../../state/grupos/cc-grupo.query';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModalMudarFaturamentoComponent } from './modal-mudar-faturamento/modal-mudar-faturamento.component';
import { of, Subject } from 'rxjs';
import { delay, finalize, takeUntil, tap } from 'rxjs/operators';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { FormControl } from '@angular/forms';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';

@Component({
  selector: 'app-header-body-grupo-cc',
  templateUrl: './body-header-grupo-cc.component.html',
  styleUrls: ['./body-header-grupo-cc.component.scss'],
  animations: [fadeOutAnimation(), collapseAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyHeaderGrupoCcComponent implements OnDestroy {
  constructor(
    public ccGruposService: CcGrupoService,
    public ccGruposQuery: CcGrupoQuery,
    private elementRef: ElementRef,
    private bsModalService: BsModalService,
    private changeDetectorRef: ChangeDetectorRef,
    private orcamentoService: OrcamentoService
  ) {}

  private readonly _destroy$ = new Subject<void>();

  @Input() grupo: CnGrupo;
  @Input() last = false;

  highlight = false;

  readonly complementoOverlayPositions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
    },
  ];

  readonly complementoOverlayControl = new FormControl('');

  scrollIntoView(): void {
    this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    of(null)
      .pipe(
        takeUntil(this._destroy$),
        delay(500),
        tap(() => {
          this.highlight = true;
          this.changeDetectorRef.markForCheck();
        }),
        delay(2500)
      )
      .subscribe(() => {
        this.highlight = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  openModalMudarFaturamento(grupo: CnGrupo, event: MouseEvent): void {
    event.stopPropagation();
    this.bsModalService.show(ModalMudarFaturamentoComponent, {
      initialState: { grupo },
      class: 'modal-lg',
      ignoreBackdropClick: true,
    });
  }

  toggleCollapse(): void {
    this.ccGruposService.toggleCollapse(this.grupo).subscribe();
  }

  openComplementoOverlay(): void {
    this.complementoOverlayControl.setValue(this.grupo.complementoOrcamentoGrupo);
    this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, { complementoOverlayOpened: true });
  }

  closeComplementoOverlay(): void {
    this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, { complementoOverlayOpened: false });
  }

  saveComplemento(): void {
    const newComplemento = this.complementoOverlayControl.value;
    this.complementoOverlayControl.disable();
    this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, { loadingComplementoOverlay: true });
    this.orcamentoService
      .patchOrcamentoGrupo(this.grupo.idOrcamento, this.grupo.idOrcamentoGrupo, {
        complementoOrcamentoGrupo: newComplemento,
      })
      .pipe(
        finalize(() => {
          this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, {
            loadingComplementoOverlay: false,
            complementoOverlayOpened: false,
            complementoOrcamentoGrupo: newComplemento,
          });
          this.complementoOverlayControl.enable();
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
