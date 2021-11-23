import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ModeloCaderno } from '../modelo-caderno.enum';
import { ImpostoTaxa } from '../imposto-taxa.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { noSpacesValidator } from '@aw-shared/validators/no-spaces';
import { Planilha } from '@aw-models/planilha';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { Caderno } from '@aw-models/cadernos/caderno';

@Component({
  selector: 'app-planilha',
  templateUrl: './planilha.component.html',
  styleUrls: ['./planilha.component.scss'],
})
export class PlanilhaComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private cadernosService: CadernosService
  ) {
    this.planilhasForm = this.fb.group({
      idCaderno: [1],
      idCadernoPlanilha: [0],
      nomePlanilha: ['', [Validators.required, noSpacesValidator]],
      exibeFamilia: [false],
      exibeItemOrcamento: [{ value: true, disabled: true }],
      exibeCodigoItem: [{ value: true, disabled: true }],
      exibeTipoFaturamento: [false],
      exibeAgrupador: [false],
      exibeGrupo: [false],
      exibeAndar: [false],
      exibeCentroCusto: [false],
      exibeItem: [false],
      exibeItemQuantidade: [{ value: true, disabled: false }],
      exibeItemFornecedor: [{ value: false, disabled: false }],
      exibeItemValorUnitario: [{ value: true, disabled: false }],
      exibeItemFaturamento: [{ value: false, disabled: false }],
      exibeItemAndar: [{ value: false, disabled: false }],
      idCadernoPlanilhaImposto: [3],
      idCadernoPlanilhaTaxa: [3],
      idCadernoPlanilhaModelo: ModeloCaderno.FAMILIA,
    });
  }

  private _destroy$ = new Subject<void>();

  caderno$: BehaviorSubject<Caderno> = this.cadernosService.caderno$;

  modeloCaderno = ModeloCaderno;
  impostoRadio = ImpostoTaxa;
  taxaRadio = ImpostoTaxa;

  planilhasForm: FormGroup;
  planilha: Planilha;

  isLoading: { loadingId: any; status: boolean } = {
    loadingId: '',
    status: false,
  };

  idPlanilha = this.route.snapshot.paramMap.get(RouteParamEnum.idPlanilha);
  idOrcamentoCenario = this.route.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  idCaderno = this.route.snapshot.paramMap.get(RouteParamEnum.idCaderno);
  planilhas: Planilha[];

  ngOnInit(): void {
    this.onChanges();
    this.caderno$.pipe(takeUntil(this._destroy$)).subscribe(caderno => {
      this.planilhas = caderno.cadernoPlanilha;
    });

    this.route.params.pipe(takeUntil(this._destroy$)).subscribe(({ idPlanilha }) => {
      this.idPlanilha = idPlanilha;
      if (this.caderno$.value.cadernoPlanilha && this.caderno$.value.cadernoPlanilha.length) {
        this.planilha = this.caderno$.value.cadernoPlanilha.find(
          planilha => planilha.idCadernoPlanilha === Number(idPlanilha)
        );
        if (!this.planilha) {
          this.planilha = this.planilhas[0];
          this.router
            .navigate(['../', this.planilha.idCadernoPlanilha], {
              relativeTo: this.route,
            })
            .then();
        }
        this.planilhasForm.patchValue(this.planilha);
      }
    });
  }

  onChanges(): void {
    const formControlNames = [
      'exibeItemQuantidade',
      'exibeItemFornecedor',
      'exibeItemValorUnitario',
      'exibeItemFaturamento',
      'exibeItemAndar',
    ];

    this.planilhasForm.get('idCadernoPlanilhaModelo').valueChanges.subscribe(idModelo => {
      if (idModelo === ModeloCaderno.COLUNADOS) {
        this.planilhasForm.get('exibeAndar').reset(false);
      } else {
        this.planilhasForm.get('exibeItemAndar').reset(false);
      }
    });

    this.planilhasForm.get('exibeItem').valueChanges.subscribe(value => {
      if (this.caderno$.value.enviadoCliente) {
        for (const formControlName of formControlNames) {
          this.planilhasForm.get(formControlName).disable();
        }
      } else {
        if (value) {
          for (const formControlName of formControlNames) {
            this.planilhasForm.get(formControlName).reset({ value: false, disabled: false });
          }
        } else {
          for (const formControlName of formControlNames) {
            this.planilhasForm.get(formControlName).reset({ value: false, disabled: true });
          }
        }
      }
    });

    if (this.caderno$.value.enviadoCliente) {
      this.planilhasForm.disable();
    }
  }

  onSubmit(loadingId: string): void {
    if (this.planilhasForm.valid) {
      this.isLoading = { loadingId, status: true };
      this.cadernosService
        .updatePlanilha(Number(this.idCaderno), Number(this.idOrcamentoCenario), Number(this.idPlanilha), {
          ...this.planilhasForm.getRawValue(),
          nomePlanilha: this.planilhasForm.get('nomePlanilha').value.trim(),
          idCadernoPlanilha: Number(this.idPlanilha),
          idCaderno: Number(this.idCaderno),
        })
        .pipe(finalize(() => (this.isLoading = { loadingId, status: false })))
        .subscribe(planilha => {
          this.cadernosService.showSuccessFeedback();
          this.planilha = planilha;
          this.cadernosService.refreshCaderno(Number(this.idCaderno), Number(this.idOrcamentoCenario)).subscribe();
        });
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
