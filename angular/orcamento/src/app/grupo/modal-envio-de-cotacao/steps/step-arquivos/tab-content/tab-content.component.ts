import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { startWith, take, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import {
  Arquivo,
  Disciplina,
  DisciplinaFilters,
  Edificio,
  Etapa,
  Extensao,
  GrupoAlt,
  Pavimento,
  Site,
} from '../../../../../models';
import { DisciplinasService } from '@aw-services/orcamento/disciplinas.service';
import { trackByFactory } from '@aw-utils/track-by';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Component({
  selector: 'app-tab-content',
  templateUrl: './tab-content.component.html',
  styleUrls: ['./tab-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabContentComponent implements OnInit, OnDestroy {
  constructor(
    public envioDeCotacaoService: EnvioDeCotacaoService,
    public disciplinasService: DisciplinasService,
    private formBuilder: FormBuilder,
    private projetoService: ProjetoService
  ) {}

  readonly projeto$ = this.projetoService.projeto$;

  @Input() grupo: GrupoAlt;
  @Input() idProjeto: number;
  @Input() disciplinas: Disciplina[];
  @Input() sites: Site[];
  @Input() etapa: Etapa;
  form: FormGroup;
  disciplinas$ = new BehaviorSubject<Disciplina[]>([]);

  fileExtensions$ = this.envioDeCotacaoService.fileExtensions$;

  private _selectedItemMenu$: BehaviorSubject<DisciplinaFilters>;
  selectedItemMenu$: Observable<DisciplinaFilters>;

  headerName: string;
  collapses = {};
  private _destroy$ = new Subject<void>();

  trackByDisciplina = trackByFactory<Disciplina>('idAtividade');
  trackByArquivo = trackByFactory<Arquivo>('idArquiteturaArquivo');
  trackBySite = trackByFactory<Site>('idCondominio');
  trackByBuilding = trackByFactory<Edificio>('idEdificio');
  trackByFloor = trackByFactory<Pavimento>('idPavimento');
  trackByString = trackByFactory<string>();

  selectItemMenu(menuItem: Partial<DisciplinaFilters>, headerName?: string): void {
    this.headerName = headerName;
    this._selectedItemMenu$.next({
      ...menuItem,
      idEtapa: this.etapa.idEtapa,
      idProjeto: this.idProjeto,
      idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
      idGrupo: this.grupo.idGrupo,
    });
  }

  toggleStage(): void {
    if (!this.form.get('statusFase').value) {
      this.form.get('showOnlyWithExtension').disable();
      this.form.get('showOnlySelected').disable();
    } else {
      this.form.get('showOnlyWithExtension').enable();
      this.form.get('showOnlySelected').enable();
    }
    this.envioDeCotacaoService
      .deactivateStage(this.etapa.idEtapa, this.idProjeto)
      .pipe(take(1))
      .subscribe(() => {
        this.etapa.ativo = !this.etapa.ativo;
      });
  }

  private listenToFilterChangesAndApply(): void {
    combineLatest([
      this.disciplinasService.disciplinas$,
      this.form.get('showOnlySelected').valueChanges.pipe(startWith(true)),
      this.form.get('showOnlyWithExtension').valueChanges.pipe(startWith(false)),
    ])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([disciplinas, showOnlySelected]) => {
        let payload = disciplinas;
        if (showOnlySelected) {
          payload = (payload ?? []).map(disciplina => ({
            ...disciplina,
            arquivos: (disciplina.arquivos ?? []).filter(arquivo => arquivo.arquivoSelecionado),
          }));
        }
        this.disciplinas$.next(payload.filter(d => d.arquivos.length));
      });
  }

  private _menuHasChanged(filters: DisciplinaFilters): void {
    if (this.etapa.quantidadeTotalArquivos && filters) {
      this.disciplinasService.applyFilters(this.idProjeto, filters);
    }
  }

  fileExtensionStatus($event: Extensao, ativo: boolean): void {
    this.envioDeCotacaoService
      .sendFileExtensionStatus(this.grupo.idOrcamento, {
        idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
        idExtensaoArquivo: $event.idExtensaoArquivo,
        ativo,
      })
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  ngOnInit(): void {
    this._selectedItemMenu$ = new BehaviorSubject<DisciplinaFilters>({
      idEtapa: this.etapa.idEtapa,
      idProjeto: this.idProjeto,
      idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
      idGrupo: this.grupo.idGrupo,
    });
    this.selectedItemMenu$ = this._selectedItemMenu$.asObservable().pipe(tap(filters => this._menuHasChanged(filters)));
    this.headerName = this.projetoService.getProjetoSnapshot()?.nomeProjeto;

    this.form = this.formBuilder.group({
      statusFase: this.formBuilder.control(!!this.etapa.ativo),
      showOnlySelected: this.formBuilder.control(true),
      showOnlyWithExtension: this.formBuilder.control(null),
    });

    // ouve e dispara as mudanças dos filtros no clique do menu lateral
    this.listenToFilterChangesAndApply();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
