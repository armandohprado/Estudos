import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { InclusaoGrupoItem, OrcamentoGrupoItemQuantitativo } from '../model/inclusao-grupo-item';
import { DefinicaoEscopoService } from '../definicao-escopo.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { debounceTime, delay, filter, finalize, map, pluck, takeUntil, tap } from 'rxjs/operators';
import { UnidadeMedida } from '@aw-models/unidade-medida';
import { UnidadeMedidaService } from '@aw-services/unidade-medida/unidade-medida.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Quantitativo } from '../shared/de-distribuir-quantitativo/model/quantitativo';
import { AtualizacaoCentroCustoEvent } from '../shared/de-distribuir-quantitativo/model/atualizacao-centro-custo-event';
import { isNil } from 'lodash-es';
import { Select, Store } from '@ngxs/store';
import { IncluirGrupoItemApi } from '../state/actions/incluir-grupo-item-api';
import { DefinicaoEscopoModeEnum } from '../state/definicao-escopo.model';
import { GrupoItemDE } from '../model/grupo-item';
import { ErrorApi } from '../model/error-api';
import { DefinicaoEscopoState } from '../state/definicao-escopo.state';
import { CentroCusto } from '../shared/de-distribuir-quantitativo/model/centro-custo';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-de-grupo-item-inserir',
  templateUrl: './de-grupo-item-inserir.component.html',
  styleUrls: [
    './de-grupo-item-inserir.component.scss',
    '../de-grupo-item/de-grupo-item.component.scss',
    '../de-grupo-item/de-grupo-item-content/de-grupo-item-content.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeGrupoItemInserirComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private definicaoEscopoService: DefinicaoEscopoService,
    private formBuilder: FormBuilder,
    private unidadeMedidasService: UnidadeMedidaService,
    private store: Store,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private _destroy$ = new Subject<void>();

  @ViewChild('tabset') tabset: TabsetComponent;

  private _grupoItem$: BehaviorSubject<InclusaoGrupoItem>;
  grupoItem$: Observable<InclusaoGrupoItem>;
  qtdeTotal$: Observable<number>;

  formGrupoItem: FormGroup;

  UMList$: Observable<UnidadeMedida[]>;
  UMLoading = false;
  quantitativo$: Observable<Quantitativo>;
  total$: Observable<number>;

  novaNumeracao: string;

  @Select(DefinicaoEscopoState.getErrorApi)
  errorApi$: Observable<ErrorApi>;

  @Input() gruposItens: GrupoItemDE[];
  @Input() idOrcamento: number;

  trackByUM = trackByFactory<UnidadeMedida>('idUnidadeMedida');

  tentarNovamente(call: (...args: any[]) => any, args: any[]): void {
    call(...args);
  }

  tagValidator({ value }: AbstractControl): ValidationErrors | null {
    if (!this.gruposItens || !this.gruposItens.length || !value) {
      return null;
    }
    const invalid = this.gruposItens.filter(({ ativo }) => ativo).some(({ tag }) => tag === value);
    return invalid ? { invalidTag: true } : null;
  }

  updateGrupoItem(grupoItem: Partial<InclusaoGrupoItem>): void {
    this._grupoItem$.next({ ...this._grupoItem$.value, ...grupoItem });
  }

  handleGenericFactory(property: keyof InclusaoGrupoItem): (value: any) => any {
    return (value: any) => this.updateGrupoItem({ [property]: value });
  }

  initSub(): void {
    const withDebounce = (name: string) =>
      this.formGrupoItem.get(name).valueChanges.pipe(takeUntil(this._destroy$), debounceTime(400));

    withDebounce('complemento').subscribe(this.handleGenericFactory('complemento'));
    withDebounce('tag').subscribe(this.handleGenericFactory('tag'));
    withDebounce('UM')
      .pipe(
        filter(value => !isNil(value)),
        tap((UM: UnidadeMedida) => this.updateGrupoItem({ UM })),
        pluck('idUnidadeMedida')
      )
      .subscribe(this.handleGenericFactory('idUnidade'));
    withDebounce('descricao').subscribe(this.handleGenericFactory('descricaoGrupoItem'));
    withDebounce('valorServico')
      .pipe(map(value => +value))
      .subscribe(this.handleGenericFactory('valorUnitarioServicoReferencia'));
    withDebounce('valorProduto')
      .pipe(map(value => +value))
      .subscribe(this.handleGenericFactory('valorUnitarioProdutoReferencia'));
    const getValor = (name: string) => this.formGrupoItem.get(name).valueChanges.pipe(map(value => +value));
    this.total$ = combineLatest([this.qtdeTotal$, getValor('valorServico'), getValor('valorServico')]).pipe(
      map(([qtde, produto, servico]) => (produto + servico) * qtde)
    );
  }

  nextTab(): void {
    const index = this.tabset.tabs.findIndex(o => o.active);
    this.tabset.tabs.map((o, i) => {
      o.active = i === index + 1;
    });
  }

  newCentroCusto({ centroCusto, newQtde }: AtualizacaoCentroCustoEvent): void {
    const comparator = (a: OrcamentoGrupoItemQuantitativo, b: CentroCusto) =>
      a.idFase === b.idFase &&
      a.idProjetoCentroCusto === b.idProjetoCentroCusto &&
      a.idProjetoEdificioPavimento === b.idProjetoEdificioPavimento;
    let state = { ...this._grupoItem$.value };
    state = {
      ...state,
      orcamentoGrupoItemQuantitativo: state.orcamentoGrupoItemQuantitativo.filter(cc => !comparator(cc, centroCusto)),
    };
    if (newQtde !== null) {
      state = {
        ...state,
        orcamentoGrupoItemQuantitativo: [
          ...state.orcamentoGrupoItemQuantitativo,
          {
            dataCadastro: new Date().toISOString(),
            idFase: centroCusto.idFase,
            idOrcamentoGrupoItem: centroCusto.idOrcamentoGrupoItem,
            idOrcamentoGrupoItemQuantitativo: centroCusto.idOrcamentoGrupoItemQuantitativo,
            idProjetoCentroCusto: centroCusto.idProjetoCentroCusto,
            idProjetoEdificioPavimento: centroCusto.idProjetoEdificioPavimento,
            quantidade: newQtde,
          },
        ],
      };
    }
    this._grupoItem$.next(state);
  }

  updateQtdeTotal($event: number): void {
    this.updateGrupoItem({ quantidadeTotal: $event });
  }

  save(): void {
    if (this.formGrupoItem.invalid) return;
    const newGrupoItem = this._grupoItem$.value;
    this.store.dispatch(new IncluirGrupoItemApi(newGrupoItem)).subscribe(() => {
      this.close();
    });
  }

  close(): void {
    this.definicaoEscopoService.setErrorApi(null);
    this.definicaoEscopoService.setMode(DefinicaoEscopoModeEnum.lista);
  }

  setForm(): void {
    this.formGrupoItem = this.formBuilder.group({
      tag: ['', [this.tagValidator.bind(this)]],
      UM: [null, [Validators.required]],
      complemento: ['', []],
      descricao: ['', [Validators.required]],
      valorServico: [0, [Validators.required]],
      valorProduto: [0, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.UMLoading = true;
    this.UMList$ = this.unidadeMedidasService.getUnidadeMedidas().pipe(finalize(() => (this.UMLoading = false)));
    this.quantitativo$ = this.definicaoEscopoService.getQuantitativoNovo(this.idOrcamento);
    this.definicaoEscopoService
      .getProximaNumeracao(this.definicaoEscopoService.grupo.idOrcamentoGrupo)
      .subscribe(numero => {
        this.novaNumeracao = numero;
        this.updateGrupoItem({ numeracaoGrupoItem: numero });
        this.changeDetectorRef.markForCheck();
      });
    this._grupoItem$ = new BehaviorSubject<InclusaoGrupoItem>({
      idOrcamentoGrupoItemPai: 0,
      idOrcamentoGrupoItem: 0,
      idGrupo: this.definicaoEscopoService.grupo.idGrupo,
      idOrcamentoGrupo: this.definicaoEscopoService.grupo.idOrcamentoGrupo,
      valorUnitarioProdutoReferencia: 0,
      valorUnitarioServicoReferencia: 0,
      tag: '',
      orcamentoGrupoItemQuantitativo: [],
      numeracaoGrupoItem: null,
      idUnidade: null,
      descricaoGrupoItem: '',
      complemento: '',
      quantidadeTotal: 0,
      UM: null,
    });
    this.setForm();
    this.grupoItem$ = this._grupoItem$.asObservable().pipe(delay(0));
    this.qtdeTotal$ = this.grupoItem$.pipe(map(o => o.quantidadeTotal));
    this.initSub();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.formGrupoItem.enable();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
