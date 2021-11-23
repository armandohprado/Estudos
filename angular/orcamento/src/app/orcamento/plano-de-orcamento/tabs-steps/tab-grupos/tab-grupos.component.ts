import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Familia } from '../../../../models';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { ModalNovaFamiliaComponent } from './modal-nova-familia/modal-nova-familia.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AwStepperComponent } from '@aw-components/aw-stepper/aw-stepper.component';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Component({
  selector: 'app-tab-grupos',
  templateUrl: './tab-grupos.component.html',
  styleUrls: ['./tab-grupos.component.scss'],
})
export class TabGruposComponent implements OnInit {
  constructor(
    private modalService: BsModalService,
    public orcamentoService: OrcamentoService,
    private router: Router,
    private stepperComponent: AwStepperComponent,
    private activatedRoute: ActivatedRoute
  ) {}

  familias$: Observable<Familia[]>;

  loading$ = this.orcamentoService.familiasLoading$.asObservable();
  private _saveLoading$ = new BehaviorSubject<boolean>(false);
  saveLoading$ = this._saveLoading$.asObservable();
  private modalRef: BsModalRef;

  get idOrcamento(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  }

  get idOrcamentoCenario(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  }

  @Input() existeGrupos: boolean;

  @HostBinding('class.tab-pane') tab = true;

  @HostBinding('class.active')
  get url(): boolean {
    return this.router.url.includes('grupos');
  }

  trackByFn = trackByFactory<Familia>('idFamilia', 'idFamiliaCustomizada');

  criarNovaFamilia(): void {
    this.modalRef = this.modalService.show(ModalNovaFamiliaComponent, {
      class: 'modal-sm modal-dialog-centered modal-nova-familia',
      ignoreBackdropClick: true,
      initialState: { idOrcamento: this.idOrcamento, idOrcamentoCenario: this.idOrcamentoCenario },
    });
  }

  drop(event: CdkDragDrop<Familia[]>): void {
    if (event.previousContainer !== event.container) {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.familias$
        .pipe(take(1))
        .subscribe(familias => moveItemInArray(familias, event.previousIndex, event.currentIndex));
    }
    this.familias$
      .pipe(
        switchMap(familias => this.orcamentoService.ordenaFamilias(familias, this.idOrcamento)),
        take(1)
      )
      .subscribe();
  }
  salvar(salvar?: boolean): void {
    this._saveLoading$.next(true);
    this.orcamentoService
      .saveGrupos(this.idOrcamento, this.idOrcamentoCenario)
      .pipe(
        switchMap(() =>
          this.orcamentoService.refreshOrcamento(this.idOrcamento, this.idOrcamentoCenario).pipe(
            map(() => true),
            catchError(() => of(false)),
            tap(() => {
              this._saveLoading$.next(false);
              if (salvar) this.stepperComponent.next();
            })
          )
        )
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.familias$ = this.orcamentoService.alterarModoVisualizacao();
  }
}
