import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { CadernoConfiguracaoNivel } from '@aw-models/cadernos/caderno';
import { upsert } from '@aw-utils/util';
import { trackByFactory } from '@aw-utils/track-by';
import { delay, filter, finalize, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'app-orcamento-filtro',
  templateUrl: './orcamento-filtro.component.html',
  styleUrls: ['./orcamento-filtro.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrcamentoFiltroComponent implements OnInit, OnDestroy {
  constructor(public cadernosService: CadernosService) {}

  tab2 = false;
  loader$ = new BehaviorSubject(false);
  private _destroy$ = new Subject<void>();

  successFeedback$ = new Subject<boolean>();

  trackByAndar = trackByFactory('idProjetoEdificioPavimento');
  trackByCentroCusto = trackByFactory('idProjetoCentroCusto');
  trackByGrupo = trackByFactory('idOrcamentoGrupo');
  ngOnInit(): void {
    this.successFeedback$
      .pipe(
        takeUntil(this._destroy$),
        filter(show => show),
        delay(1000)
      )
      .subscribe(() => {
        this.successFeedback$.next(false);
      });
  }
  alterarTab(): void {
    this.tab2 = !this.tab2;
  }

  updateCadernoTab2(
    $event: any[],
    tipo: 'cadernoConfiguracaoAndar' | 'cadernoConfiguracaoCentroCusto' | 'cadernoConfiguracaoGrupo',
    id: 'idProjetoCentroCusto' | 'idProjetoEdificioPavimento' | 'idOrcamentoGrupo'
  ): void {
    this.cadernosService.caderno$.next({
      ...this.cadernosService.caderno$.value,
      [tipo]: upsert(this.cadernosService.caderno$.value[tipo], $event, id),
    });
  }

  updateCadernoConfiguracao($event: { event: boolean; value: string }): void {
    this.cadernosService.caderno$.next({
      ...this.cadernosService.caderno$.value,
      cadernoConfiguracaoColunasTipo: [
        { ...this.cadernosService.caderno$.value.cadernoConfiguracaoColunasTipo[0], [$event.value]: $event.event },
      ],
    });
  }

  updateCadernoNiveis($event: CadernoConfiguracaoNivel): void {
    this.cadernosService.caderno$.next({
      ...this.cadernosService.caderno$.value,
      cadernoConfiguracaoNivel: upsert(
        this.cadernosService.caderno$.value.cadernoConfiguracaoNivel,
        [$event],
        'idCadernoConfiguracaoNivel'
      ),
    });
  }

  salvar(): void {
    if (this.cadernosService.caderno$.value.nomeCaderno) {
      this.loader$.next(true);
      this.cadernosService
        .postCadernoConfig(this.cadernosService.caderno$.value.idCaderno)
        .pipe(
          finalize(() => {
            this.loader$.next(false);
            this.successFeedback$.next(true);
          })
        )
        .subscribe();
    }
  }

  updateCaderno($event: string): void {
    this.cadernosService.caderno$.next({ ...this.cadernosService.caderno$.value, nomeCaderno: $event });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
