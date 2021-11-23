import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Familia, FlagResponsavelEnum, Funcionario, Grupo, TipoResponsavel } from '../../../../models';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { FormBuilder, NgForm } from '@angular/forms';
import { map, switchMap, tap } from 'rxjs/operators';
import { ListaResponsaveisComponent } from './lista-responsaveis/lista-responsaveis.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ResponsavelService } from '@aw-services/orcamento/responsavel.service';
import { markFormAs } from '../../../../utils';
import { trackByFactory } from '@aw-utils/track-by';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { AwStepperComponent } from '@aw-components/aw-stepper/aw-stepper.component';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';
import { filterNilValue } from '@datorama/akita';

@Component({
  selector: 'app-tab-responsaveis',
  templateUrl: './tab-responsaveis.component.html',
  styleUrls: ['./tab-responsaveis.component.scss'],
})
export class TabResponsaveisComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public orcamentoService: OrcamentoService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private responsavelService: ResponsavelService,
    private stepperComponent: AwStepperComponent
  ) {}

  @HostBinding('class.tab-pane') tab = true;
  @ViewChild(NgForm, { static: true }) ngForm: NgForm;

  familias$: Observable<Familia[]>;

  projeto$ = this.orcamentoService.projeto$.pipe(
    filterNilValue(),
    map(projeto => {
      if (projeto.responsaveis.length > 2) {
        projeto = { ...projeto, responsaveis: projeto.responsaveis.filter((resp, index) => index !== 0) };
      }
      return projeto;
    })
  );

  collapses: any = {
    isOpen_0: true,
  };
  orderByCodigo = orderByCodigo<Grupo>('codigoGrupo');
  modalRef: BsModalRef;

  flagResponsavel = FlagResponsavelEnum;
  tipoResponsavel = TipoResponsavel;
  loading$ = this.orcamentoService.familiasLoading$.asObservable();

  private _saveLoading$ = new BehaviorSubject<boolean>(false);
  saveLoading$ = this._saveLoading$.asObservable();
  trackByFnFamilia = trackByFactory<Familia>('idFamilia');
  trackGrupoFn = trackByFactory<Grupo>('idGrupo');
  trackByFn = trackByFactory<Funcionario>('idFuncionario');

  get idOrcamento(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  }

  get idOrcamentoCenario(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  }

  @HostBinding('class.active')
  get url(): boolean {
    return this.router.url.includes('responsaveis');
  }

  get formErrors(): any {
    if (this.ngForm) {
      return Object.keys(this.ngForm.controls).reduce((accum, key) => {
        if (this.ngForm.controls[key].errors) {
          accum.push(this.ngForm.controls[key].errors);
        }
        return accum;
      }, [] as any);
    }
  }

  openModal(grupo: Grupo, flagResponsavel: number, tipoResponsavel: number, idFuncionarioAtual?: number): void {
    this.modalRef = this.modalService.show(ListaResponsaveisComponent, {
      class: 'modal-md modal-lista-responsaveis modal-dialog-centered',
      initialState: {
        grupo,
        flagResponsavel,
        tipoResponsavel,
        idOrcamento: grupo.idOrcamento,
        idOrcamentoCenario: this.idOrcamentoCenario,
        idFuncionarioAtual,
      } as Partial<ListaResponsaveisComponent>,
      ignoreBackdropClick: true,
    });
  }

  ngOnInit(): void {
    this.familias$ = this.orcamentoService.alterarModoVisualizacao();
  }

  onSubmit(responsaveisForm: NgForm, next?: boolean): void {
    if (responsaveisForm.valid) {
      this._saveLoading$.next(true);
      this.orcamentoService
        .saveGrupos(this.idOrcamento, this.idOrcamentoCenario)
        .pipe(
          switchMap(() => this.orcamentoService.refreshOrcamento(this.idOrcamento, this.idOrcamentoCenario)),
          tap(() => {
            this._saveLoading$.next(false);
            if (next) {
              this.stepperComponent.next();
            }
          })
        )
        .subscribe();
    } else {
      markFormAs(responsaveisForm.form);
    }
  }
}
