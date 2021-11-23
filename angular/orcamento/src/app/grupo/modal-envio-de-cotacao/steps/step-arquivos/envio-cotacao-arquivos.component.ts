import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, pluck, takeUntil } from 'rxjs/operators';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Etapa, GrupoAlt, Site } from '../../../../models';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { GerenciadorArquivosService } from '../../../../orcamento/gerenciador-arquivos/gerenciador-arquivos.service';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-envio-cotacao-arquivos',
  templateUrl: './envio-cotacao-arquivos.component.html',
  styleUrls: ['./envio-cotacao-arquivos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EnvioCotacaoArquivosComponent),
      multi: true,
    },
  ],
})
export class EnvioCotacaoArquivosComponent implements OnInit, OnDestroy, ControlValueAccessor, AfterViewInit {
  constructor(
    public envioDeCotacaoService: EnvioDeCotacaoService,
    private formBuilder: FormBuilder,
    private gerenciadorArquivosService: GerenciadorArquivosService
  ) {}

  private _destroy$ = new Subject<void>();

  @Input() grupo: GrupoAlt;
  @Input() idProjeto: number;
  @Output() changeStep = new EventEmitter();

  sites$: Observable<Site[]>;
  etapaAnexosAvulsos: Etapa = null;
  idEtapa = 0;

  bsModalRef: BsModalRef;

  stages$ = this.envioDeCotacaoService.stages$.pipe(
    map(stages => {
      this.idEtapa = stages[0].idEtapa;
      this.etapaAnexosAvulsos = stages.splice(0, 1)[0];
      return stages;
    })
  );

  form: FormGroup = this.formBuilder.group({
    arquivoAnexo: this.formBuilder.control(['']),
  });

  loadingGerenciador$ = new BehaviorSubject(false);

  trackByEtapa = trackByFactory<Etapa>('idEtapa');

  setCounter(event): void {
    this.form.get('arquivoAnexo').setValue(event);
  }

  onSelectTab(idEtapa: number, tab: TabDirective): void {
    if (tab.active) {
      this.idEtapa = idEtapa;
    }
  }

  private retrieveSites(): void {
    this.sites$ = this.envioDeCotacaoService.retrieveSites(this.idProjeto, this.grupo.idOrcamento).pipe(pluck('sites'));
  }

  writeValue(obj: any): void {
    this.form.setValue(obj);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private onChange: any = () => {};

  private onTouched: any = () => {};

  changeSteps(step: number): void {
    this.envioDeCotacaoService.changeStep(step);
  }

  async openGenrenciadorModal(): Promise<void> {
    this.loadingGerenciador$.next(true);
    this.bsModalRef = await this.gerenciadorArquivosService.showModal(
      {
        idOrcamento: this.grupo.idOrcamento,
        idProjeto: this.idProjeto,
        idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
        nomeGrupo: `${this.grupo.codigoGrupo} ${this.grupo.nomeGrupo}`,
        destroyState: false,
      },
      { ignoreBackdropClick: true }
    );
    this.loadingGerenciador$.next(false);
  }

  ngOnInit(): void {
    // Dispara o trigger para buscar extensoes dos arquivos
    this.envioDeCotacaoService.fileExtensionsAction$.next({
      idOrcamento: this.grupo.idOrcamento,
      idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
    });

    this.form.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(data => this.onChange(data));
  }

  ngAfterViewInit(): void {
    this.envioDeCotacaoService.retrieveStages(this.idProjeto, this.grupo.idOrcamentoGrupo);
    // Busca os condominios
    this.retrieveSites();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.gerenciadorArquivosService.resetState();
  }
}
