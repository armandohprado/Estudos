import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjetoAmbienteService } from '@aw-services/projeto-ambiente/projeto-ambiente.service';
import { BehaviorSubject, combineLatest, forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime, finalize, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { ProjetoAmbiente } from '@aw-models/projeto-ambiente';
import { ProjetoAmbienteQuery } from '@aw-services/projeto-ambiente/projeto-ambiente.query';
import { DefinicaoEscopoGrupoTecnicoState } from '../../state/definicao-escopo-grupo-tecnico.state';
import { Pavimento } from '../../../definicao-escopo/shared/de-distribuir-quantitativo/model/pavimento';
import { GrupoItemTecnicoFilho } from '../../models/grupo-item';
import { trackByFactory } from '@aw-utils/track-by';
import { DefinicaoEscopoGrupoTecnicoService } from '../../definicao-escopo-grupo-tecnico.service';
import { getTipoForroList, trackByTipoForro } from '@aw-models/tipo-forro';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SpkEnum, spkList } from '@aw-models/spk';
import { PavimentoService } from '@aw-services/pavimento/pavimento.service';
import { PavimentoInfo } from '../../../../models';
import { CurrencyMaskConfig } from 'ngx-currency';
import { DefinicaoEscopoGrupoTecnicoActions } from '../../state/actions';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

function createFormGroup(ambiente: ProjetoAmbiente): FormGroup {
  return new FormGroup({
    nomeAmbiente: new FormControl(ambiente.nomeAmbiente, [Validators.required]),
    metragem: new FormControl(ambiente.metragem, [Validators.required]),
    peDireito: new FormControl(ambiente.peDireito, [Validators.required]),
    idTipoForro: new FormControl(ambiente.idTipoForro, [Validators.required]),
  });
}

