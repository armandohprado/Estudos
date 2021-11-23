import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Select } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoState } from './state/definicao-escopo-loja-insumo.state';
import { Observable } from 'rxjs';
import { ErrorApi } from '../definicao-escopo/model/error-api';
import { DefinicaoEscopoLojaInsumoService } from './definicao-escopo-loja-insumo.service';
import { GrupoItemDELI } from './models/grupo-item';
import { DefinicaoEscopoLojaService } from '../definicao-escopo-loja/definicao-escopo-loja.service';
import { DefinicaoEscopoLojaAbstract } from '../definicao-escopo-loja/shared/definicao-escopo-loja-abstract';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';

@Component({
  selector: 'app-definicao-escopo-loja',
  templateUrl: './definicao-escopo-loja-insumo.component.html',
  styleUrls: ['./definicao-escopo-loja-insumo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefinicaoEscopoLojaInsumoComponent extends DefinicaoEscopoLojaAbstract implements OnInit, OnDestroy {
  constructor(
    private definicaoEscopoLojaInsumoService: DefinicaoEscopoLojaInsumoService,
    definicaoEscopoLojaService: DefinicaoEscopoLojaService,
    bsModalRef: BsModalRef,
    awDialogService: AwDialogService
  ) {
    super(definicaoEscopoLojaService, bsModalRef, awDialogService, loading =>
      this.definicaoEscopoLojaInsumoService.setLoading(loading)
    );
  }

  @Select(DefinicaoEscopoLojaInsumoState.hasAnyGrupoItemInvalid) hasAnyGrupoItemInvalid$: Observable<boolean>;
  @Select(DefinicaoEscopoLojaInsumoState.getLoading) loading$: Observable<boolean>;
  @Select(DefinicaoEscopoLojaInsumoState.getErrorApi) errorApi$: Observable<ErrorApi>;
  @Select(DefinicaoEscopoLojaInsumoState.getGrupoItens) grupoItens$: Observable<GrupoItemDELI[]>;

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
