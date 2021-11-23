import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Familia } from '@aw-models/index';
import { ChangeOrderFamiliaQuery } from '../../state/familia/change-order-familia.query';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { ChangeOrderFamiliaService } from '../../state/familia/change-order-familia.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { filter, take, takeUntil } from 'rxjs/operators';
import { getOverlayFromPosition } from '@aw-utils/cdk-overlay';
import { FormControl, Validators } from '@angular/forms';
import { maxBy } from 'lodash-es';
import { Overlay, OverlayRef, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-familias-change-order',
  templateUrl: './familias-change-order.component.html',
  styleUrls: ['./familias-change-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FamiliasChangeOrderComponent implements OnInit, OnDestroy {
  constructor(
    public changeOrderFamiliaQuery: ChangeOrderFamiliaQuery,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeOrderFamiliaService: ChangeOrderFamiliaService,
    private routerQuery: RouterQuery,
    private changeDetectorRef: ChangeDetectorRef,
    private overlay: Overlay,
    private scrollStrategyOptions: ScrollStrategyOptions,
    private viewContainerRef: ViewContainerRef
  ) {}

  private _destroy$ = new Subject<void>();

  @ViewChild('familiaCustomizadaRef', { read: TemplateRef })
  familiaCustomizadaTemplateRef: TemplateRef<any>;

  overlayRef: OverlayRef;

  familias$: Observable<Familia[]>;

  activeId$: Observable<string>;

  addFamiliaPositions = getOverlayFromPosition('bottom');
  nomeFamiliaCustomizadaControl = new FormControl(null, [Validators.required]);

  trackByFamilia = trackByFactory<Familia>('id');

  private getLastIdCustom(): number {
    return (
      maxBy(
        this.changeOrderFamiliaQuery
          .getAll()
          .filter(o => o.customizada)
          .map(o => {
            return {
              ...o,
              idFamiliaCustomizada: o.idFamiliaCustomizada ?? +o.id.replace('custom', ''),
            };
          }),
        'idFamiliaCustomizada'
      )?.idFamiliaCustomizada ?? 0
    );
  }

  addFamilia(idFamilia?: string): void {
    const idOrcamento = +this.routerQuery.getParams(RouteParamEnum.idOrcamento);
    const nome = this.nomeFamiliaCustomizadaControl.value;
    if (idFamilia) {
      this.changeOrderFamiliaService.update(idFamilia, {
        descricaoFamilia: nome,
      });
      this.changeOrderFamiliaService.salvarFamiliaCustomizada(idOrcamento, idFamilia).subscribe(() => {
        this.nomeFamiliaCustomizadaControl.reset(null);
        this.closeAddFamilia();
      });
    } else {
      this.changeOrderFamiliaService
        .addFamiliaCustomizada(idOrcamento, this.nomeFamiliaCustomizadaControl.value, this.getLastIdCustom() + 1)
        .subscribe(() => {
          this.nomeFamiliaCustomizadaControl.reset(null);
          this.closeAddFamilia();
        });
    }
  }

  closeAddFamilia(): void {
    this.overlayRef?.detach();
    this.changeDetectorRef.markForCheck();
  }

  navigateFamilia(familia: Familia): void {
    this.router
      .navigate(['familia', familia.id], {
        relativeTo: this.activatedRoute,
      })
      .then();
  }

  openOverlay(element: HTMLElement, width: number, context?: any): void {
    this.overlayRef = this.overlay.create({
      scrollStrategy: this.scrollStrategyOptions.block(),
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width,
      positionStrategy: this.overlay.position().flexibleConnectedTo(element).withPositions(this.addFamiliaPositions),
    });
    this.overlayRef.attach(new TemplatePortal(this.familiaCustomizadaTemplateRef, this.viewContainerRef, context));
    this.overlayRef
      .backdropClick()
      .pipe(takeUntil(this._destroy$), take(1))
      .subscribe(() => {
        this.overlayRef.detach();
      });
  }

  ngOnInit(): void {
    this.familias$ = this.changeOrderFamiliaQuery.all$;
    if (!this.changeOrderFamiliaQuery.hasActive()) {
      this.navigateFamilia(this.changeOrderFamiliaQuery.getFirstFamilia());
    }
    this.routerQuery
      .selectParams<string>(RouteParamEnum.idFamilia)
      .pipe(
        filter(idFamilia => !!idFamilia),
        takeUntil(this._destroy$)
      )
      .subscribe(idFamilia => {
        this.changeOrderFamiliaService.setActive(idFamilia);
      });
    this.activeId$ = this.changeOrderFamiliaQuery.selectActiveId();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
