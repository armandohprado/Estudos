import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { CnGrupo } from '../../../../../../../models/cn-grupo';
import { CcGrupoService } from '../../../../../../state/grupos/cc-grupo.service';
import { finalize } from 'rxjs/operators';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { CcGrupoQuery } from '../../../../../../state/grupos/cc-grupo.query';
import { CnGrupoStatusEnum } from '../../../../../../../models/cn-grupo-status.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { environment } from '../../../../../../../../../environments/environment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModalMiscellaneousComponent } from './modal-miscellaneous/modal-miscellaneous.component';
import { GrupoAlt } from '@aw-models/grupo-alt';

export type CollapsesCcGrupo = 'collapseMapa' | 'collapseTransacao';

@Component({
  selector: 'app-tab-compra-negociacao-cc',
  templateUrl: './tab-compra-negociacao-cc.component.html',
  styleUrls: ['./tab-compra-negociacao-cc.component.scss'],
  animations: [collapseAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabCompraNegociacaoCcComponent implements OnInit {
  constructor(
    public ccGruposService: CcGrupoService,
    private awDialogService: AwDialogService,
    private ccGruposQuery: CcGrupoQuery,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private bsModalService: BsModalService
  ) {}

  @ViewChild('dropdown') dropdownHistorico: BsDropdownDirective;
  @Input() grupo: CnGrupo;
  @Input() grupoOrcamento: GrupoAlt;

  loadingTransacoes = false;
  enableAprovacao = environment.homolog || environment.dev;

  updateCollapse(tipo: CollapsesCcGrupo): void {
    if (tipo === 'collapseMapa') {
      this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, {
        [tipo]: !this.grupo[tipo],
      });
    } else if (tipo === 'collapseTransacao') {
      if (!this.grupo[tipo]) {
        this.loadingTransacoes = true;
        this.ccGruposService
          .getExtratoTransacao(this.grupo.idCompraNegociacaoGrupo)
          .pipe(
            finalize(() => {
              this.loadingTransacoes = false;
              this.changeDetectorRef.markForCheck();
            })
          )
          .subscribe();
      } else {
        this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, {
          [tipo]: !this.grupo[tipo],
        });
      }
    }
  }

  fluxoDefinirValores($event: MouseEvent): void {
    $event.stopPropagation();
    if (!this.grupo.haTransacoesPendentes) {
      this.router
        .navigate([this.grupo.idCompraNegociacaoGrupo, 'envio-mapa'], {
          relativeTo: this.activatedRoute,
        })
        .then();
    } else {
      this.awDialogService.error('Erro', 'Existem transações pendentes nesse grupo!');
    }
  }

  historicoMapas(event: MouseEvent): void {
    this.ccGruposService.getMapaHistorico(this.grupo.idCompraNegociacaoGrupo).subscribe(() => {
      this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, {
        collapseMapa: true,
      });
    });

    event.stopPropagation();
  }

  trocarMapaAtual(idCompraNegociacaoGrupoMapa: number, event: MouseEvent): void {
    event.stopPropagation();
    this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, { trocandoMapa: true });
    this.ccGruposService
      .getMapa(this.grupo.idCompraNegociacaoGrupo, idCompraNegociacaoGrupoMapa)
      .pipe(
        finalize(() => {
          this.ccGruposService.updateGrupo(this.grupo.idCompraNegociacaoGrupo, { trocandoMapa: false });
        })
      )
      .subscribe(() => {
        this.dropdownHistorico.hide();
      });
  }

  aprovarMapa(event: MouseEvent): void {
    if (
      this.grupo.mapaAtual?.idCompraNegociacaoGrupoMapa &&
      ![CnGrupoStatusEnum.MapaRetornado, CnGrupoStatusEnum.MapaReprovado, CnGrupoStatusEnum.EmitirCC].includes(
        this.grupo.idCompraNegociacaoStatus
      )
    ) {
      event.stopPropagation();
      this.awDialogService.warning(
        'Você tem certeza que deseja aprovar o Mapa Enviado ID',
        'Esta ação não pode ser desfeita.',
        {
          primaryBtn: {
            title: 'Aprovar',
            action: bsModalRef =>
              this.ccGruposService
                .aprovarMapa(this.grupo.idCompraNegociacaoGrupo, this.grupo.mapaAtual.idCompraNegociacaoGrupoMapa)
                .pipe(
                  finalize(() => {
                    bsModalRef.hide();
                  })
                ),
          },
        }
      );
    } else {
      this.awDialogService.error(
        'Erro ao tentar aprovar o mapa',
        'Já recebemos um retorno da central e o mapa não pode ser alterado!'
      );
    }
  }

  reprovarMapa(event: MouseEvent): void {
    if (
      this.grupo.mapaAtual?.idCompraNegociacaoGrupoMapa &&
      ![CnGrupoStatusEnum.MapaRetornado, CnGrupoStatusEnum.MapaReprovado, CnGrupoStatusEnum.EmitirCC].includes(
        this.grupo.idCompraNegociacaoStatus
      )
    ) {
      event.stopPropagation();
      this.awDialogService.warning(
        'Você tem certeza que deseja reprovar o Mapa Enviado ID:',
        'Esta ação não pode ser desfeita.',
        {
          primaryBtn: {
            title: 'Recusa',
            action: bsModalRef =>
              this.ccGruposService
                .reprovarMapa(this.grupo.idCompraNegociacaoGrupo, this.grupo.mapaAtual.idCompraNegociacaoGrupoMapa)
                .pipe(
                  finalize(() => {
                    bsModalRef.hide();
                  })
                ),
          },
        }
      );
    } else {
      this.awDialogService.error(
        'Erro ao tentar aprovar o mapa',
        'Já recebemos um retorno da central e o mapa não pode ser alterado!'
      );
    }
  }

  openMiscellaneous($event: MouseEvent): void {
    $event.stopPropagation();
    this.bsModalService.show(ModalMiscellaneousComponent, { initialState: { grupo: this.grupo } });
  }

  ngOnInit(): void {
    if (!this.grupo.collapseTransacao) {
      this.updateCollapse('collapseTransacao');
    }
  }
}
