import { AfterViewInit, Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { finalize, takeUntil } from 'rxjs/operators';
import '../../../../shared/@ckeditor/translations/pt-br';
import ClassicEditor from '../../../../shared/@ckeditor/ckeditor';
import { CKEditor5 } from '@ckeditor/ckeditor5-angular';
import { ckEditorConfig } from '@aw-shared/@ckeditor/ckeditorConfig';
import { ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import { GrupoAlt, ResponsavelAlt } from '../../../../models';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Component({
  selector: 'app-envio-cotacao-contato-datas',
  templateUrl: './envio-cotacao-contato-datas.component.html',
  styleUrls: ['./envio-cotacao-contato-datas.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EnvioCotacaoContatoDatasComponent),
      multi: true,
    },
  ],
})
export class EnvioCotacaoContatoDatasComponent implements OnInit, ControlValueAccessor, OnDestroy, AfterViewInit {
  constructor(
    private envioDeCotacao: EnvioDeCotacaoService,
    private formBuilder: FormBuilder,
    private projetoService: ProjetoService
  ) {}

  private readonly _destroy$ = new Subject<void>();

  @Input() idOrcamento: number;
  @Input() grupo: GrupoAlt;
  @Input() contatos: ResponsavelAlt[] = [];
  @Output() changeStep = new EventEmitter();

  @Output() contatoSelected = new EventEmitter<ResponsavelAlt>();

  readonly Editor: any = ClassicEditor;
  readonly ckEditorConfig: CKEditor5.Config = ckEditorConfig;
  readonly baseBsConfig: Partial<BsDatepickerConfig> = {
    isAnimated: true,
    containerClass: 'theme-primary',
  };
  readonly bsConfig: Partial<BsDatepickerConfig> = {
    ...this.baseBsConfig,
    dateInputFormat: 'DD/MM/YYYY [às] HH:mm',
  };
  readonly form = this.formBuilder.group({
    dataLimiteRecebimento: this.formBuilder.control(null),
    dataLimiteEntregaMercadoria: this.formBuilder.control(null),
    dataInicioExecucaoServico: this.formBuilder.control(null),
    dataFimExecucaoServico: this.formBuilder.control(null),
    mensagemEnvioCotacao: this.formBuilder.control(''),
    idFuncionarioContato: this.formBuilder.control(null, [Validators.required]),
  });
  readonly projeto$ = this.projetoService.projeto$;

  readonly pluralFiles = {
    '=0': 'Nenhum arquivo anexado',
    '=1': '1 arquivo anexado',
    other: '# arquivos anexados',
  };

  isLoading = false;
  errorOnUpload = false;

  get idFuncionarioContatoControl(): FormControl {
    return this.form.get('idFuncionarioContato') as FormControl;
  }

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(data => {
      this.onChange(data);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.form.enable();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  fileProgress(files: FileList): void {
    if (files.length > 0) {
      this.isLoading = true;
      this.envioDeCotacao
        .sendFile(this.idOrcamento, this.grupo.idOrcamentoGrupo, files)
        .pipe(
          catchAndThrow(() => {
            this.errorOnUpload = true;
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(() => {
          this.errorOnUpload = false;
        });
    }
  }

  writeValue(obj: any): void {
    this.form.setValue(obj);
  }

  private onChange: any = () => {};

  private onTouched: any = () => {};

  changeSteps(step: number): void {
    this.envioDeCotacao.changeStep(step);
  }
}
