import { AfterViewInit, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { Datas, Orcamento } from '../../../../models';
import { ActivatedRoute, Router } from '@angular/router';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs';
import { dateValidator } from '@aw-shared/validators/date.validator';
import { isBefore } from 'date-fns';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Component({
  selector: 'app-tab-datas',
  templateUrl: './tab-datas.component.html',
  styleUrls: ['./tab-datas.component.scss'],
})
export class TabDatasComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    public orcamentoService: OrcamentoService,
    private router: Router
  ) {}

  private _destroy$ = new Subject<void>();
  private startValidation = false;

  @HostBinding('class.tab-pane') tab = true;

  bsConfig: Partial<BsDatepickerConfig> = {
    isAnimated: true,
    containerClass: 'theme-primary',
    dateInputFormat: 'DD/MM/YYYY [às] HH:mm',
  };

  orcamento: Orcamento = this.orcamentoService.orcamento$.value;
  datasForm: FormGroup;

  get idOrcamento(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  }

  get idOrcamentoCenario(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  }

  @HostBinding('class.active')
  get url(): boolean {
    return this.router.url.includes('');
  }

  initSub(): void {
    const dataRecebimentoTodosCustosControl = this.datasForm.get('dataRecebimentoTodosCustos');
    const dataLimiteAprovacaoCeoControl = this.datasForm.get('dataLimiteAprovacaoCeo');
    const dataLimiteApresentacaoClienteControl = this.datasForm.get('dataLimiteApresentacaoCliente');
    dataRecebimentoTodosCustosControl.valueChanges
      .pipe(takeUntil(this._destroy$), distinctUntilChanged())
      .subscribe(data => {
        const dataLimiteAprovacao = dataLimiteAprovacaoCeoControl.value;
        if (!data || (dataLimiteAprovacao && dataLimiteAprovacao < data)) {
          dataLimiteAprovacaoCeoControl.setValue(null);
          dataLimiteApresentacaoClienteControl.setValue(null);
          dataLimiteApresentacaoClienteControl.disable();
          dataLimiteAprovacaoCeoControl[data ? 'enable' : 'disable']();
        } else {
          dataLimiteAprovacaoCeoControl.enable({ emitEvent: false });
        }
      });
    dataLimiteAprovacaoCeoControl.valueChanges
      .pipe(takeUntil(this._destroy$), distinctUntilChanged())
      .subscribe(data => {
        const dataLimiteApresentacaoCliente = dataLimiteApresentacaoClienteControl.value;
        const dataRecebimentoTodosCustos = dataRecebimentoTodosCustosControl.value;
        if (!data || (dataLimiteApresentacaoCliente && dataLimiteApresentacaoCliente < data)) {
          dataLimiteApresentacaoClienteControl.setValue(null);
          dataLimiteApresentacaoClienteControl[data ? 'enable' : 'disable']();
        } else {
          if (isBefore(data, dataRecebimentoTodosCustos)) {
            dataLimiteAprovacaoCeoControl.setValue(dataRecebimentoTodosCustos);
          }
          dataLimiteApresentacaoClienteControl.enable({ emitEvent: false });
        }
      });
    dataLimiteApresentacaoClienteControl.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        distinctUntilChanged(),
        filter(data => !!data)
      )
      .subscribe(data => {
        const dataLimiteAprovacaoCeo = dataLimiteAprovacaoCeoControl.value;
        if (isBefore(data, dataLimiteAprovacaoCeo)) {
          dataLimiteApresentacaoClienteControl.setValue(dataLimiteAprovacaoCeo);
        }
      });
  }

  createForm(): void {
    let { dataLimiteApresentacaoCliente, dataLimiteAprovacaoCeo, dataRecebimentoTodosCustos }: Datas =
      this.orcamento.datas;
    dataLimiteApresentacaoCliente = dataLimiteApresentacaoCliente ? new Date(dataLimiteApresentacaoCliente) : null;
    dataLimiteAprovacaoCeo = dataLimiteAprovacaoCeo ? new Date(dataLimiteAprovacaoCeo) : null;
    dataRecebimentoTodosCustos = dataRecebimentoTodosCustos ? new Date(dataRecebimentoTodosCustos) : null;
    this.datasForm = this.formBuilder.group({
      dataRecebimentoTodosCustos: this.formBuilder.control(dataRecebimentoTodosCustos, [dateValidator]),
      dataLimiteAprovacaoCeo: this.formBuilder.control(
        {
          value: dataLimiteAprovacaoCeo,
          disabled: !dataRecebimentoTodosCustos,
        },
        [dateValidator, this.dataLimiteAprovacaoCeoValidator.bind(this)]
      ),
      dataLimiteApresentacaoCliente: this.formBuilder.control(
        {
          value: dataLimiteApresentacaoCliente,
          disabled: !dataLimiteAprovacaoCeo,
        },
        [dateValidator, this.dataLimiteApresentacaoClienteValidator.bind(this)]
      ),
    });
  }

  dataLimiteAprovacaoCeoValidator({ value, parent }: AbstractControl): ValidationErrors | null {
    if (!this.startValidation) return;
    if (!value) return null;
    const dataRecebimentoTodosCustos = parent?.get('dataRecebimentoTodosCustos').value;
    if (isBefore(value, dataRecebimentoTodosCustos)) {
      return { minDate: true };
    } else {
      return null;
    }
  }

  dataLimiteApresentacaoClienteValidator({ value, parent }: AbstractControl): ValidationErrors | null {
    if (!this.startValidation) return;
    if (!value) return null;
    const dataLimiteAprovacaoCeo = parent?.get('dataLimiteAprovacaoCeo').value;
    if (isBefore(value, dataLimiteAprovacaoCeo)) {
      return { minDate: true };
    } else {
      return null;
    }
  }

  saveDatas(): void {
    const { valid, value } = this.datasForm;
    if (valid && Object.values<Datas>(value).length) {
      this.orcamentoService
        .saveDatas(value, this.idOrcamento)
        .pipe(switchMap(() => this.orcamentoService.refreshOrcamento(this.idOrcamento, this.idOrcamentoCenario)))
        .subscribe();
    }
  }

  ngOnInit(): void {
    this.createForm();
    this.initSub();
  }

  ngOnDestroy(): void {
    this.saveDatas();
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.startValidation = true;
    });
  }
}
