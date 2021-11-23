import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { ChangeOrderFamiliaQuery } from '../../../state/familia/change-order-familia.query';
import { filter, pluck, switchMap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Grupao, Grupo } from '@aw-models/index';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { ChangeOrderFamiliaService } from '../../../state/familia/change-order-familia.service';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-grupoes-change-order',
  templateUrl: './familia-change-order.component.html',
  styleUrls: ['./familia-change-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeOutAnimation(), collapseAnimation()],
})
export class FamiliaChangeOrderComponent implements OnInit, OnDestroy {
  constructor(
    private routerQuery: RouterQuery,
    private changeOrderFamiliaQuery: ChangeOrderFamiliaQuery,
    public changeOrderFamiliaService: ChangeOrderFamiliaService
  ) {}

  idFamilia$ = new BehaviorSubject<string>(null);

  private _destroy$ = new Subject<void>();

  grupoes$: Observable<Grupao[]>;

  orderByGrupo = orderByCodigo<Grupo>('codigoGrupo');

  trackByGrupao = trackByFactory<Grupao>('idGrupao');
  trackByGrupo = trackByFactory<Grupo>('idGrupo');

  selectGrupo(idFamilia: string, idGrupao: number, idGrupo: number, selecionado: boolean): void {
    this.changeOrderFamiliaService.updateGrupo(idFamilia, idGrupao, idGrupo, {
      selecionado,
    });
  }

  ngOnInit(): void {
    this.routerQuery
      .selectParams<string>(RouteParamEnum.idFamilia)
      .pipe(
        takeUntil(this._destroy$),
        filter(id => !!id)
      )
      .subscribe(id => {
        this.idFamilia$.next(id);
      });
    this.grupoes$ = this.idFamilia$.pipe(
      switchMap(idFamilia =>
        this.changeOrderFamiliaQuery.selectEntity(idFamilia).pipe(
          filter(familia => !!familia),
          pluck('grupoes')
        )
      )
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