@Component({
  selector: 'app-det-grupo-item-filho-ambientes-modal',
  templateUrl: './det-grupo-item-filho-ambientes-modal.component.html',
  styleUrls: ['./det-grupo-item-filho-ambientes-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class DetGrupoItemFilhoAmbientesModalComponent implements OnInit, OnDestroy {
  constructor(
    public bsModalRef: BsModalRef,
    private projetoAmbienteService: ProjetoAmbienteService,
    private store: Store,
    private projetoAmbienteQuery: ProjetoAmbienteQuery,
    private definicaoEscopoGrupoTecnicoService: DefinicaoEscopoGrupoTecnicoService,
    private changeDetectorRef: ChangeDetectorRef,
    private pavimentoService: PavimentoService,
    private projetoService: ProjetoService
  ) {}

  projeto$ = this.projetoService.projeto$;

  @Input() idOrcamentoGrupoItemPai: number;
  @Input() grupoItemFilho: GrupoItemTecnicoFilho;
  @Input() pavimento: Pavimento;

  grupoItemFilho$: Observable<GrupoItemTecnicoFilho>;

  private _destroy$ = new Subject<void>();

  formPavimento = new FormGroup({
    area: new FormControl(),
    numeroPessoas: new FormControl(),
  });
  private _cancelPavimentoInfoReq$ = new Subject<void>();

  currencyOptions: Partial<CurrencyMaskConfig> = { precision: 0, allowNegative: false };

  ambientes$: Observable<ProjetoAmbiente[]>;
  loading$ = new BehaviorSubject<boolean>(false);
  savingPavimento$ = new BehaviorSubject<boolean>(false);

  edit: Record<number, boolean> = {};
  form: Record<number, FormGroup> = {};

  tipoForroList = getTipoForroList();
  spkList = spkList();

  trackByTipoForro = trackByTipoForro;
  trackByAmbiente = trackByFactory<ProjetoAmbiente>('idProjetoAmbiente');

  updateSpk(idProjetoAmbiente: number, idSpk: SpkEnum): void {
    this.projetoAmbienteService.update(idProjetoAmbiente, { idSpk });
    this.definicaoEscopoGrupoTecnicoService.updateAmbiente(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      idProjetoAmbiente,
      this.pavimento.idProjetoEdificioPavimento,
      { idSpk }
    );
  }

  setEdit(ambiente: ProjetoAmbiente, edit = true): void {
    this.form = { ...this.form, [ambiente.idProjetoAmbiente]: createFormGroup(ambiente) };
    this.edit = { ...this.edit, [ambiente.idProjetoAmbiente]: edit };
    if (ambiente.idProjetoAmbiente <= 0 && !edit) {
      this.projetoAmbienteService.deleteNew(ambiente.idProjetoAmbiente);
    }
    this.changeDetectorRef.markForCheck();
  }

  save(ambiente: ProjetoAmbiente): void {
    const newAmbiente = { ...ambiente, ...this.form[ambiente.idProjetoAmbiente].value };
    const http$ =
      ambiente.idProjetoAmbiente > 0
        ? this.projetoAmbienteService.atualizar(newAmbiente)
        : this.projetoAmbienteService.criar(newAmbiente);
    http$
      .pipe(
        tap(ambienteCreated => {
          this.edit = { ...this.edit, [ambienteCreated.idProjetoAmbiente]: false };
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  excluir(ambiente: ProjetoAmbiente): void {
    if (ambiente.idProjetoAmbiente === this.grupoItemFilho.idProjetoAmbiente || ambiente.idProjetoAmbiente <= 0) {
      return;
    }
    const { area, numeroPessoas } = this.formPavimento.value;
    this.projetoAmbienteService
      .excluir(ambiente.idProjetoAmbiente)
      .pipe(
        tap(() => {
          this.definicaoEscopoGrupoTecnicoService.toggleAmbiente(
            this.idOrcamentoGrupoItemPai,
            this.grupoItemFilho.idOrcamentoGrupoItem,
            {
              idProjetoEdificioPavimento: this.pavimento.idProjetoEdificioPavimento,
              idProjetoAmbiente: ambiente.idProjetoAmbiente,
              nomePavimento: this.pavimento.nomePavimento,
              idSpk: ambiente.idSpk,
              area,
              numeroPessoas,
            },
            false
          );
        })
      )
      .subscribe();
  }

  toggleAmbiente(ambiente: ProjetoAmbiente): void {
    if (ambiente.idProjetoAmbiente === this.grupoItemFilho.idProjetoAmbiente || ambiente.idProjetoAmbiente <= 0) {
      return;
    }
    const { area, numeroPessoas } = this.formPavimento.value;
    this.definicaoEscopoGrupoTecnicoService.toggleAmbiente(
      this.idOrcamentoGrupoItemPai,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      {
        idProjetoEdificioPavimento: this.pavimento.idProjetoEdificioPavimento,
        idProjetoAmbiente: ambiente.idProjetoAmbiente,
        nomePavimento: this.pavimento.nomePavimento,
        idSpk: ambiente.idSpk,
        numeroPessoas,
        area,
      }
    );
  }

  addAmbiente(): void {
    const ambiente = this.projetoAmbienteService.addNew(this.pavimento.idProjetoEdificioPavimento);
    this.setEdit(ambiente);
  }

  listenToPavimentoInfoChanges(): void {
    this.formPavimento.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(700),
        switchMap((pavimentoInfo: PavimentoInfo) => {
          this.savingPavimento$.next(true);
          this._cancelPavimentoInfoReq$.next();
          return this.pavimentoService.updateInfo(this.pavimento.idProjetoEdificioPavimento, pavimentoInfo).pipe(
            takeUntil(this._cancelPavimentoInfoReq$),
            tap(() => {
              this.savingPavimento$.next(false);
            })
          );
        })
      )
      .subscribe();
  }

  salvar(): void {
    this.store
      .dispatch(
        new DefinicaoEscopoGrupoTecnicoActions.selecionarAmbiente(
          this.idOrcamentoGrupoItemPai,
          this.grupoItemFilho.idOrcamentoGrupoItem,
          this.pavimento.idProjetoEdificioPavimento
        )
      )
      .pipe(take(1))
      .subscribe(() => {
        this.bsModalRef.hide();
      });
  }

  ngOnInit(): void {
    this.loading$.next(true);
    const ambienteReq$ = this.projetoAmbienteService.getByProjetoEdificioPavimento(
      this.pavimento.idProjetoEdificioPavimento
    );
    const pavimentoInfoReq$ = this.pavimentoService
      .getInfo(this.pavimento.idProjetoEdificioPavimento)
      .pipe(tap(info => this.formPavimento.setValue(info)));
    forkJoin([ambienteReq$, pavimentoInfoReq$])
      .pipe(
        finalize(() => {
          this.loading$.next(false);
          this.listenToPavimentoInfoChanges();
        })
      )
      .subscribe();
    const ambientes$ = this.projetoAmbienteQuery
      .selectProjetoEdificioPavimento(this.pavimento.idProjetoEdificioPavimento)
      .pipe(
        tap(ambientes => {
          this.form = ambientes.reduce((acc, ambiente) => {
            if (ambiente.saving || ambiente.deleting) {
              return { ...acc, [ambiente.idProjetoAmbiente]: this.form[ambiente.idProjetoAmbiente] };
            }
            return {
              ...acc,
              [ambiente.idProjetoAmbiente]:
                ambiente.idProjetoAmbiente <= 0 && this.form[ambiente.idProjetoAmbiente]?.dirty
                  ? this.form[ambiente.idProjetoAmbiente]
                  : createFormGroup(ambiente),
            };
          }, {});
          this.changeDetectorRef.markForCheck();
        })
      );
    const ambientesSelecionados$ = this.store.select(
      DefinicaoEscopoGrupoTecnicoState.selectAmbientes(
        this.idOrcamentoGrupoItemPai,
        this.grupoItemFilho.idOrcamentoGrupoItem,
        this.pavimento.idProjetoEdificioPavimento
      )
    );
    this.ambientes$ = combineLatest([ambientes$, ambientesSelecionados$]).pipe(
      map(([ambientes, ambientesSelecionados]) =>
        ambientes.map(ambiente => {
          const ambienteSelecionado = ambientesSelecionados.find(
            selecionado => selecionado.idProjetoAmbiente === ambiente.idProjetoAmbiente
          );
          return {
            ...ambiente,
            selecionado: !!ambienteSelecionado,
            idSpk: ambienteSelecionado?.idSpk || ambiente.idSpk || SpkEnum.sim,
          };
        })
      )
    );
    this.grupoItemFilho$ = this.store.select(
      DefinicaoEscopoGrupoTecnicoState.getGrupoItemFilho(
        this.idOrcamentoGrupoItemPai,
        this.grupoItemFilho.idOrcamentoGrupoItem
      )
    );
  }

  ngOnDestroy(): void {
    this.projetoAmbienteService.clearNew();
    this._destroy$.next();
    this._destroy$.complete();
  }
}
