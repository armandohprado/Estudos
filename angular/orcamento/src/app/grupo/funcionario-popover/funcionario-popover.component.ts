import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TipoResponsavel } from '../../models';
import { ResponsavelService } from '@aw-services/orcamento/responsavel.service';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Observable } from 'rxjs';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { FuncionarioAlt } from '@aw-models/funcionario-alt';

@Component({
  selector: 'app-funcionario-popover',
  templateUrl: './funcionario-popover.component.html',
  styleUrls: ['./funcionario-popover.component.scss'],
  host: { class: 'rounded-circle overflow-hidden' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuncionarioPopoverComponent implements OnInit {
  constructor(
    private responsavelService: ResponsavelService,
    private awDialogService: AwDialogService,
    private routerQuery: RouterQuery
  ) {}

  @HostBinding('class.small')
  get isSmall(): boolean {
    return this.small || !this.funcionario?.principal;
  }

  @ViewChild(PopoverDirective, { static: true }) popover: PopoverDirective;

  @Input() funcionario: FuncionarioAlt;
  @Input() idGrupo: number;
  @Input() canChange = true;
  @Input() tipoResponsavel: number;
  @Input() placement = 'right';
  @Input() showActionBtn = true;
  @Input() responsavelType: TipoResponsavel;
  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;
  @Output() openResponsavelModal = new EventEmitter<void>();
  @Input() small: boolean;

  fotoUrl = environment.fotoUrl;

  delete(): void {
    this.awDialogService.warning({
      title: 'Excluir responsável',
      content: 'Tem certeza que deseja excluir?',
      primaryBtn: {
        title: 'Excluir',
        action: bsModalRef => this.deleteAction(bsModalRef),
      },
      secondaryBtn: {
        title: 'Não excluir',
      },
    });
  }

  private deleteAction(bsModalRef: BsModalRef): Observable<any> {
    return this.responsavelService
      .deleteResponsavel(
        this.idOrcamento,
        this.idGrupo,
        this.funcionario.idOrcamentoGrupoResponsavel,
        this.idOrcamentoCenario
      )
      .pipe(
        tap(() => {
          bsModalRef.hide();
        })
      );
  }

  ngOnInit(): void {
    this.idOrcamento ??= +this.routerQuery.getParams(RouteParamEnum.idOrcamento);
    this.idOrcamentoCenario ??= +this.routerQuery.getParams(RouteParamEnum.idOrcamentoCenario);
  }
}
