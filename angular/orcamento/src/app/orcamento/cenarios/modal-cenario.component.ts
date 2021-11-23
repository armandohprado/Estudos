import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { Cenario } from '../../models';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-modal-cenario',
  templateUrl: './modal-cenario.component.html',
  styleUrls: ['./modal-cenario.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalCenarioComponent implements OnInit, OnDestroy {
  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    public cenariosService: CenariosService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  loaderSubmit = false;
  private _destroy$ = new Subject<void>();

  idOrcamento: number;
  cenario: Cenario;

  form: FormGroup;

  initSub(): void {
    this.form
      .get('idOrcamentoCenarioOrigem')
      .valueChanges.pipe(
        takeUntil(this._destroy$),
        distinctUntilChanged(),
        filter(() => this.form.get('descricaoOrcamentoCenario').hasError('required'))
      )
      .subscribe(idOrcamentoCenario => {
        this.changeCenario(+idOrcamentoCenario);
      });
  }

  changeCenario(idOrcamentoCenario: number): void {
    this.form
      .get('descricaoOrcamentoCenario')
      .setValue(
        this.cenariosService.cenarios$.value.find(cenario => cenario.idOrcamentoCenario === idOrcamentoCenario)
          .descricaoOrcamentoCenario
      );
  }

  formSubmit(): void {
    if (this.form.invalid || this.loaderSubmit) {
      return;
    }
    this.loaderSubmit = true;
    let http$: Observable<Cenario[]>;
    if (!this.cenario) {
      http$ = this.cenariosService.createCenario(this.idOrcamento, this.form.value);
    } else {
      http$ = this.cenariosService.editCenario(this.idOrcamento, { ...this.cenario, ...this.form.value });
    }
    http$
      .pipe(
        finalize(() => {
          this.bsModalRef.hide();
          this.loaderSubmit = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      nomeOrcamentoCenario: this.formBuilder.control('', Validators.required),
      idOrcamentoCenarioOrigem: this.formBuilder.control(null, {
        validators: this.cenario ? [] : [Validators.required],
      }),
      descricaoOrcamentoCenario: this.formBuilder.control('', Validators.required),
    });
    if (this.cenario) {
      this.form.patchValue(this.cenario);
    }
    this.initSub();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
