import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalRestricoesDaObraComponent } from './modal-restricoes-da-obra/modal-restricoes-da-obra.component';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import { GrupoAlt, GrupoRestricaoObra, PropostaDetalhada } from '../../../../models';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-envio-cotacao-condicoes-fornecimento',
  templateUrl: './envio-cotacao-condicoes-fornecimento.component.html',
  styleUrls: ['./envio-cotacao-condicoes-fornecimento.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EnvioCotacaoCondicoesFornecimentoComponent),
      multi: true,
    },
  ],
})
export class EnvioCotacaoCondicoesFornecimentoComponent implements OnInit, ControlValueAccessor {
  @Input() propostaDetalhada: PropostaDetalhada;
  @Input() grupo: GrupoAlt;

  @Output() changeStep = new EventEmitter();

  bsModalRef: BsModalRef;

  form: FormGroup = this.fb.group({
    necessariaVisita: this.fb.control(false, [Validators.required]),
    contatoVisita: this.fb.control(''),
    telefoneVisita: this.fb.control(''),
    grupoRestricaoObra: this.fb.control(''),
    tipoFaturamento: this.fb.control(false),
  });

  tooltipBtn: string = null;

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private envioDeCotacaoService: EnvioDeCotacaoService
  ) {}

  ngOnInit(): void {
    this.form.valueChanges.subscribe(v => this.onChange(v));
  }

  get filteredGrupoRestricaoObra(): GrupoRestricaoObra[] {
    if (this.form.get('grupoRestricaoObra').value == null || this.form.get('grupoRestricaoObra').value === '') {
      return [];
    }
    return (
      this.form.get('grupoRestricaoObra')?.value.filter((gRO: GrupoRestricaoObra) => {
        return gRO.restricaoComentario || (gRO.restricaoObraHoraFim && gRO.restricaoObraHoraInicio);
      }) ?? []
    );
  }

  openModalRestricoesDaObra(): void {
    this.bsModalRef = this.modalService.show(ModalRestricoesDaObraComponent, {
      class: 'modal-dialog-centered modal-restricoes-da-obra',
      ignoreBackdropClick: true,
      initialState: {
        grupoRestricaoObra: this.form.get('grupoRestricaoObra').value,
        grupo: this.grupo,
      },
    });
    this.bsModalRef.content.setGrupoRestricaoObra.pipe(take(1)).subscribe(obj => this.setGrupoRestricaoObra(obj));
  }

  setGrupoRestricaoObra(obj: any): void {
    this.form.get('grupoRestricaoObra').setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  writeValue(obj: any): void {
    this.form.setValue(obj);
  }

  private onChange: any = () => {};

  private onTouched: any = () => {};

  changeSteps(step: number): void {
    if (this.form.get('necessariaVisita').value == null) {
      this.tooltipBtn = 'Por favor, defina se é necessária a visita a obra.';
      return;
    }
    this.tooltipBtn = null;
    this.envioDeCotacaoService.changeStep(step);
  }
}
