import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Estado } from '@aw-models/enderecos/estado';
import { Cidade } from '@aw-models/enderecos/cidade';
import { EnderecosQuery } from '@aw-services/enderecos/enderecos.query';
import { EnderecosService } from '@aw-services/enderecos/enderecos.service';
import { filterNilValue } from '@datorama/akita';
import { trackByFactory } from '@aw-utils/track-by';
import { Pais } from '@aw-models/enderecos/pais';
import { MaskEnum } from '@aw-models/mask.enum';
import { isEqual } from 'lodash-es';

let uid = 1;

export interface CnEnderecoObraForm {
  cep: string;
  endereco: string;
  complemento: string;
  bairro: string;
  idCidade: number;
  idEstado: number;
  idPais: number;
  cidade: string;
}

@Component({
  selector: 'app-cn-endereco-obra-form',
  templateUrl: './cn-endereco-obra-form.component.html',
  styleUrls: ['./cn-endereco-obra-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnEnderecoObraFormComponent implements OnInit, OnDestroy {
  constructor(
    private enderecosService: EnderecosService,
    private enderecosQuery: EnderecosQuery,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private readonly _destroy$ = new Subject<void>();

  private _endereco: CnEnderecoObraForm;

  @Input() titulo: string;

  @Input()
  set endereco(endereco: CnEnderecoObraForm) {
    this._endereco = endereco;
    if (this.form) {
      this.form.setValue(this._endereco);
    }
  }

  @Output() readonly enderecoChange = new EventEmitter<CnEnderecoObraForm>();

  get idCidadeControl(): FormControl {
    return this.form.get('idCidade') as FormControl;
  }

  get idEstadoControl(): FormControl {
    return this.form.get('idEstado') as FormControl;
  }

  get idPaisControl(): FormControl {
    return this.form.get('idPais') as FormControl;
  }

  get cidadeControl(): FormControl {
    return this.form.get('cidade') as FormControl;
  }

  readonly maskEnum = MaskEnum;
  readonly uid = 'cn-endereco-obra-form-' + uid++;

  form: FormGroup;

  idPais$: Observable<number | null | undefined>;
  idEstado$: Observable<number | null | undefined>;

  readonly paises$ = this.enderecosQuery.paises$;
  estados$: Observable<Estado[]>;
  cidades$: Observable<Cidade[]>;

  loadingEstados = false;
  loadingCidades = false;

  trackByPais = trackByFactory<Pais>('idPais');
  trackByEstado = trackByFactory<Estado>('idEstado');
  trackByCidade = trackByFactory<Cidade>('idCidade');

  ngOnInit(): void {
    this.form = new FormGroup({
      cep: new FormControl(this._endereco.cep, [Validators.required]),
      endereco: new FormControl(this._endereco.endereco, [Validators.required]),
      complemento: new FormControl(this._endereco.complemento),
      bairro: new FormControl(this._endereco.bairro, [Validators.required]),
      idCidade: new FormControl({ value: this._endereco.idCidade, disabled: !this._endereco.idCidade }, [
        Validators.required,
      ]),
      idEstado: new FormControl({ value: this._endereco.idEstado, disabled: !this._endereco.idEstado }, [
        Validators.required,
      ]),
      idPais: new FormControl(this._endereco.idPais, [Validators.required]),
      cidade: new FormControl(this._endereco.cidade),
    });
    this.idPais$ = this.idPaisControl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(idPais => {
        if (idPais) {
          this.idEstadoControl.enable();
        } else {
          this.idEstadoControl.disable();
        }
      })
    );
    this.idEstado$ = this.idEstadoControl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(idEstado => {
        if (idEstado) {
          this.idCidadeControl.enable();
        } else {
          this.idCidadeControl.disable();
        }
      })
    );
    this.estados$ = this.idPais$.pipe(
      startWith(this.idPaisControl.value),
      filterNilValue(),
      debounceTime(50),
      switchMap(idPais => {
        this.loadingEstados = true;
        this.changeDetectorRef.markForCheck();
        return this.enderecosService.getEstados(idPais).pipe(
          finalize(() => {
            this.loadingEstados = false;
            this.changeDetectorRef.markForCheck();
          }),
          tap(estados => {
            const idEstado = this.idEstadoControl.value;
            if (idEstado) {
              if (!estados.some(estado => estado.idEstado === idEstado)) {
                this.idEstadoControl.setValue(null);
              }
            }
          })
        );
      })
    );
    this.cidades$ = this.idEstado$.pipe(
      startWith(this.idEstadoControl.value),
      filterNilValue(),
      debounceTime(50),
      switchMap(idEstado => {
        this.loadingCidades = true;
        this.changeDetectorRef.markForCheck();
        return this.enderecosService.getCidades(idEstado).pipe(
          finalize(() => {
            this.loadingCidades = false;
            this.changeDetectorRef.markForCheck();
          }),
          tap(cidades => {
            const idCidade = this.idCidadeControl.value;
            if (idCidade) {
              if (!cidades.some(cidade => cidade.idCidade === idCidade)) {
                this.idCidadeControl.setValue(null);
              }
            }
          })
        );
      })
    );
    this.idCidadeControl.valueChanges.pipe(takeUntil(this._destroy$), filterNilValue()).subscribe(idCidade => {
      const cidade = this.enderecosQuery.getCidadeById(idCidade);
      if (cidade) {
        this.cidadeControl.setValue(cidade.nome);
      }
    });
    this.form.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(250),
        distinctUntilChanged((valueA, valueB) => isEqual(valueA, valueB))
      )
      .subscribe(() => {
        this.enderecoChange.emit(this.form.getRawValue());
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
