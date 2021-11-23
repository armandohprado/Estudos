import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cenario } from '../../../models/';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { CenarioStatusEnum } from '../../../models';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { Subject, Subscription, throwError } from 'rxjs';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { ReportsService } from '@aw-services/reports/reports.service';
import { FormBuilder } from '@angular/forms';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModalEvidenciasCadernoComponent } from '../cadernos/modal-evidencias-caderno/modal-evidencias-caderno.component';

@Component({
  selector: 'app-cenario',
  templateUrl: './cenario.component.html',
  styleUrls: ['./cenario.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CenarioComponent implements OnDestroy {
  constructor(
    private awDialogService: AwDialogService,
    private cenariosService: CenariosService,
    private cadernosService: CadernosService,
    private activatedRoute: ActivatedRoute,
    public reportsService: ReportsService,
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private bsModalService: BsModalService
  ) {}

  private _destroy$ = new Subject<void>();

  @Input() cenario: Cenario;
  @Output() openModal = new EventEmitter();

  @ViewChild('popover') popover: PopoverDirective;

  idOrcamento = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);

  formUpload = this.formBuilder.group({
    files: [],
    justificacao: '',
  });

  cenarioStatus = CenarioStatusEnum;

  loading = false;

  editar(): void {
    this.openModal.emit(this.cenario);
  }

  saveUpload(): void {
    let request$; // TODO tipo
    this.loading = true;

    if (this.formUpload.get('justificacao')?.value) {
      request$ = this.cadernosService.sendFormUploadJustificativa(
        this.cenario.idOrcamentoCenario,
        this.formUpload.get('justificacao').value
      );
    } else {
      request$ = this.cadernosService.sendFormUpload(
        this.cenario.idOrcamentoCenario,
        this.formUpload.get('files').value
      );
    }
    request$
      .pipe(
        finalize(() => {
          this.loading = false;

          this.popover.hide();
          this.alterarCenario(this.cenarioStatus.aprovadoCEO);
        })
      )
      .subscribe();
  }

  duplicar(): void {
    this.loading = true;
    this.cenariosService
      .duplicateCenario(this.idOrcamento, this.cenario.idOrcamentoCenario, this.cenario.nomeOrcamentoCenario)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  alterarCenario(cenarioStatus: number): void {
    this.alterarCenarioRequest(cenarioStatus);
  }

  private alterarCenarioRequest(cenarioStatus: number): Subscription {
    this.loading = true;
    return this.cenariosService
      .alterarStatus(this.idOrcamento, this.cenario.idOrcamentoCenario, cenarioStatus)
      .pipe(
        catchError(err => {
          this.awDialogService.error(
            'Erro ao atualizar status',
            'Houve um erro ao atualizar status do cenário, por favor, tente novamente mais tarde'
          );
          return throwError(err);
        }),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  revisarCenario(): void {
    this.loading = true;
    this.cenariosService
      .revisarCenario(this.idOrcamento, this.cenario.idOrcamentoCenario, {
        idCenarioStatus: this.cenario.idCenarioStatus,
        nome: this.cenario.nomeOrcamentoCenario,
      })
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  fichaCeoReport(IdOrcamentoCenario: number): void {
    return this.reportsService.FichaCeo({ IdOrcamentoCenario }).open(true, 'noopener noreferrer');
  }

  modalEvidencias(idOrcamentoCenario: number): void {
    this.bsModalService.show(ModalEvidenciasCadernoComponent, {
      class: 'modal-lg',
      ignoreBackdropClick: true,
      initialState: {
        idOrcamentoCenario,
      },
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
