import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FichaService } from '../service/ficha.service';
import { FormBuilder } from '@angular/forms';
import { ControleFicha, ControleFichaGrupo } from '../models/fichas';
import { Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { uniqBy } from 'lodash-es';
import { AwFilterPipeProperties } from '@aw-components/aw-filter/aw-filter.pipe';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ActivatedRoute } from '@angular/router';
import { refreshMap } from '@aw-utils/rxjs/operators';

@Component({
  selector: 'app-header-controle-fichas',
  templateUrl: './header-controle-fichas.component.html',
  styleUrls: ['./header-controle-fichas.component.scss'],
})
export class HeaderControleFichasComponent implements OnInit, OnDestroy {
  constructor(
    public fichaService: FichaService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {}

  private _destroy$ = new Subject<void>();

  @Output() filterChange = new EventEmitter<AwFilterPipeProperties<ControleFicha>>();

  bsConfig: Partial<BsDatepickerConfig> = { isAnimated: true, containerClass: 'theme-primary', adaptivePosition: true };

  formFilters = this.formBuilder.group({
    idOrcamentoCenario: +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario),
    idCompraNegociacaoGrupo: null,
    idCompraNegociacaoGrupoFichaTipo: null,
    dataInicio: null,
    dataFim: null,
    idCompraNegociacaoStatus: null,
  });

  loadingGrupos = false;
  grupos$: Observable<ControleFichaGrupo[]> = this.formFilters.get('idOrcamentoCenario').valueChanges.pipe(
    startWith(+this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario)),
    filter(idOrcamentoCenario => !!idOrcamentoCenario),
    distinctUntilChanged(),
    refreshMap(idOrcamentoCenario => this.fichaService.getListaFichas(idOrcamentoCenario)),
    switchMap(id => {
      this.loadingGrupos = true;
      return this.fichaService.getGrupos(id).pipe(
        finalize(() => {
          this.loadingGrupos = false;
        })
      );
    }),
    shareReplay()
  );

  gruposTipos$ = this.fichaService.body$.pipe(
    map(grupos => {
      return uniqBy(
        grupos.reduce((acc, tmp) => {
          return [...acc, ...tmp.tipos];
        }, []),
        'idCompraNegociacaoGrupoFichaTipo'
      );
    })
  );

  ngOnInit(): void {
    this.formFilters.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        map(formValue => {
          return Object.entries(formValue)
            .filter(([_, value]) => !!value)
            .reduce((acc, [key, value]) => {
              switch (key) {
                case 'idCompraNegociacaoGrupoFichaTipo': {
                  acc.tipos = {
                    type: 'array',
                    filterType: 'conditional',
                    conditional: { term: value, condition: 'some', key },
                  };
                  break;
                }
                case 'idCompraNegociacaoGrupo': {
                  acc[key] = { type: 'number', filterType: 'filter', term: value };
                  break;
                }
                case 'dataInicio': {
                  if (acc.data) {
                    acc.data = {
                      type: 'date',
                      filterType: 'conditional',
                      conditional: { term: value, condition: 'entre', term2: acc.data.conditional.term },
                    };
                  } else {
                    acc.data = {
                      type: 'date',
                      filterType: 'conditional',
                      conditional: { term: value, condition: 'maior' },
                    };
                  }

                  break;
                }
                case 'dataFim': {
                  if (acc.data) {
                    acc.data = {
                      type: 'date',
                      filterType: 'conditional',
                      conditional: { term: acc.data.conditional.term, condition: 'entre', term2: value },
                    };
                  } else {
                    acc.data = {
                      type: 'date',
                      filterType: 'conditional',
                      conditional: { term: value, condition: 'menor' },
                    };
                  }
                  break;
                }
                case 'idCompraNegociacaoStatus': {
                  acc[key] = {
                    type: 'number',
                    filterType: 'conditional',
                    conditional: { term: value, condition: 'igual' },
                  };
                  break;
                }
              }
              return acc;
            }, {} as AwFilterPipeProperties<ControleFicha>);
        })
      )
      .subscribe(filters => {
        this.filterChange.emit(filters);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
