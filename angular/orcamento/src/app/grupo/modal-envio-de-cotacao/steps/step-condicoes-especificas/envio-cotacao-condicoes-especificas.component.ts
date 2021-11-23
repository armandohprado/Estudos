import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import { GrupoAlt } from '@aw-models/grupo-alt';

@Component({
  selector: 'app-envio-cotacao-condicoes-especificas',
  templateUrl: './envio-cotacao-condicoes-especificas.component.html',
  styleUrls: ['./envio-cotacao-condicoes-especificas.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EnvioCotacaoCondicoesEspecificasComponent),
      multi: true,
    },
  ],
})
export class EnvioCotacaoCondicoesEspecificasComponent implements OnInit, OnDestroy, ControlValueAccessor {
  constructor(private formBuilder: FormBuilder, private envioDeCotacaoService: EnvioDeCotacaoService) {}

  @Input() grupo: GrupoAlt;
  @Input() formValid: boolean;
  @Input() loaderSubmitEnvioCotacao: boolean;

  @Output() sendForm = new EventEmitter();

  _destroy$ = new Subject<void>();

  formStep5: FormGroup = this.formBuilder.group({
    liberarQuantitativo: this.formBuilder.control(false),
  });

  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(obj: any): void {
    this.formStep5.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  sendFormBtn(): void {
    this.sendForm.emit();
  }

  changeStep(step: number): void {
    this.envioDeCotacaoService.changeStep(step);
  }

  ngOnInit(): void {
    this.formStep5.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(value => this.onChange(value));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
