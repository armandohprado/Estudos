import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { Caderno, PlanilhaHistorico } from '@aw-models/cadernos/caderno';
import { trackByFactory } from '@aw-utils/track-by';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { isFunction } from 'lodash-es';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { ModalCadernoRelatoriosComponent } from './caderno/modal-caderno-relatorios/modal-caderno-relatorios.component';

@Component({
  selector: 'app-cadernos',
  templateUrl: './cadernos.component.html',
  styleUrls: ['./cadernos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class CadernosComponent {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private bsModalService: BsModalService,
    private cadernosService: CadernosService,
    private awDialogService: AwDialogService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  loading = false;
  loadingCreate = false;

  private deleteModalRef: BsModalRef;

  get idOrcamentoCenario(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  }
  get idOrcamento(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  }

  cadernos$ = this.cadernosService.cadernos$.asObservable();

  trackByCaderno = trackByFactory<Caderno>('idCaderno');
  trackByPlanilhaHistorico = trackByFactory<PlanilhaHistorico>('idCadernoPlanilhaHistorico');

  onCreateCaderno(): void {
    this.loadingCreate = true;
    this.cadernosService
      .createCaderno(this.idOrcamentoCenario)
      .pipe(
        finalize(() => {
          this.loadingCreate = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(caderno => {
        this.router
          .navigate([caderno.idCaderno], {
            relativeTo: this.activatedRoute,
            state: { data: caderno },
          })
          .then();
      });
  }

  onRemoveCaderno(caderno: Caderno): Observable<void> {
    return this.cadernosService.deleteCaderno(this.idOrcamentoCenario, caderno.idCaderno).pipe(
      tap(() => {
        this.removeCaderno(caderno.idCaderno);
        this.deleteModalRef.hide();
      })
    );
  }

  duplicarCaderno(caderno: Caderno): void {
    this.updateCaderno(caderno.idCaderno, { loading: true });
    const cadernoDuplicado = { ...caderno };
    delete cadernoDuplicado.idCaderno;
    cadernoDuplicado.nomeCaderno = `${cadernoDuplicado.nomeCaderno} (Duplicado)`;
    this.cadernosService
      .createCaderno(cadernoDuplicado.idOrcamentoCenario, cadernoDuplicado)
      .pipe(
        finalize(() => {
          this.updateCaderno(caderno.idCaderno, { loading: false });
        })
      )
      .subscribe(cadernoResponse => {
        this.addCaderno(cadernoResponse);
      });
  }

  openDeleteModal(caderno: Caderno): void {
    this.deleteModalRef = this.awDialogService.warning({
      title: `Você tem certeza que deseja excluir o caderno "${caderno.nomeCaderno || ''}" definitivamente?`,
      content: 'Essa ação não pode ser desfeita',
      secondaryBtn: { title: 'Voltar' },
      primaryBtn: {
        title: 'Excluir',
        action: () => this.onRemoveCaderno(caderno),
      },
    });
  }

  openConfirmModal(caderno: Caderno): void {
    this.deleteModalRef = this.awDialogService.warning({
      title: `Você tem certeza que deseja enviar para o cliente o caderno "${caderno.nomeCaderno ?? ''}"?`,
      content: 'Essa ação não pode ser desfeita',
      primaryBtn: {
        title: 'Enviar',
        action: () => this.alterarCenario(caderno),
      },
      secondaryBtn: {
        title: 'Voltar',
      },
    });
  }

  alterarCenario(caderno: Caderno): Observable<Caderno> {
    const { idOrcamentoCenario, idCaderno } = caderno;
    return this.cadernosService
      .updateCadernoCenarioStatus(idOrcamentoCenario, idCaderno, {
        ...caderno,
        enviadoCliente: true,
      })
      .pipe(
        finalize(() => {
          this.deleteModalRef.hide();
        }),
        tap(() => {
          this.updateCaderno(caderno.idCaderno, { enviadoCliente: true });
          this.router.navigate(['../../'], { relativeTo: this.activatedRoute }).then();
        }),
        catchAndThrow(() => {
          this.awDialogService.error('Erro', 'Erro ao tentar alterar o status do caderno');
        })
      );
  }

  openModalRelatorioCaderno(caderno: Caderno): void {
    this.deleteModalRef = this.bsModalService.show(ModalCadernoRelatoriosComponent, {
      initialState: { caderno, idOrcamentoCenario: this.idOrcamentoCenario },
      class: 'modal-dialog-centered modal-xl',
    });
  }

  private updateCaderno(
    idCaderno: number | ((caderno: Caderno) => boolean),
    partial: Partial<Caderno> | ((caderno: Caderno) => Caderno)
  ): void {
    const predicate = isFunction(idCaderno) ? idCaderno : (caderno: Caderno) => caderno.idCaderno === idCaderno;
    const callback = isFunction(partial) ? partial : (caderno: Caderno) => ({ ...caderno, ...partial });
    this.cadernosService.cadernos$.next(
      this.cadernosService.cadernos$.value.map(caderno => {
        if (predicate(caderno)) {
          caderno = callback(caderno);
        }
        return caderno;
      })
    );
  }

  private addCaderno(caderno: Caderno): void {
    this.cadernosService.cadernos$.next([...this.cadernosService.cadernos$.value, caderno]);
  }

  private removeCaderno(idCardeno: number): void {
    this.cadernosService.cadernos$.next(
      this.cadernosService.cadernos$.value.filter(caderno => caderno.idCaderno !== idCardeno)
    );
  }

  toggleCollapse(idCaderno: number): void {
    this.updateCaderno(idCaderno, caderno => ({ ...caderno, collapse: !caderno.collapse }));
  }
}
