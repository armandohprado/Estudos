import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GrupoAlt, OrcamentoCenarioPadrao } from '../../models';
import { DefinicaoEscopoService } from './definicao-escopo.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GrupoItemDE } from './model/grupo-item';
import { DefinicaoEscopoState } from './state/definicao-escopo.state';
import { delay, finalize } from 'rxjs/operators';
import { DefinicaoEscopoModeEnum } from './state/definicao-escopo.model';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

@Component({
  selector: 'app-definicao-escopo',
  templateUrl: './definicao-escopo.component.html',
  styleUrls: ['./definicao-escopo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefinicaoEscopoComponent implements OnInit, OnDestroy {
  constructor(
    private definicaoEscopoService: DefinicaoEscopoService,
    public bsModalRef: BsModalRef,
    private orcamentoAltService: OrcamentoAltService
  ) {}

  definicaoEscopoModeEnum = DefinicaoEscopoModeEnum;

  @Input() grupo: GrupoAlt;
  @Input() cenarioPadrao: OrcamentoCenarioPadrao;
  @Input() idOrcamentoGrupoItemAtual: number;
  @Input() idOrcamentoCenario: number;

  @Select(DefinicaoEscopoState.getGruposItens) _gruposItens$: Observable<GrupoItemDE[]>;
  gruposItens$: Observable<GrupoItemDE[]>;
  @Select(DefinicaoEscopoState.getLoading) loading$: Observable<boolean>;
  @Select(DefinicaoEscopoState.getMode) mode$: Observable<DefinicaoEscopoModeEnum>;

  changeMode(curMode: DefinicaoEscopoModeEnum): void {
    this.definicaoEscopoService.setMode(
      curMode === DefinicaoEscopoModeEnum.lista ? DefinicaoEscopoModeEnum.inserir : DefinicaoEscopoModeEnum.lista
    );
  }

  close(): void {
    this.definicaoEscopoService.setLoading(true);
    this.orcamentoAltService
      .getGrupo(this.grupo.idOrcamento, this.idOrcamentoCenario, this.grupo.idOrcamentoGrupo)
      .pipe(
        finalize(() => {
          this.definicaoEscopoService.setLoading(false);
          this.bsModalRef.hide();
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.definicaoEscopoService.setInit(
      this.grupo,
      this.cenarioPadrao,
      this.idOrcamentoCenario,
      this.idOrcamentoGrupoItemAtual
    );
    this.gruposItens$ = this._gruposItens$.pipe(delay(0));
  }

  ngOnDestroy(): void {
    this.definicaoEscopoService.clear();
  }
}
