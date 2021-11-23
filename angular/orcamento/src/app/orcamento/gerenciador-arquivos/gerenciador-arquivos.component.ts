import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AwRouterQuery } from '@aw-services/core/router.query';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { isNil } from 'lodash-es';
import { convertToBoolProperty } from '@aw-components/util/helpers';
import { GerenciadorArquivosService } from './gerenciador-arquivos.service';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { GaAnexoAvulsoQuery } from './state/anexo-avulso/ga-anexo-avulso.query';
import { GaPavimentoQuery } from './state/pavimento/ga-pavimento.query';
import { GaEtapaQuery } from './state/etapa/ga-etapa.query';
import { GaAtividadeQuery } from './state/atividade/ga-atividade.query';

@Component({
  selector: 'app-gerenciador-arquivos',
  templateUrl: './gerenciador-arquivos.component.html',
  styleUrls: ['./gerenciador-arquivos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GerenciadorArquivosComponent implements OnInit, OnDestroy {
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private routerQuery: AwRouterQuery,
    public gerenciadorArquivosService: GerenciadorArquivosService,
    public gaAnexoAvulsoQuery: GaAnexoAvulsoQuery,
    public gaPavimentoQuery: GaPavimentoQuery,
    public gaEtapaQuery: GaEtapaQuery,
    public gaAtividadeQuery: GaAtividadeQuery
  ) {}

  private _destroy$ = new Subject<void>();

  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;
  @Input()
  get idOrcamentoGrupo(): number {
    return this._idOrcamentoGrupo;
  }
  set idOrcamentoGrupo(value: number) {
    this._idOrcamentoGrupo = value;
    this.gerenciadorArquivosService.idOrcamentoGrupo = value;
    this.gerenciadorArquivosService.grupoChanged();
  }
  private _idOrcamentoGrupo: number;
  @Input() idProjeto: number;
  @Input() readonly: boolean;
  @Input() apenasSelecionados: boolean;
  @Input() destroyState = true;

  loading = false;

  private checkLoadedData(): void {
    const requests$: Observable<any>[] = [of(null)];
    if (!this.gerenciadorArquivosService.inicializado) {
      requests$.push(this.gerenciadorArquivosService.inicializar(this.idProjeto, this._idOrcamentoGrupo));
    }
    if (!this.gaAnexoAvulsoQuery.hasLoaded()) {
      requests$.push(this.gerenciadorArquivosService.getAnexosAvulsos(this._idOrcamentoGrupo));
    }
    if (!this.gaPavimentoQuery.hasLoaded()) {
      requests$.push(this.gerenciadorArquivosService.getPavimentos(this.idProjeto));
    }
    if (!this.gaEtapaQuery.hasLoaded()) {
      requests$.push(
        this.gerenciadorArquivosService.getEtapas(this.idProjeto, this._idOrcamentoGrupo, this.apenasSelecionados)
      );
    }
    if (!this.gerenciadorArquivosService.extensoesHasLoaded) {
      requests$.push(this.gerenciadorArquivosService.getExtensoes(this._idOrcamentoGrupo));
    }
    this.loading = true;
    forkJoin(requests$)
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
          this.subEtapaPavimento();
        })
      )
      .subscribe();
  }

  subEtapaPavimento(): void {
    this.gaAtividadeQuery.etapaPavimentoSelected$
      .pipe(
        takeUntil(this._destroy$),
        filter(([etapa, _, site, edificio, andar]) => !this.gaAtividadeQuery.hasAny(etapa, site, edificio, andar)),
        filter(([etapa]) => !!etapa?.id),
        switchMap(([etapa, _, site, edificio, andar]) => {
          this.gerenciadorArquivosService.setAtividadesLoading(true, etapa, site, edificio, andar);
          return this.gerenciadorArquivosService
            .getAtividades(this._idOrcamentoGrupo, this.idProjeto, etapa.id, site?.id, edificio?.id, andar?.id)
            .pipe(
              finalize(() => {
                this.gerenciadorArquivosService.setAtividadesLoading(false, etapa, site, edificio, andar);
              })
            );
        })
      )
      .subscribe();
  }

  checkGrupo(): void {
    this.routerQuery
      .selectParams(RouteParamEnum.idOrcamentoGrupo)
      .pipe(
        takeUntil(this._destroy$),
        distinctUntilChanged(),
        filter(id => !!id),
        map(Number)
      )
      .subscribe(idOrcamentoGrupo => {
        this.idOrcamentoGrupo = idOrcamentoGrupo;
      });
  }

  ngOnInit(): void {
    if (!this.idOrcamento) {
      this.idOrcamento = +this.routerQuery.getParams(RouteParamEnum.idOrcamento);
    }
    if (!this.idOrcamentoCenario) {
      this.idOrcamentoCenario = +this.routerQuery.getParams(RouteParamEnum.idOrcamentoCenario);
    }
    if (!this._idOrcamentoGrupo) {
      this._idOrcamentoGrupo = +this.routerQuery.getParams(RouteParamEnum.idOrcamentoGrupo);
    }
    if (!this.idProjeto) {
      this.idProjeto = +this.routerQuery.getParams(RouteParamEnum.idProjeto);
    }
    if (isNil(this.readonly)) {
      const readonly = this.routerQuery.getQueryParams(RouteParamEnum.readonly);
      this.readonly = !isNil(readonly) ? convertToBoolProperty(readonly) : false;
    }
    this.gerenciadorArquivosService.readonly = this.readonly;
    if (isNil(this.apenasSelecionados)) {
      const apenasSelecionados = this.routerQuery.getQueryParams('apenasSelecionados');
      this.apenasSelecionados = !isNil(apenasSelecionados) ? convertToBoolProperty(apenasSelecionados) : false;
    }
    this.gerenciadorArquivosService.idProjeto = this.idProjeto;
    this.gerenciadorArquivosService.idOrcamentoGrupo = this._idOrcamentoGrupo;
    this.gerenciadorArquivosService.idOrcamentoCenario = this.idOrcamentoCenario;
    this.gerenciadorArquivosService.idOrcamento = this.idOrcamento;
    this.gerenciadorArquivosService.projeto$.pipe(take(1)).subscribe(projeto => {
      this.gerenciadorArquivosService.setPavimentoSelected(projeto);
    });
    this.checkLoadedData();
    this.checkGrupo();
  }

  ngOnDestroy(): void {
    if (this.destroyState) {
      this.gerenciadorArquivosService.resetState();
    }
    this._destroy$.next();
    this._destroy$.complete();
  }
}
