import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Select } from '@ngxs/store';
import { DefinicaoEscopoLojaInsumoKitState } from './state/definicao-escopo-loja-insumo-kit.state';
import { Observable } from 'rxjs';
import { ErrorApi } from '../definicao-escopo/model/error-api';
import { DefinicaoEscopoLojaInsumoKitService } from './definicao-escopo-loja-insumo-kit.service';
import { GrupoItemKit } from './models/grupo-item';
import { DefinicaoEscopoLojaAbstract } from '../definicao-escopo-loja/shared/definicao-escopo-loja-abstract';
import { DefinicaoEscopoLojaService } from '../definicao-escopo-loja/definicao-escopo-loja.service';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';

@Component({
  selector: 'app-definicao-escopo-loja',
  templateUrl: './definicao-escopo-loja-insumo-kit.component.html',
  styleUrls: ['./definicao-escopo-loja-insumo-kit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefinicaoEscopoLojaInsumoKitComponent extends DefinicaoEscopoLojaAbstract implements OnInit, OnDestroy {
  constructor(
    private definicaoEscopoLojaInsumoKitService: DefinicaoEscopoLojaInsumoKitService,
    definicaoEscopoLojaService: DefinicaoEscopoLojaService,
    bsModalRef: BsModalRef,
    awDialogService: AwDialogService
  ) {
    super(definicaoEscopoLojaService, bsModalRef, awDialogService, loading =>
      this.definicaoEscopoLojaInsumoKitService.setLoading(loading)
    );
  }

  @Select(DefinicaoEscopoLojaInsumoKitState.hasAnyGrupoItemInvalid) hasAnyGrupoItemInvalid$: Observable<boolean>;
  @Select(DefinicaoEscopoLojaInsumoKitState.getLoading) loading$: Observable<boolean>;
  @Select(DefinicaoEscopoLojaInsumoKitState.getErrorApi) errorApi$: Observable<ErrorApi>;
  @Select(DefinicaoEscopoLojaInsumoKitState.getGrupoItens) grupoItens$: Observable<GrupoItemKit[]>;

  salvar(): void {
    this.close();
  }

  concluir(): void {
    this.close(true);
  }

  ngOnInit(): void {
    this.definicaoEscopoLojaInsumoKitService.setInit(this.grupo, this.cenarioPadrao, this.idOrcamentoCenario);
  }

  ngOnDestroy(): void {
    this.definicaoEscopoLojaInsumoKitService.clear();
  }
}
