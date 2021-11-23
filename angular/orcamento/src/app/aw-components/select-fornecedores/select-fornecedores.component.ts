import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, TrackByFunction } from '@angular/core';
import { Fornecedor, SituacaoFornecedor } from '../../models';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FornecedorService, IFornecedoresFiltros } from '@aw-services/orcamento/fornecedor.service';
import { debounceTime, filter, finalize, map, takeUntil, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { search } from '../aw-utils/aw-search/aw-search.pipe';
import { isNil } from 'lodash-es';
import { trackByFactory } from '@aw-utils/track-by';

export interface SelectFornecedoresOptions {
  situacao: SituacaoFornecedor;
  title: string;
}

export interface SelectFornecedorModel
  extends Pick<
    Fornecedor,
    'idFornecedor' | 'nomeFantasia' | 'favorito' | 'lastCall' | 'idOrcamentoGrupoFornecedor' | 'desativaProposta'
  > {
  cnpj?: string;
}

export type SelectFornecedor = Fornecedor | SelectFornecedorModel;

@Component({
  selector: 'aw-select-fornecedores',
  templateUrl: './select-fornecedores.component.html',
  styleUrls: ['./select-fornecedores.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AwSelectFornecedoresComponent),
      multi: true,
    },
  ],
})
export class AwSelectFornecedoresComponent implements OnInit, ControlValueAccessor, OnDestroy {
  constructor(private fornecedorService: FornecedorService) {}

  private _destroy$ = new Subject<void>();

  optionList: SelectFornecedoresOptions[] = [
    {
      title: 'Homologados no grupo',
      situacao: SituacaoFornecedor.HOMOLOGADO,
    },
    {
      title: 'Homologados na EAP',
      situacao: SituacaoFornecedor.OUTROGRUPO,
    },
    {
      title: 'Cadastro',
      situacao: SituacaoFornecedor.SIMPLESFORNECEDOR,
    },
  ];

  trackBySelectFornecedoresOptions = trackByFactory<SelectFornecedoresOptions>('title');

  originSelectValues: SelectFornecedor[] = [];
  selectValues: SelectFornecedor[] = [];
  selectedValues: SelectFornecedor[] = [];

  selectedOptionSituacao = this.optionList[0].situacao;
  selectedOption = this.optionList[0];
  searchControl = new FormControl();

  search$: Observable<string> = this.searchControl.valueChanges.pipe(debounceTime(500));

  loadingSelect = false;

  situacaoFornecedorEnum = SituacaoFornecedor;

  @Input() disabled: boolean;
  @Input() idGrupo: number;
  @Input() idOrcamento: number;
  @Input() idOrcamentoGrupo: number;

  @Output() selected = new EventEmitter<SelectFornecedor>();
  @Output() removed = new EventEmitter<SelectFornecedor>();

  @Input() isFornecedorDisabled: (fornecedor: SelectFornecedor) => boolean = () => false;

  onChange: any = () => {};
  onTouched: any = () => {};

  trackBy: TrackByFunction<SelectFornecedor> = (_, fornecedor) => fornecedor.idFornecedor;

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.selectedValues = obj;
  }

  initSub(): void {
    this.search$
      .pipe(
        takeUntil(this._destroy$),
        tap(value => {
          if ((!value || value.length < 3) && this.selectedOptionSituacao !== SituacaoFornecedor.HOMOLOGADO) {
            this.selectValues = [];
            this.originSelectValues = [];
          }
          this.selectValues = search(this.originSelectValues, ['nomeFantasia', 'cnpj'], value);
        }),
        filter(value => !!value && ('' + value).length >= 3),
        filter(() => this.selectedOptionSituacao !== SituacaoFornecedor.HOMOLOGADO)
      )
      .subscribe(value => {
        this._searchFornecedores(value);
      });
  }

  onSituacaoChange(option: SelectFornecedoresOptions): void {
    this.selectedOption = option;
    if (option.situacao === SituacaoFornecedor.HOMOLOGADO) {
      this._searchFornecedores();
    } else {
      this.selectValues = [];
      this.originSelectValues = [];
    }
    this.searchControl.enable();
  }

  private _searchFornecedores(busca?: string): void {
    this.loadingSelect = true;
    const params: IFornecedoresFiltros = {
      idGrupo: this.idGrupo,
      idOrcamento: this.idOrcamento,
      idOrcamentoGrupo: this.idOrcamentoGrupo,
      situacao: this.selectedOptionSituacao,
      busca,
    };
    if (!isNil(busca)) {
      params.tipo = /^-?\d*\.?\d+$/.test(busca) ? 'cnpj' : 'nome';
    } else {
      this.loadingSelect = false;
    }
    this.fornecedorService
      .getFornecedores(params)
      .pipe(
        map(fornecedores =>
          fornecedores.map(fornecedor => {
            fornecedor.situacao = this.selectedOptionSituacao;
            return fornecedor;
          })
        ),
        finalize(() => {
          this.loadingSelect = false;
        })
      )
      .subscribe(fornecedores => {
        this.selectValues = this.filterSelected(fornecedores);
        this.originSelectValues = this.filterSelected(fornecedores);
      });
  }

  filterSelected = (fornecedores: SelectFornecedor[]) => {
    return fornecedores.filter(fornecedor => {
      return !this.selectedValues.map(o => o.idFornecedor).includes(fornecedor.idFornecedor);
    });
  };

  drop(event: CdkDragDrop<SelectFornecedor[]>, type: 'select' | 'remove'): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if (type === 'select') {
        this.selected.emit(this.selectValues[event.previousIndex]);
      } else {
        this.removed.emit(this.selectedValues[event.previousIndex]);
        const selected = [...this.selectedValues];
        selected[event.previousIndex] = {
          ...selected[event.previousIndex],
          idOrcamentoGrupoFornecedor: 0,
        };
        this.selectedValues = selected;
      }
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.onChange(this.selectedValues);
  }

  ngOnInit(): void {
    this.initSub();
    this._searchFornecedores();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
