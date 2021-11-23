import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Caderno } from '@aw-models/cadernos/caderno';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { noSpacesValidator } from '@aw-shared/validators/no-spaces';
import { CKEditor5 } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@aw-shared/@ckeditor/ckeditor';
import { ckEditorConfig } from '@aw-shared/@ckeditor/ckeditorConfig';
import { BehaviorSubject, Subject } from 'rxjs';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { auditTime, finalize, takeUntil } from 'rxjs/operators';

let uniqueID = 0;

@Component({
  selector: 'app-caderno-card',
  templateUrl: './caderno-card.component.html',
  styleUrls: ['./caderno-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CadernoCardComponent implements OnInit, OnDestroy {
  constructor(private formBuilder: FormBuilder, private cadernosService: CadernosService) {}

  private _destroy$ = new Subject<void>();

  @Input() idOrcamentoCenario: number;
  @Input() nomeProperty: keyof Pick<Caderno, 'nomeCondicaoGeral' | 'nomeItemExcluso'>;
  @Input() descricaoProperty: keyof Pick<Caderno, 'descricaoCondicaoGeral' | 'descricaoItemExcluso'>;
  @Input() enabledProperty: keyof Pick<Caderno, 'habilitadoItemExcluso' | 'habilitadoCondicaoGeral'>;

  idNome = 'caderno-card-' + uniqueID++;

  form = this.formBuilder.group({
    nome: ['', [Validators.maxLength(100), noSpacesValidator]],
    descricao: ['', [Validators.maxLength(1000)]],
  });

  get descricaoControl(): FormControl {
    return this.form.get('descricao') as FormControl;
  }

  invalid$ = new BehaviorSubject(false);
  descricaoInvalid$ = new BehaviorSubject(false);

  loading$ = new BehaviorSubject(false);

  @Input()
  get caderno(): Caderno {
    return this._caderno;
  }
  set caderno(caderno: Caderno) {
    this._caderno = caderno;
    if (caderno) {
      this.form?.patchValue({ nome: caderno[this.nomeProperty], descricao: caderno[this.descricaoProperty] });
      if (caderno.enviadoCliente || !caderno[this.enabledProperty]) {
        this.form?.disable();
      } else {
        this.form?.enable();
      }
    }
  }
  private _caderno: Caderno;

  editor = ClassicEditor;
  ckEditorConfig: CKEditor5.Config = ckEditorConfig;

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading$.next(true);
    this.cadernosService
      .updateCaderno('' + this.idOrcamentoCenario, this._caderno.idCaderno, {
        ...this._caderno,
        [this.nomeProperty]: this.form.get('nome').value?.trim() ?? '',
        [this.descricaoProperty]: this.form.get('descricao').value?.trim() ?? '',
      })
      .pipe(
        finalize(() => {
          this.loading$.next(false);
        })
      )
      .subscribe(() => {
        this.cadernosService.showSuccessFeedback();
      });
  }

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this._destroy$), auditTime(100)).subscribe(() => {
      this.invalid$.next(this.form.invalid);
      this.descricaoInvalid$.next(this.descricaoControl.invalid);
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
