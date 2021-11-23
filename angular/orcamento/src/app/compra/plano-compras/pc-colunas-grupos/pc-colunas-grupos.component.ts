import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PcGridColumnGroupEnum, PcGridService } from '../pc-grid/pc-grid.service';
import { PcCabecalhoQuery } from '../state/cabecalho/pc-cabecalho.query';
import { PlanoComprasService } from '../state/plano-compras/plano-compras.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PcAddGruposComponent } from '../pc-add-grupos/pc-add-grupos.component';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

@Component({
  selector: 'app-pc-colunas-grupos',
  templateUrl: './pc-colunas-grupos.component.html',
  styleUrls: ['./pc-colunas-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PcColunasGruposComponent {
  constructor(
    public pcGridService: PcGridService,
    public pcCabecalhoQuery: PcCabecalhoQuery,
    private planoComprasService: PlanoComprasService,
    private routerQuery: RouterQuery,
    private awDialogService: AwDialogService,
    private bsModalService: BsModalService
  ) {}

  readonly pcGridColumnGroupEnum = PcGridColumnGroupEnum;

  setGroupsVisible(groups: PcGridColumnGroupEnum[]): void {
    this.pcGridService.setGroupsVisible(groups);
  }

  modalAdicionarGrupo(): void {
    this.bsModalService.show(PcAddGruposComponent, {
      class: 'modal-xl',
      ignoreBackdropClick: true,
    });
  }

  congelar(): void {
    if (this.pcCabecalhoQuery.isCongelado()) {
      return;
    }
    this.awDialogService.warning('Tem certeza que deseja Congelar?', 'Esta ação não pode ser desfeita', {
      primaryBtn: {
        title: 'Congelar',
        action: bsModalRef => this.congelarApi().pipe(tap(() => bsModalRef.hide())),
      },
      secondaryBtn: {
        title: 'Cancelar',
      },
    });
  }

  private congelarApi(): Observable<void> {
    return this.planoComprasService.congelar(+this.routerQuery.getParams(RouteParamEnum.idOrcamentoCenario)).pipe(
      tap(() => {
        this.awDialogService.success('Sucesso no congelamento!', 'Esta ação não pode ser desfeita');
      }),
      catchAndThrow(response => {
        this.awDialogService.error(
          'Erro ao tentar congelar',
          response?.error?.mensagem ?? 'Favor tentar novamente mais tarde'
        );
      })
    );
  }
}
