import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Select } from '@ngxs/store';
import { DefinicaoEscopoGrupoTecnicoState } from './state/definicao-escopo-grupo-tecnico.state';
import { Observable } from 'rxjs';
import { ErrorApi } from '../definicao-escopo/model/error-api';
import { DefinicaoEscopoGrupoTecnicoService } from './definicao-escopo-grupo-tecnico.service';
import { GrupoItemTecnico } from './models/grupo-item';
import { DefinicaoEscopoLojaService } from '../definicao-escopo-loja/definicao-escopo-loja.service';
import { DefinicaoEscopoLojaAbstract } from '../definicao-escopo-loja/shared/definicao-escopo-loja-abstract';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';

@Component({
  selector: 'app-definicao-escopo-grupo-tecnico',
  templateUrl: './definicao-escopo-grupo-tecnico.component.html',
  styleUrls: ['./definicao-escopo-grupo-tecnico.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefinicaoEscopoGrupoTecnicoComponent extends DefinicaoEscopoLojaAbstract implements OnInit, OnDestroy {
  constructor(
    private definicaoEscopoLojaInsumoService: DefinicaoEscopoGrupoTecnicoService,
    definicaoEscopoLojaService: DefinicaoEscopoLojaService,
    bsModalRef: BsModalRef,
    awDialogService: AwDialogService
  ) {
    super(definicaoEscopoLojaService, bsModalRef, awDialogService, loading =>
      this.definicaoEscopoLojaInsumoService.setLoading(loading)
    );
  }

  @Select(DefinicaoEscopoGrupoTecnicoState.hasAnyGrupoItemInvalid) hasAnyGrupoItemInvalid$: Observable<boolean>;
  @Select(DefinicaoEscopoGrupoTecnicoState.getLoading) loading$: Observable<boolean>;
  @Select(DefinicaoEscopoGrupoTecnicoState.getErrorApi) errorApi$: Observable<ErrorApi>;
  @Select(DefinicaoEscopoGrupoTecnicoState.getGrupoItens) grupoItens$: Observable<GrupoItemTecnico[]>;

  salvar(): void {
    this.close();
  }

  concluir(): void {
    this.close(true);
  }

  ngOnInit(): void {
    this.definicaoEscopoLojaInsumoService.setInit(this.grupo, this.cenarioPadrao, this.idOrcamentoCenario);
  }

  ngOnDestroy(): void {
    this.definicaoEscopoLojaInsumoService.clear();
  }
}
