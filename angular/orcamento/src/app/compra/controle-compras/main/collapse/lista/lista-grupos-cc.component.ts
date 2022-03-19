import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CcGrupoQuery } from '../../../state/grupos/cc-grupo.query';
import { CnGrupo, CnTipoGrupoEnum } from '../../../../models/cn-grupo';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { ControleComprasQuery } from '../../../state/controle-compras/controle-compras.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { BodyHeaderGrupoCcComponent } from './body-header-grupo-cc/body-header-grupo-cc.component';
import { switchMap } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-lista-grupos-cc',
  templateUrl: './lista-grupos-cc.component.html',
  styleUrls: ['./lista-grupos-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaGruposCcComponent implements OnInit, AfterViewInit {
  constructor(
    public ccGruposQuery: CcGrupoQuery,
    private controleComprasQuery: ControleComprasQuery,
    private routerQuery: RouterQuery
  ) {}

  @ViewChildren('grupos') gruposRef: QueryList<BodyHeaderGrupoCcComponent>;

  @Input()
  set tipo(tipo: CnTipoGrupoEnum) {
    this.tipo$.next(tipo);
  }

  tipo$ = new BehaviorSubject<CnTipoGrupoEnum>(CnTipoGrupoEnum.Direto);
  sort$ = this.tipo$.pipe(switchMap(tipo => this.controleComprasQuery.selectSort(tipo)));
  grupos$: Observable<CnGrupo[]>;

  trackBy = trackByFactory<CnGrupo>('idCompraNegociacaoGrupo');

  ngOnInit(): void {
    const filter$ = this.tipo$.pipe(switchMap(tipo => this.controleComprasQuery.selectFilterByTipo(tipo)));
    const filterGrupos$ = this.controleComprasQuery.listaFilterGrupos$;
    this.grupos$ = combineLatest([this.sort$, filter$, filterGrupos$, this.tipo$]).pipe(
      switchMap(([sort, filter, filterGrupos, tipo]) =>
        this.ccGruposQuery.selectGruposFilterAndGroup(tipo, sort, filter, filterGrupos)
      )
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const idCompraNegociacaoGrupo = +this.routerQuery.getQueryParams<string>(RouteParamEnum.idCompraNegociacaoGrupo);
      if (idCompraNegociacaoGrupo) {
        const component = this.gruposRef.find(o => o.grupo.idCompraNegociacaoGrupo === idCompraNegociacaoGrupo);
        component?.scrollIntoView();
      }
    }, 500);
  }
}
