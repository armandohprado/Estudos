import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CnGrupo } from '../../models/cn-grupo';
import { StateComponent } from '@aw-shared/components/common/state-component';
import { filterNilValue } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { isEstouroBudgetFromValue } from '../util';
import { CnFornecedor } from '../../models/cn-fornecedor';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { awSelectComparatorFactory } from '@aw-components/aw-select/aw-select.config';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { CnTipoFicha } from '../../models/cn-tipo-ficha';

interface CnFichaFormComponentState {
  grupo?: CnGrupo;
  validarEstouroBudget: boolean;
  valorSelecionado: number;
}

interface CnFichaForm {
  detalhe: string;
  fornecedor: CnFornecedor;
  origemEstouro: number;
}

@Component({
  selector: 'app-cn-ficha-form',
  templateUrl: './cn-ficha-form.component.html',
  styleUrls: ['./cn-ficha-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnFichaFormComponent extends StateComponent<CnFichaFormComponentState> implements OnInit, OnChanges {
  static ngAcceptInputType_readonly: BooleanInput;

  constructor() {
    super(
      { validarEstouroBudget: true, valorSelecionado: 0 },
      { inputs: ['grupo', 'validarEstouroBudget', 'valorSelecionado'] }
    );
  }

  private _readonly = false;
  private _grupo$ = this.selectState('grupo').pipe(filterNilValue());
  private _validarEstouroBudget$ = this.selectState('validarEstouroBudget');
  private _valorSelecionado$ = this.selectState('valorSelecionado');
  isEstouroBudget$ = combineLatest([this._grupo$, this._validarEstouroBudget$, this._valorSelecionado$]).pipe(
    map(
      ([grupo, validarEstouroBudget, valorSelecionado]) =>
        validarEstouroBudget && isEstouroBudgetFromValue(grupo.valorUtilizado, valorSelecionado)
    )
  );

  formFicha = new FormGroup({
    detalhe: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    fornecedor: new FormControl(),
    origemEstouro: new FormControl(),
    nomeOrigemEstouro: new FormControl(),
  });

  comparatorFornecedor = awSelectComparatorFactory<CnFornecedor>('idFornecedor');

  get detalheControl(): FormControl {
    return this.formFicha.get('detalhe') as FormControl;
  }
  get fornecedorControl(): FormControl {
    return this.formFicha.get('fornecedor') as FormControl;
  }
  get origemEstouroControl(): FormControl {
    return this.formFicha.get('origemEstouro') as FormControl;
  }
  get nomeOrigemEstouroControl(): FormControl {
    return this.formFicha.get('nomeOrigemEstouro') as FormControl;
  }

  // State inputs
  @Input() grupo: CnGrupo;
  @Input() validarEstouroBudget = true;
  @Input() mostrarComboOrigemEstouro = true;
  @Input() labelComboOrigemEstouro: string = 'Origem do estouro';
  @Input() valorSelecionado: number;

  // Data inputs
  @Input() fornecedoresSelecionados: CnFornecedor[] = [];
  @Input() origemCompraLista: CnTipoFicha[] = [];

  // Form inputs
  @Input()
  set form(form: Partial<CnFichaForm>) {
    this.formFicha.patchValue(form, { emitEvent: false });
  }

  @Input()
  set detalhe(detalhe: string) {
    this.detalheControl.setValue(detalhe, { emitEvent: false });
  }

  @Input()
  set fornecedor(fornecedor: CnFornecedor) {
    this.fornecedorControl.setValue(fornecedor, { emitEvent: false });
  }

  @Input()
  set origemEstouro(origemEstouro: number) {
    this.origemEstouroControl.setValue(origemEstouro, { emitEvent: false });
    this.nomeOrigemEstouroControl.setValue(
      this.origemCompraLista.find(origem => origem.idTipoFicha === origemEstouro)?.descricao,
      { emitEvent: false }
    );
  }

  @Output() readonly formChange = new EventEmitter<CnFichaForm>();
  @Output() readonly detalheChange = new EventEmitter<string>();
  @Output() readonly fornecedorChange = new EventEmitter<CnFornecedor>();
  @Output() readonly filesChange = new EventEmitter<FileList>();
  @Output() readonly origemEstouroChange = new EventEmitter<number>();
  @Output() readonly nomeOrigemEstouroChange = new EventEmitter<string>();

  @Input()
  set readonly(readonly: boolean) {
    this._readonly = coerceBooleanProperty(readonly);
    if (this._readonly) {
      this.formFicha.disable();
    } else {
      this.formFicha.enable();
    }
  }
  get readonly(): boolean {
    return this._readonly;
  }

  private _listenToChanges<T>(control: AbstractControl, output: EventEmitter<T>): void {
    control.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(value => {
      output.emit(value);
    });
  }

  onSelectOrigemEstouro(origem: CnTipoFicha): void {
    this.nomeOrigemEstouroControl.setValue(origem.descricao, { emitEvent: false });
    this.nomeOrigemEstouroChange.emit(origem.descricao);
  }

  ngOnInit(): void {
    this._listenToChanges(this.detalheControl, this.detalheChange);
    this._listenToChanges(this.fornecedorControl, this.fornecedorChange);
    this._listenToChanges(this.origemEstouroControl, this.origemEstouroChange);
    this._listenToChanges(this.formFicha, this.formChange);
  }

  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    const origemCompraListaChange = changes.origemCompraLista;
    if (origemCompraListaChange?.currentValue?.length && this.origemEstouroControl.value) {
      this.origemEstouro = this.origemEstouroControl.value;
    }
  }
}
