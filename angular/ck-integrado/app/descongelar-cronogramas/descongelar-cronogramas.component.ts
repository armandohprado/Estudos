import { ChangeDetectionStrategy, Component, OnInit, TrackByFunction } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CheckListIntegradoService } from '../checklist-integrado/check-list-integrado.service';
import { debounceTime, filter, finalize, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { StateComponent } from '../shared/common/state-component';
import { ProjetoCronograma } from '@aw-models/projeto-cronograma';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { ConfirmModalService } from '../shared/confirm-modal/confirm-modal.service';

interface CheckListGerenciadorState {
  cronogramas: ProjetoCronograma[];
  loading: boolean;
}

@Component({
  selector: 'app-descongelar-cronogramas',
  templateUrl: './descongelar-cronogramas.component.html',
  styleUrls: ['./descongelar-cronogramas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescongelarCronogramasComponent extends StateComponent<CheckListGerenciadorState> implements OnInit {
  constructor(
    private checkListIntegradoService: CheckListIntegradoService,
    private activatedRoute: ActivatedRoute,
    private confirmModalService: ConfirmModalService
  ) {
    super({ cronogramas: [], loading: false });
  }

  termoControl = new FormControl(this._getTermoFromRoute());
  termo$: Observable<string> = this.termoControl.valueChanges.pipe(
    startWith(this._getTermoFromRoute()),
    debounceTime(400)
  );
  state$ = this.selectState();

  private _getTermoFromRoute(): string {
    return this.activatedRoute.snapshot.queryParamMap.get(RouteParamEnum.termo) ?? '';
  }

  private _updateCronograma(idProjeto: number, partial: Partial<ProjetoCronograma>): void {
    this.updateState('cronogramas', cronogramas =>
      cronogramas.map(cronograma => {
        if (cronograma.idProjeto === idProjeto) {
          cronograma = { ...cronograma, ...partial };
        }
        return cronograma;
      })
    );
  }

  private _listenTermo(): void {
    this.termo$
      .pipe(
        takeUntil(this.destroy$),
        filter(termo => termo.length >= 3),
        switchMap(termo => {
          this.updateState({ loading: true });
          return this.checkListIntegradoService.pesquisarCronogramas(termo).pipe(
            finalize(() => {
              this.updateState({ loading: false });
            })
          );
        }),
        catchAndThrow(() => {
          this._listenTermo();
        })
      )
      .subscribe(cronogramas => {
        this.updateState({ cronogramas });
      });
  }

  trackBy: TrackByFunction<ProjetoCronograma> = (_, cronograma) => cronograma.idProjeto;

  descongelarCronograma({ idProjeto, numeroProjeto, nomeProjeto }: ProjetoCronograma): void {
    this.confirmModalService.open({
      title: `${numeroProjeto} ${nomeProjeto}`,
      content: `Descongelar cronograma?`,
      btnYes: 'Descongelar',
      btnNo: 'Fechar',
      yesAction: bsModalRef => {
        this._updateCronograma(idProjeto, { loading: true });
        return this.checkListIntegradoService.atualizarCronogramaPublicado(idProjeto, false).pipe(
          tap(() => {
            this._updateCronograma(idProjeto, { loading: false, publicado: false });
          }),
          catchAndThrow(() => {
            this._updateCronograma(idProjeto, { loading: false });
            alert('Erro ao tentar descongelar');
          }),
          finalize(() => {
            bsModalRef.hide();
          })
        );
      },
    });
  }

  ngOnInit(): void {
    this._listenTermo();
  }
}
