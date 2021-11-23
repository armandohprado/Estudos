import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CnAgGrupao, CnAgGrupo, trackByCnAgGrupao, trackByCnAgGrupo } from '../../models/cn-adicionar-grupos';
import { StateComponent } from '@aw-shared/components/common/state-component';
import { PlanoComprasService } from '../../plano-compras/state/plano-compras/plano-compras.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { debounceTime, finalize, map, startWith, tap } from 'rxjs/operators';
import { cnAgMapGrupoes, cnAgMapGrupoesUid, cnAgMapGrupoToPayload } from './utils';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { isFunction } from 'lodash-es';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { search } from '@aw-components/aw-utils/aw-search/aw-search.pipe';
import { PcAddGruposPayload } from '../../plano-compras/models/selecao-grupoes';
import { CcGrupoService } from '../state/grupos/cc-grupo.service';
import { ControleComprasQuery } from '../state/controle-compras/controle-compras.query';
import { CcCabecalhoService } from '../state/cabecalho/cc-cabecalho.service';
import { catchAndThrow, refreshAll } from '@aw-utils/rxjs/operators';

interface CnAdicionarGruposComponentState {
  loading: boolean;
  grupoes: CnAgGrupao[];
  saving: boolean;
}

@Component({
  selector: 'app-cn-adicionar-grupos',
  templateUrl: './cn-adicionar-grupos.component.html',
  styleUrls: ['./cn-adicionar-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class CnAdicionarGruposComponent extends StateComponent<CnAdicionarGruposComponentState> implements OnInit {
  constructor(
    private bsModalRef: BsModalRef,
    private planoComprasService: PlanoComprasService,
    private awDialogService: AwDialogService,
    private ccGrupoService: CcGrupoService,
    private controleComprasQuery: ControleComprasQuery,
    private ccCabecalhoService: CcCabecalhoService
  ) {
    super({ grupoes: [], loading: true, saving: false });
  }

  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;
  @Input() idPlanoCompra: number;

  private readonly _grupoes$ = this.selectState('grupoes').pipe(map(cnAgMapGrupoes));

  readonly loading$ = this.selectState('loading');
  readonly hasUpdates$ = this._grupoes$.pipe(
    map(grupoes => grupoes.some(grupao => grupao.grupos.some(grupo => this._grupoHasUpdate(grupo))))
  );
  readonly saving$ = this.selectState('saving');

  readonly form = new FormGroup({
    term: new FormControl(''),
    onlyUpdated: new FormControl(false),
  });

  get termControl(): FormControl {
    return this.form.get('term') as FormControl;
  }

  get onlyUpdatedControl(): FormControl {
    return this.form.get('onlyUpdated') as FormControl;
  }

  readonly term$ = this.termControl.valueChanges.pipe(debounceTime(500), startWith(''));
  readonly onlyUpdated$ = this.onlyUpdatedControl.valueChanges.pipe(startWith(false));

  readonly grupoes$: Observable<CnAgGrupao[]> = combineLatest([this._grupoes$, this.term$, this.onlyUpdated$]).pipe(
    map(([grupoes, term, onlyUpdated]) => {
      if (onlyUpdated) {
        grupoes = grupoes.map(grupao => ({
          ...grupao,
          grupos: grupao.grupos.filter(grupo => this._grupoHasUpdate(grupo)),
        }));
      }
      if (term) {
        grupoes = grupoes.map(grupao => ({
          ...grupao,
          grupos: search(grupao.grupos, ['codigoGrupo', 'nomeGrupo', 'complementoOrcamentoGrupo'], term),
        }));
      }
      if (onlyUpdated || term) {
        grupoes = grupoes.filter(grupao => grupao.grupos.length);
      }
      return grupoes;
    })
  );

  readonly trackByGrupao = trackByCnAgGrupao;
  readonly trackByGrupo = trackByCnAgGrupo;

  private _grupoHasUpdate(grupo: CnAgGrupo): boolean {
    return grupo.duplicar || (grupo.selecionado && !grupo.idOrcamentoGrupo);
  }

  private _hasAnyUpdate(): boolean {
    return this.getState('grupoes').some(grupao => grupao.grupos.some(grupo => this._grupoHasUpdate(grupo)));
  }

  private _updateGrupao(
    idGrupao: number | ((grupao: CnAgGrupao) => boolean),
    partial: Partial<CnAgGrupao> | ((grupao: CnAgGrupao) => CnAgGrupao)
  ): void {
    const predicate = isFunction(idGrupao) ? idGrupao : (grupao: CnAgGrupao) => grupao.idGrupao === idGrupao;
    const update = isFunction(partial) ? partial : (grupao: CnAgGrupao) => ({ ...grupao, ...partial });
    this.updateState('grupoes', grupoes =>
      grupoes.map(grupao => {
        if (predicate(grupao)) {
          grupao = update(grupao);
        }
        return grupao;
      })
    );
  }

  private _updateGrupo(
    idGrupao: number | ((grupao: CnAgGrupao) => boolean),
    _id: number | ((grupo: CnAgGrupo) => boolean),
    partial: Partial<CnAgGrupo> | ((grupao: CnAgGrupo) => CnAgGrupo)
  ): void {
    const predicate = isFunction(_id) ? _id : (grupo: CnAgGrupo) => grupo._id === _id;
    const update = isFunction(partial) ? partial : (grupo: CnAgGrupo) => ({ ...grupo, ...partial });
    this._updateGrupao(idGrupao, grupao => ({
      ...grupao,
      grupos: grupao.grupos.map(grupo => {
        if (predicate(grupo)) {
          grupo = update(grupo);
        }
        return grupo;
      }),
    }));
  }

  private _getGruposUpdated(): CnAgGrupo[] {
    const grupoes = this.getState('grupoes');
    const grupos: CnAgGrupo[] = [];
    for (const grupao of grupoes) {
      for (const grupo of grupao.grupos) {
        if (this._grupoHasUpdate(grupo)) {
          grupos.push(grupo);
        }
      }
    }
    return grupos;
  }

  toggleCollapse(idGrupao: number): void {
    this._updateGrupao(idGrupao, grupao => ({ ...grupao, opened: !grupao.opened }));
  }

  close(): void {
    if (this._hasAnyUpdate()) {
      this.awDialogService.warning({
        title: 'Tem certeza que deseja fechar?',
        content: 'As alterações feitas serão perdidas!',
        primaryBtn: {
          title: 'Fechar',
          status: 'secondary',
          action: bsModalRef => {
            bsModalRef.hide();
            this.bsModalRef.hide();
          },
        },
        secondaryBtn: {
          title: 'Voltar',
          action: bsModalRef => {
            bsModalRef.hide();
          },
        },
      });
    } else {
      this.bsModalRef.hide();
    }
  }

  onGrupoChange($event: CnAgGrupo): void {
    this._updateGrupo($event.idGrupao, $event._id, $event);
  }

  save(): void {
    this.updateState({ saving: true });
    const grupos = this._getGruposUpdated();
    if (!grupos.length) {
      this.updateState({ saving: false });
      return;
    }
    const payload: PcAddGruposPayload = {
      idOrcamento: this.idOrcamento,
      idOrcamentoCenario: this.idOrcamentoCenario,
      idPlanoCompra: this.idPlanoCompra,
      grupos: grupos.map(cnAgMapGrupoToPayload),
    };
    this.planoComprasService
      .addGruposHttp(payload)
      .pipe(
        refreshAll([
          this.ccCabecalhoService.getCabecalho(this.idOrcamentoCenario),
          this.ccGrupoService.setAllGrupos(this.idOrcamentoCenario),
        ]),
        finalize(() => {
          this.updateState({ saving: false });
        }),
        tap(() => {
          this.bsModalRef.hide();
        }),
        catchAndThrow(err => {
          this.awDialogService.error('Erro', err?.error?.mensagem ?? 'Ocorreu um erro interno');
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.planoComprasService.getSelecaoGrupoes(this.idOrcamentoCenario).subscribe(payload => {
      this.updateState({ grupoes: cnAgMapGrupoesUid(payload.grupoes as any), loading: false });
    });
  }
}
