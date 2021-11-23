import { Component, Input } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalSelecionarGruposComponent } from './modal-selecionar-grupos/modal-selecionar-grupos.component';
import { Familia, Grupao } from '../../../../../models';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { ModalNovaFamiliaComponent } from '../modal-nova-familia/modal-nova-familia.component';
import { finalize } from 'rxjs/operators';
import { fadeOutAnimation } from '@aw-shared/animations/fadeOut';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { trackByFactory } from '@aw-utils/track-by';
import { catchAndThrow, refresh } from '@aw-utils/rxjs/operators';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-familia',
  templateUrl: './familia.component.html',
  styleUrls: ['./familia.component.scss'],
  animations: [fadeOutAnimation(), collapseAnimation()],
})
export class FamiliaComponent {
  constructor(
    private bsModalService: BsModalService,
    private awDialogService: AwDialogService,
    private orcamentoService: OrcamentoService,
    private activatedRoute: ActivatedRoute
  ) {}

  isCollapsed = true;
  @Input() familia: Familia;
  @Input() hasButton = true;
  @Input() hasSelectedGroupsInfo = true;

  private bsModalRef: BsModalRef;

  trackByFn = trackByFactory<Grupao>('idGrupao');

  get idOrcamento(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  }

  get idOrcamentoCenario(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  }

  abrirModalSelecionarGrupos(): void {
    this.bsModalRef = this.bsModalService.show(ModalSelecionarGruposComponent, {
      class: 'modal-lg',
      ignoreBackdropClick: true,
      initialState: {
        idFamilia: this.familia.idFamiliaCustomizada || this.familia.idFamilia || 0,
        customizada: !!this.familia.idFamiliaCustomizada,
        idOrcamento: this.idOrcamento,
        showPercentual: true,
        idOrcamentoCenario: this.idOrcamentoCenario,
      },
    });
  }

  editarFamiliaCustomizada(): void {
    this.bsModalService.show(ModalNovaFamiliaComponent, {
      class: 'modal-sm modal-dialog-centered modal-nova-familia',
      ignoreBackdropClick: true,
      initialState: {
        familia: this.familia,
        idOrcamento: this.idOrcamento,
        idOrcamentoCenario: this.idOrcamentoCenario,
      },
    });
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  apagarFamiliaCustomizada(): void {
    this.awDialogService.warning({
      title: 'Excluir família',
      content: 'Tem certeza que deseja excluir?',
      primaryBtn: {
        title: 'Excluir',
        action: bsModalRef =>
          this.orcamentoService.deleteFamilia(this.idOrcamento, this.familia.idFamiliaCustomizada).pipe(
            refresh(this.orcamentoService.refreshOrcamento(this.idOrcamento, this.idOrcamentoCenario)),
            finalize(() => {
              bsModalRef.hide();
            }),
            catchAndThrow(() => {
              this.awDialogService.error('Erro ao tentar exlcuir!');
            })
          ),
      },
      secondaryBtn: { title: 'Não excluir' },
    });
  }
}
