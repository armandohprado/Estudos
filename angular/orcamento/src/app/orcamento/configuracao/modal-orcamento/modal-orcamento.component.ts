import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Edificio, EdificioPayload, Fase, FasePayload, Orcamento, OrcamentoPayload, Projeto } from '../../../models';
import { OrcamentoService } from '../../../services/orcamento/orcamento.service';
import { finalize, map, tap } from 'rxjs/operators';
import { markFormAs } from '../../../utils';
import { dateValidator } from '../../../shared/validators/date.validator';
import { AwDialogService } from '../../../aw-components/aw-dialog/aw-dialog.service';
import { catchAndThrow, refresh } from '../../../utils/rxjs/operators';
import { trackByFactory } from '../../../utils/track-by';
import { isBefore } from 'date-fns';

interface OrcamentoForm {
  nomeOrcamento: string;
  edificios: EdificioPayload[];
  fases: FasePayload[];
  fasesRemove: Fase[];
}

@Component({
  selector: 'app-modal-orcamento',
  templateUrl: './modal-orcamento.component.html',
  styleUrls: ['./modal-orcamento.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalOrcamentoComponent implements OnInit, OnDestroy {
  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private orcamentoService: OrcamentoService,
    private awDialogService: AwDialogService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  buildings$: Observable<Edificio[]>;

  projeto: Projeto;
  orcamento: Orcamento;

  form: FormGroup;

  bsConfig = { isAnimated: true, containerClass: 'theme-primary' };

  tooltipText = `Verifique os campos marcados em vermelho no formulário e/ou adicione Fases e Edifícios.`;

  savingOrcamento = false;

  trackBy = trackByFactory<FormGroup>();

  get nomeOrcamentoControl(): FormControl {
    return this.form.get('nomeOrcamento') as FormControl;
  }

  get fasesControl(): FormArray {
    return this.form.get('fases') as FormArray;
  }

  get fasesControls(): FormGroup[] {
    return (this.fasesControl?.controls ?? []) as FormGroup[];
  }

  get fasesRemoveControl(): FormArray {
    return this.form.get('fasesRemove') as FormArray;
  }

  static minDateValidator(control: FormGroup): ValidationErrors {
    if (control.parent) {
      return isBefore(control.value, control.parent.get('dataInicioFase').value) ? { minDate: true } : null;
    }
  }

  setFormTouched(): void {
    markFormAs(this.form);
  }

  createFaseControl(fase?: Fase): FormGroup {
    const dataInicio = fase?.dataInicioFase ? new Date(fase.dataInicioFase) : null;
    const dataFim = fase?.dataFimFase ? new Date(fase.dataFimFase) : null;

    return this.formBuilder.group({
      nomeFase: this.formBuilder.control(fase?.nomeFase, Validators.required),
      dataInicioFase: this.formBuilder.control(dataInicio, [Validators.required, dateValidator]),
      dataFimFase: this.formBuilder.control(dataFim, [
        Validators.required,
        dateValidator,
        ModalOrcamentoComponent.minDateValidator,
      ]),
      idOrcamento: fase?.idOrcamento ?? this.orcamento?.idOrcamento ?? 0,
      idFase: fase?.idFase ?? 0,
      canRemove: fase?.canRemove ?? true,
    });
  }

  addFase(): void {
    this.fasesControl.push(this.createFaseControl());
    this.fasesControl.updateValueAndValidity();
  }

  removeFase(index: number): void {
    const faseControl = this.fasesControl.at(index);
    const fase: Fase = faseControl.value;
    if (fase.canRemove) {
      this.fasesControl.removeAt(index);
      if (fase.idFase) {
        this.fasesRemoveControl.push(faseControl);
      }
    }
  }

  saveBuildings($event: any[]): void {
    this.form.get('edificios').setValue($event ?? []);
  }

  salvarOrcamento(allEdificios: Edificio[]): void {
    if (this.form.valid) {
      this.savingOrcamento = true;
      const formValue: OrcamentoForm = this.form.value;
      formValue.fases = [
        ...formValue.fases.map(fase => ({
          ...fase,
          remove: false,
        })),
        ...formValue.fasesRemove.map(fase => ({ ...fase, remove: true })),
      ];
      const edificiosRemover: EdificioPayload[] = allEdificios
        .filter(
          ed =>
            ed.idOrcamentoProjetoEdificio &&
            !formValue.edificios.some(edForm => edForm.idOrcamentoProjetoEdificio === ed.idOrcamentoProjetoEdificio)
        )
        .map(ed => ({ ...ed, remove: true }));
      const orcamento: OrcamentoPayload = {
        ...this.orcamento,
        ...formValue,
        edificios: [...formValue.edificios, ...edificiosRemover],
      };
      this.orcamentoService
        .saveOrcamento({
          ...orcamento,
          idProjeto: this.projeto.idProjeto,
        })
        .pipe(
          refresh(this.orcamentoService.retrieveProject(this.projeto.idProjeto, true)),
          tap(() => {
            this.bsModalRef.hide();
          }),
          catchAndThrow(err => {
            this.awDialogService.error(
              `Erro ao tentar ${orcamento.idOrcamento ? 'atualizar' : 'cadastrar'} o orçamento`,
              err?.error?.Error?.Message ?? 'Erro interno'
            );
          }),
          finalize(() => {
            this.savingOrcamento = false;
            this.changeDetectorRef.markForCheck();
          })
        )
        .subscribe();
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      nomeOrcamento: this.formBuilder.control(this.orcamento?.nomeOrcamento, Validators.required),
      edificios: this.formBuilder.control(this.orcamento?.edificios ?? [], Validators.required),
      fases: this.formBuilder.array(
        (this.orcamento?.fases ?? []).map(fase => this.createFaseControl(fase)),
        Validators.required
      ),
      fasesRemove: this.formBuilder.array([]),
    });
  }

  private getBuildings(): void {
    this.buildings$ = this.orcamentoService.retrieveBuildings(this.projeto.idProjeto).pipe(
      map(edificios => {
        return edificios.map(edificio => {
          const edificioOrcamento = (this.orcamento?.edificios ?? []).find(
            edOrcamento =>
              edOrcamento.idCondominio === edificio.idCondominio && edOrcamento.idEdificio === edificio.idEdificio
          );
          return {
            ...edificio,
            ...edificioOrcamento,
          };
        });
      })
    );
  }

  ngOnInit(): void {
    this.createForm();
    this.getBuildings();
  }

  ngOnDestroy(): void {}
}
