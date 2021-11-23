import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, lastValueFrom, Subject, switchMap, timer } from 'rxjs';
import { delay, distinctUntilChanged, finalize, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EnvioDeCotacaoService } from '../services/cotacao/envio-de-cotacao.service';
import { CotacaoService } from '../services/cotacao/cotacao.service';
import { Funcionario, GrupoAlt, PropostaAlt, Responsavel } from '../models';
import { fadeOutAnimation } from '../shared/animations/fadeOut';
import { trackByFactory } from '../utils/track-by';
import { EnvioCotacaoModalService } from './modal-envio-de-cotacao/envio-cotacao-modal.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '../models/route-param.enum';
import { DefinicaoEscopoModalService } from './definicao-escopo/definicao-escopo-modal.service';
import { BooleanInput, coerceArray, coerceBooleanProperty } from '@angular/cdk/coercion';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { OrcamentoCenarioGrupoService } from '../services/orcamento-cenario-grupo/orcamento-cenario-grupo.service';
import { RouteDataEnum } from '@aw-models/route-data.enum';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { refreshMap } from '@aw-utils/rxjs/operators';
import { filterNilValue } from '@datorama/akita';
import { FuncionarioAlt } from '@aw-models/funcionario-alt';

@Component({
  selector: 'app-grupo-proposta',
  templateUrl: './grupo-proposta.component.html',
  styleUrls: ['./grupo-proposta.component.scss'],
  animations: [fadeOutAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrupoPropostaComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  static ngAcceptInputType_hideExcluir: BooleanInput;
  static ngAcceptInputType_showLinkLoginTemporario: BooleanInput;

  constructor(
    private formBuilder: FormBuilder,
    private cotacaoService: CotacaoService,
    private envioDeCotacaoService: EnvioDeCotacaoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private envioCotacaoModalService: EnvioCotacaoModalService,
    private routerQuery: RouterQuery,
    private definicaoEscopoModalService: DefinicaoEscopoModalService,
    private awDialogService: AwDialogService,
    private orcamentoCenarioGroupService: OrcamentoCenarioGrupoService,
    private orcamentoAltService: OrcamentoAltService,
    private elementRef: ElementRef<HTMLElement>,
    private changeDetectorRef: ChangeDetectorRef,
    private cenariosService: CenariosService
  ) {}

  private readonly _destroy$ = new Subject<void>();
  private readonly _idOrcamentoGrupo$ = new BehaviorSubject(-1);

  loadingDefinicaoEscopo = false;
  loadingEnvioCotacao = false;
  loadingComplemento = false;
  loadingPropostas = false;

  @Input() grupo: GrupoAlt;
  @Input() idProjeto: number;
  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;
  @Input() expanded = true;

  @Output() readonly expandedChange = new EventEmitter<boolean>();

  @Input() adicionarFornecedor = false;
  @Input() adicionarFornecedorRouterLink: any[] | string;
  @Input() equalizacaoRouterLink: any[] | string;
  @Input() responsaveisImgMesmoTamanho = false;
  @Input()
  get responsaveisQtde(): number {
    return this._responsaveisQtde;
  }
  set responsaveisQtde(qtde: number) {
    this._responsaveisQtde = qtde;
    this._responsaveis = this.responsaveis ?? [];
  }
  private _responsaveisQtde = 4;

  @Input('responsaveis')
  set _responsaveis(responsaveis: Funcionario[]) {
    this.responsaveis = Array.from({ length: this._responsaveisQtde }).map((_, index) => responsaveis[index]);
  }
  responsaveis: Funcionario[];

  @Input() datas: Date[] | string[];
  @Input('comentario')
  set _comentario(comentario: string) {
    this.comentario = comentario ?? '';
  }
  comentario: string;
  @Output() comentarioChange = new EventEmitter<string>();

  @Input() devolucaoPropostaRouterLink: any[] | string;

  @Input()
  get hideExcluir(): boolean {
    return this._hideExcluir;
  }
  set hideExcluir(hideExcluir: boolean) {
    this._hideExcluir = coerceBooleanProperty(hideExcluir);
  }
  private _hideExcluir = false;

  @Output() grupoExcluir = new EventEmitter<GrupoAlt>();

  @Input()
  get showLinkLoginTemporario(): boolean {
    return this._showLinkLoginTemporario;
  }
  set showLinkLoginTemporario(showLinkLoginTemporario: boolean) {
    this._showLinkLoginTemporario = coerceBooleanProperty(showLinkLoginTemporario);
  }
  private _showLinkLoginTemporario = false;

  @Input() routerLinkQueryParams: Params = {};

  @Output() propostaSelecionada = new EventEmitter<PropostaAlt>();

  @Input() equalizacaoDisabled = false;

  @Input() isControleCompras = false;

  @Output() readonly propostaChange = new EventEmitter<PropostaAlt>();
  @Output() readonly grupoChange = new EventEmitter<GrupoAlt>();

  highlight = false;

  readonly trackByResponsavel = trackByFactory<Responsavel>('idFuncionario');
  readonly trackByFuncionario = trackByFactory<FuncionarioAlt>('idFuncionario');
  readonly trackByString = trackByFactory<string | Date>();

  readonly showLinkLoginTemporarioData$ = this.activatedRoute.data.pipe(
    map(data => !!data[RouteDataEnum.propostaShowLinkLoginTemporario]),
    distinctUntilChanged(),
    shareReplay()
  );

  formComments: FormGroup;
  comentarioControl: FormControl;
  toggleFornecedoresStatus: boolean;

  private _updateGrupo(partial: Partial<GrupoAlt>): void {
    this.grupoChange.emit({ ...this.grupo, ...partial });
  }

  submit(): void {
    this.saveComentario(this.formComments.value);
  }

  async openModalDefinicaoEscopo(): Promise<void> {
    this.loadingDefinicaoEscopo = true;
    await this.definicaoEscopoModalService.openModalDefinicaoEscopo(
      this.idProjeto,
      this.grupo,
      this.cenariosService.getCenarioPadraoSnapshot(),
      this.idOrcamentoCenario,
      this.checkPropostas(),
      undefined,
      this.isControleCompras
    );
    this.loadingDefinicaoEscopo = false;
    this.changeDetectorRef.markForCheck();
  }

  saveComentario(value: { comentarioGrupo: string; complementoGrupo: string }): void {
    this.loadingComplemento = true;
    const customizada = !!this.grupo.idFamiliaCustomizada;
    this.cotacaoService
      .saveComentario(value, this.grupo.idOrcamentoGrupo, this.grupo.idOrcamento, customizada)
      .pipe(
        tap(() => {
          this._updateGrupo({ comentarioGrupo: value.comentarioGrupo, complementoGrupo: value.complementoGrupo });
        }),
        finalize(() => {
          this.loadingComplemento = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  private setUpForms(): void {
    this.comentarioControl = this.formBuilder.control(this.comentario, {
      updateOn: 'blur',
    });
    this.formComments = this.formBuilder.group({
      comentarioGrupo: this.formBuilder.control(this.grupo.comentarioGrupo),
      complementoGrupo: this.formBuilder.control(this.grupo.complementoGrupo),
    });
    this.comentarioControl.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(comentario => {
      this.comentarioChange.emit(comentario);
    });
  }

  checkPropostas(): boolean {
    return this.grupo.propostas.some(proposta => !proposta.fornecedor.fornecedorInterno);
  }

  navigate(commands: string | any[]): void {
    this.router
      .navigate(coerceArray(commands), {
        queryParams: { ...this.routerLinkQueryParams, [RouteParamEnum.idOrcamentoGrupo]: this.grupo.idOrcamentoGrupo },
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
      })
      .then();
  }

  openEqualizacao(): void {
    this.navigate(this.equalizacaoRouterLink);
  }

  excluirGrupo(): void {
    this.awDialogService.warning({
      title: 'Tem certeza que deseja excluir esse grupo?',
      content: 'Essa ação não pode ser desfeita',
      primaryBtn: {
        title: 'Excluir',
        action: bsModalRef =>
          this.orcamentoCenarioGroupService.excluir(this.grupo.idOrcamentoCenarioGrupo).pipe(
            tap(() => {
              bsModalRef.hide();
              this.grupoExcluir.emit(this.grupo);
            })
          ),
      },
      secondaryBtn: { title: 'Não excluir' },
    });
  }

  toggleAwCollapse($event: boolean): void {
    if ($event && !this.grupo.possuiAwEstimado && !this.loadingPropostas) {
      this.loadingPropostas = true;
      this.cotacaoService
        .createProposta(this.idOrcamento, this.grupo.idOrcamentoGrupo, !!this.grupo.idFamiliaCustomizada)
        .pipe(
          refreshMap(() =>
            this.orcamentoAltService.getGrupo(this.idOrcamento, this.idOrcamentoCenario, this.grupo.idOrcamentoGrupo)
          ),
          finalize(() => {
            this.loadingPropostas = false;
            this.changeDetectorRef.markForCheck();
          })
        )
        .subscribe();
    }
    this.expandedChange.emit($event);
  }

  async envioCotacao(): Promise<void> {
    this.loadingEnvioCotacao = true;
    const hasEscopo = await lastValueFrom(this.envioDeCotacaoService.hasEscopo(this.grupo.idOrcamentoGrupo));
    if (hasEscopo) {
      const idProjeto = +this.routerQuery.getParams(RouteParamEnum.idProjeto);
      await this.envioCotacaoModalService.showModal({
        grupo: this.grupo,
        idProjeto,
        reenvio: this.checkPropostas(),
        idFornecedorAtual: 0,
        idOrcamento: this.grupo.idOrcamento,
        idOrcamentoCenario: this.idOrcamentoCenario,
        isControleCompras: this.isControleCompras,
      });
    } else {
      this.awDialogService.error({
        title: 'Esse grupo não possui escopo',
        content: 'Favor selecionar itens na Definição de escopo antes de enviar a cotação',
        primaryBtn: {
          title: 'Abrir Definição de escopo',
          action: bsModalRef => {
            return this.openModalDefinicaoEscopo().finally(() => {
              bsModalRef.hide();
            });
          },
        },
      });
    }
    this.loadingEnvioCotacao = false;
    this.changeDetectorRef.markForCheck();
  }

  ngOnInit(): void {
    this.setUpForms();
    this._idOrcamentoGrupo$
      .pipe(
        distinctUntilChanged(),
        switchMap(idOrcamentoGrupo => this.orcamentoAltService.selectGrupo(idOrcamentoGrupo)),
        filterNilValue(),
        takeUntil(this._destroy$)
      )
      .subscribe(grupo => {
        this._updateGrupo(grupo);
      });
  }

  ngAfterViewInit(): void {
    const idOrcamentoGrupoParam = this.activatedRoute.snapshot.queryParamMap.get(RouteParamEnum.idOrcamentoGrupo);
    if (!idOrcamentoGrupoParam) {
      return;
    }
    setTimeout(() => {
      if (+idOrcamentoGrupoParam === this.grupo.idOrcamentoGrupo) {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        timer(1000)
          .pipe(
            tap(() => {
              this.highlight = true;
              this.changeDetectorRef.markForCheck();
            }),
            delay(2500)
          )
          .subscribe(() => {
            this.highlight = false;
            this.changeDetectorRef.markForCheck();
          });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const grupoChange = changes.grupo;
    if (!grupoChange) {
      return;
    }
    const grupo: GrupoAlt | undefined = grupoChange.currentValue;
    const grupoOld: GrupoAlt | undefined = grupoChange.previousValue;
    if (grupo && grupo.idOrcamentoGrupo !== grupoOld?.idOrcamentoGrupo) {
      this._idOrcamentoGrupo$.next(grupo.idOrcamentoGrupo);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
