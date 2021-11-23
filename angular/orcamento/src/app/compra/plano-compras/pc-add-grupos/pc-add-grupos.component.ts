import { Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PcCabecalhoQuery } from '../state/cabecalho/pc-cabecalho.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { PlanoComprasService } from '../state/plano-compras/plano-compras.service';
import { Observable } from 'rxjs';
import { Grupao, Grupo } from '../../../models';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { finalize, pluck } from 'rxjs/operators';
import { PcAddGruposPayload } from '../models/selecao-grupoes';
import { trackByFactory } from '@aw-utils/track-by';
import { upsert } from '@aw-utils/util';

@Component({
  selector: 'app-pc-add-grupos',
  templateUrl: './pc-add-grupos.component.html',
  styleUrls: ['./pc-add-grupos.component.scss'],
})
export class PcAddGruposComponent implements OnInit, OnDestroy {
  constructor(
    private bsModalRef: BsModalRef,
    private pcCabecalhoQuery: PcCabecalhoQuery,
    private routerQuery: RouterQuery,
    private planoCompraService: PlanoComprasService
  ) {}

  grupoes$: Observable<Grupao[]>;

  loading = false;
  grupos = [];

  trackByGrupao = trackByFactory<Grupao>('idGrupao');

  close(): void {
    this.bsModalRef.hide();
  }

  selectGrupao(grupao: { grupos: Grupo[] }): void {
    const grupoSelecionado = grupao?.grupos?.[0];
    if (!grupoSelecionado) {
      return;
    }
    if (!grupoSelecionado.selecionado) {
      this.grupos = this.grupos.filter(grupo => grupo.idGrupo !== grupoSelecionado.idGrupo);
    } else {
      this.grupos = upsert(
        this.grupos,
        [{ idGrupo: grupoSelecionado.idGrupo, grupoNaoPrevisto: grupoSelecionado.grupoNaoPrevisto }],
        'idGrupo'
      );
    }
  }

  save(): void {
    this.loading = true;
    const idOrcamentoCenario = +this.routerQuery.getParams(RouteParamEnum.idOrcamentoCenario);
    const payload: PcAddGruposPayload = {
      idOrcamento: +this.routerQuery.getParams(RouteParamEnum.idOrcamento),
      idOrcamentoCenario,
      idPlanoCompra: this.pcCabecalhoQuery.getValue().idPlanoCompra,
      grupos: this.grupos,
    };

    this.planoCompraService
      .addGruposApi(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.close();
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.loading = true;
    this.grupoes$ = this.planoCompraService
      .getSelecaoGrupoes(+this.routerQuery.getParams(RouteParamEnum.idOrcamentoCenario))
      .pipe(
        pluck('grupoes'),
        finalize(() => {
          this.loading = false;
        })
      );
  }

  ngOnDestroy(): void {}
}
