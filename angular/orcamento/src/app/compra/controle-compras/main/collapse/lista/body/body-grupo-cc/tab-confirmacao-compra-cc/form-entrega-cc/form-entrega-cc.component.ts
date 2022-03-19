import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SkipSelf,
} from '@angular/core';
import { ControlContainer, FormControl, FormGroup } from '@angular/forms';
import { MaskEnum } from '@aw-models/mask.enum';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, finalize, pluck, switchMap, tap } from 'rxjs/operators';
import { EnderecosQuery } from '@aw-services/enderecos/enderecos.query';
import { EnderecosService } from '@aw-services/enderecos/enderecos.service';
import { refreshMap } from '@aw-utils/rxjs/operators';
import { Estado } from '@aw-models/enderecos/estado';
import { Cidade } from '@aw-models/enderecos/cidade';
import { awSelectComparatorFactory } from '@aw-components/aw-select/aw-select.config';
import { Pais } from '@aw-models/enderecos/pais';

@Component({
  selector: 'app-form-entrega-cc',
  templateUrl: './form-entrega-cc.component.html',
  styleUrls: ['./form-entrega-cc.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: (container: ControlContainer) => container,
      deps: [[new SkipSelf(), ControlContainer]],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormEntregaCcComponent implements OnInit, OnDestroy {
  constructor(
    private controlContainer: ControlContainer,
    public enderecosQuery: EnderecosQuery,
    private enderecosService: EnderecosService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private formGroup: FormGroup;

  private _destroy$ = new Subject<void>();

  private hasLoaded = false;

  @Input() titulo: string;
  @Input() observacao: boolean;
  @Input() tipo: string;

  @Input()
  set loading(loading: boolean) {
    if (!loading && !this.hasLoaded) {
      this.hasLoaded = true;
      this.initSub();
    }
  }

  comparatorPais = awSelectComparatorFactory<Pais>('idPais');
  comparatorEstado = awSelectComparatorFactory<Estado>('idEstado');
  comparatorCidade = awSelectComparatorFactory<Cidade>('idCidade');

  estados$: Observable<Estado[]>;
  cidades$: Observable<Cidade[]>;
  estados: Estado[] = [];
  cidades: Cidade[] = [];

  estadoLoading = false;
  cidadeLoading = false;

  maskEnum = MaskEnum;

  preencherEnderecoAw(): void {
    this.formGroup.patchValue({
      endereco: 'PRAÇA JOÃO DURAN ALONSO, 34',
      complemento: '13 ANDAR',
      cep: '04571070',
      bairro: 'Cidade Monções',
    });
    const { cidade, estado, pais } = EnderecosService.enderecoAw;
    this.formGroup.get('pais').setValue(pais);
    this.formGroup.get('uf').setValue(estado);
    this.formGroup.get('cidade').setValue(cidade);
  }

  initSub(): void {
    this.formGroup = this.controlContainer.control as FormGroup;
    const paisControl = this.formGroup.get('pais') as FormControl;
    const estadoControl = this.formGroup.get('uf') as FormControl;
    const cidadeControl = this.formGroup.get('cidade') as FormControl;
    this.estados$ = paisControl.valueChanges.pipe(
      filter(pais => !!pais),
      pluck('idPais'),
      distinctUntilChanged(),
      tap(() => {
        estadoControl.setValue(null);
        estadoControl.enable();
        cidadeControl.setValue(null);
        cidadeControl.disable();
        this.estados = [];
        this.cidades = [];
        this.changeDetectorRef.markForCheck();
      }),
      refreshMap(idPais => this.getEstados(idPais)),
      switchMap(idPais => this.enderecosQuery.selectEstadosByPais(idPais))
    );
    this.cidades$ = estadoControl.valueChanges.pipe(
      filter(estado => !!estado),
      pluck('idEstado'),
      distinctUntilChanged(),
      tap(() => {
        cidadeControl.setValue(null);
        cidadeControl.enable();
        this.cidades = [];
        this.changeDetectorRef.markForCheck();
      }),
      refreshMap(idEstado => this.getCidades(idEstado)),
      switchMap(idEstado => this.enderecosQuery.selectCidadesByEstado(idEstado))
    );
    if (paisControl.value?.idPais) {
      this.getEstados(paisControl.value.idPais).subscribe(estados => {
        this.estados = estados;
        this.changeDetectorRef.markForCheck();
      });
    }
    if (estadoControl.value?.idEstado) {
      this.getCidades(estadoControl.value?.idEstado).subscribe(cidades => {
        this.cidades = cidades;
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  private getEstados(idPais: number): Observable<Estado[]> {
    this.estadoLoading = true;
    return this.enderecosService.getEstados(idPais).pipe(
      finalize(() => {
        this.estadoLoading = false;
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  private getCidades(idEstado: number): Observable<Cidade[]> {
    this.cidadeLoading = true;
    return this.enderecosService.getCidades(idEstado).pipe(
      finalize(() => {
        this.cidadeLoading = false;
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
