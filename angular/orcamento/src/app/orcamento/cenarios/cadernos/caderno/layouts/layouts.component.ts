import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CadernoLayout } from '@aw-models/cadernos/cadernoLayout';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { delay, filter, finalize, map, takeUntil } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';
import { ActivatedRoute } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../../../../environments/environment';
import { combineLatest, Observable, Subject } from 'rxjs';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';

@Component({
  selector: 'app-caderno-layouts',
  templateUrl: './layouts.component.html',
  styleUrls: ['./layouts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutsComponent implements OnInit, OnDestroy {
  constructor(
    private cadernosService: CadernosService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private bsModalService: BsModalService,
    private cenariosService: CenariosService
  ) {}

  private _destroy$ = new Subject<void>();

  @ViewChild('imageModal', { read: TemplateRef }) imageModalRef: TemplateRef<{ image: string; alt: string }>;

  endPointImagem = environment.AwApiUrl;

  successFeedback$ = new Subject<boolean>();

  layoutModal: CadernoLayout;

  cadernosLayout$: Observable<CadernoLayout[]> = combineLatest([
    this.cadernosService.cadernoLayouts$,
    this.cenariosService.cenarioPadrao$,
  ]).pipe(
    map(([layouts, cenarioPadrao]) => {
      if (!cenarioPadrao.existePlanilhaCliente) {
        // Filtro para remover as opções de Caderno Cliente e Caderno Cliente Colunado (ID 13 e 14)
        return layouts.filter(layout => ![13, 14].includes(layout.idCadernoLayout));
      }
      return layouts;
    })
  );

  loader: boolean;
  idCaderno: number;

  trackByCadernoLayout = trackByFactory<CadernoLayout>('idCadernoLayout');

  change(id: number, checked: boolean): void {
    this.cadernosService.updateCadernoLayout(id, { checked });
  }

  salvar(): void {
    this.loader = true;
    const payload = this.cadernosService.cadernoLayoutsSnapshot
      .filter(layout => layout.checked)
      .map(layout => {
        return {
          idCadernoLayout: layout.idCadernoLayout,
          idCaderno: this.idCaderno,
        };
      });
    this.cadernosService
      .postCadernoLayout(payload, this.idCaderno)
      .pipe(
        finalize(() => {
          this.loader = false;
          this.successFeedback$.next(true);
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  openModalImage(layout: CadernoLayout): void {
    this.layoutModal = layout;
    this.bsModalService.show(this.imageModalRef, { class: 'modal-lg' });
  }

  ngOnInit(): void {
    this.idCaderno = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idCaderno);
    this.successFeedback$
      .pipe(
        takeUntil(this._destroy$),
        filter(show => show),
        delay(1000)
      )
      .subscribe(() => {
        this.successFeedback$.next(false);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
