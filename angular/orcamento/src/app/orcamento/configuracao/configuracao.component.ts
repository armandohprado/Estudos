import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { Edificio, Fase, Orcamento, Projeto } from '../../models';
import { tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ModalOrcamentoComponent } from './modal-orcamento/modal-orcamento.component';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { trackByFactory } from '@aw-utils/track-by';
import { catchAndThrow, refresh } from '@aw-utils/rxjs/operators';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-configuracao',
  templateUrl: './configuracao.component.html',
  styleUrls: ['./configuracao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracaoComponent implements OnInit, OnDestroy {
  constructor(
    private bsModalService: BsModalService,
    private orcamentoService: OrcamentoService,
    private activatedRoute: ActivatedRoute,
    private awDialogService: AwDialogService
  ) {}

  readonly projeto$ = this.orcamentoService.projeto$;
  private deleteModalRef: BsModalRef;
  private deleteModalErrorRef: BsModalRef;
  private _destroy$ = new Subject<void>();
  loadingOrcamentos = false;

  urlPlanilhaCliente = `${environment.centralizacao}Projetos/Web/ImportadorOrcamento/Home.aspx?IdOrcamento=`;

  trackByOrcamento = trackByFactory<Orcamento>('idOrcamento');
  trackByEdificio = trackByFactory<Edificio>('idEdificio');
  trackByFase = trackByFactory<Fase>('idFase');

  openModalOrcamento(projeto: Projeto, orcamento?: Orcamento): void {
    this.bsModalService.show(ModalOrcamentoComponent, {
      initialState: { projeto, orcamento },
      class: 'modal-lg',
      ignoreBackdropClick: true,
    });
  }

  openDeleteModalOrcamento(idOrcamento: number): void {
    this.deleteModalRef = this.awDialogService.error('Excluir orçamento', 'Tem certeza que deseja excluir?', {
      primaryBtn: {
        title: 'Excluir',
        action: bsModalRef => this.deleteOrcamento(idOrcamento).pipe(tap(() => bsModalRef.hide())),
      },
      secondaryBtn: {
        title: 'Não excluir',
      },
    });
  }

  private closeDeleteModalError(): void {
    this.deleteModalErrorRef.hide();
    this.deleteModalRef.hide();
  }

  private openDeleteModalError(msg?: string): void {
    const body =
      msg ||
      `Nem todos os andares/centro custo possuem quantidade informada.
      Para concluir PREENCHA ou REMOVA as quantidades de todos os andares/centro custo selecionados.`;
    this.deleteModalErrorRef = this.awDialogService.warning('Ops, algo deu errado', body, {
      secondaryBtn: { action: () => this.closeDeleteModalError() },
    });
  }

  private deleteOrcamento(idOrcamento: number): Observable<Orcamento> {
    const idProjeto = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idProjeto);
    return this.orcamentoService.deleteOrcamento(idOrcamento).pipe(
      refresh(this.orcamentoService.retrieveProject(idProjeto, true)),
      catchAndThrow(err => {
        if (err.status === 400) {
          this.openDeleteModalError(err.error.Title);
        }
      })
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
