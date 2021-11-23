import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CheckListIntegradoService } from './check-list-integrado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Cronogramas } from '@aw-models/cronogramas';
import { Spread } from '@grapecity/spread-sheets';
import { ColDef } from '@aw-utils/excel/excel';
import { coerceBooleanProperty, isNil, uniqBy } from '@aw-utils/utils';
import { CheckList, CheckLists } from '@aw-models/check-list';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { CliFuncao } from '@aw-models/funcao';
import { SpreadjsHelper } from '@aw-utils/excel/spreadjs-helper';
import { WorksheetAbstract } from '@aw-utils/excel/worksheet-abstract';
import { CheckListParticipante } from '@aw-models/check-list-participante';
import { CheckListCor, CheckListCorLinha, trackByCheckListCor } from '@aw-models/check-list-cor';
import { CliParticipanteService } from './cli-participante/cli-participante.service';
import { BehaviorSubject, concat, forkJoin, Observable, of, Subject } from 'rxjs';
import { CheckListStatus } from '@aw-models/check-list-status';
import { filter, finalize, map, startWith, takeUntil, tap } from 'rxjs/operators';
import { ObraFase, trackByObraFase } from '@aw-models/obra-fase';
import { CliObraFaseService } from './cli-obra-fase/cli-obra-fase.service';
import { CliCurvaFinanceiraService } from './cli-curva-financeira/cli-curva-financeira.service';
import { CurvaFinanceira, trackByCurvaFinanceira } from '@aw-models/curva-financeira';

@Component({
  selector: 'app-check-list-integrado',
  templateUrl: './check-list-integrado.component.html',
  styleUrls: ['./check-list-integrado.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckListIntegradoComponent implements OnInit, OnDestroy {
  constructor(
    private checkListIntegradoService: CheckListIntegradoService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private cliParticipanteService: CliParticipanteService,
    private cliObraFaseService: CliObraFaseService,
    private cliCurvaFinanceiraService: CliCurvaFinanceiraService
  ) {}

  private _destroy$ = new Subject();

  @ViewChild('zoom') zoomBar!: ElementRef<HTMLDivElement>;
  @ViewChildren(WorksheetAbstract) customWorksheets!: QueryList<WorksheetAbstract>;

  loading$ = new BehaviorSubject(false);
  cronogramas!: Cronogramas;
  checkLists!: CheckLists;
  participantes: CheckListParticipante[] = [];
  status: CheckListStatus[] = [];
  obraFases: ObraFase[] = [];
  curvaFinanceira: CurvaFinanceira[] = [];
  // Tem um guard para nao poder entrar na tela sem essa funcao
  funcao = atob(this.activatedRoute.snapshot.queryParamMap.get(RouteParamEnum.funcao)!) as CliFuncao;
  cores: CheckListCor[] = [];

  colCount = { cronogramas: 4, checkList: 9, participante: 6, obraFase: 9, curvaFinanceira: 7 };
  rowStart = { cronogramas: 3, checkList: 3, participante: 3, obraFase: 8, curvaFinanceira: 8 };
  color = {
    titleBorder: '#808080',
    cronogramaBackColor: '#a7b3bd',
    black: '#000000',
    nivel: '#bfbfbf',
    publicavel: '#70ad47',
    naoPublicavel: '#ff0000',
    backColorNA: '#bfbfbf',
    backColorConcluido: '#a9d08e',
    backColorAtrasado: '#c00000',
    backColorEmAndamento: '#b4c6e7',
    backColorAlerta: '#7030a0',
    backColorConcluidoComAtraso: '#fff08b',
    backColorEmAnalise: '#ffc000',
    white: '#ffffff',
    funcao: '#ffd966',
    notEditable: '#e3e3e3',
    transparent: 'transparent',
    backColorAgrupador: '#858a93',
  };
  border = {
    titleTop: new Spread.Sheets.LineBorder(this.color.titleBorder, Spread.Sheets.LineStyle.medium),
    cronograma: new Spread.Sheets.LineBorder(this.color.titleBorder, Spread.Sheets.LineStyle.thin),
    item: new Spread.Sheets.LineBorder(this.color.black, Spread.Sheets.LineStyle.dotted),
    nivelBottom: new Spread.Sheets.LineBorder(this.color.black, Spread.Sheets.LineStyle.thin),
    mediumBlack: new Spread.Sheets.LineBorder(this.color.black, Spread.Sheets.LineStyle.medium),
  };
  formatter = {
    date: 'dd/MM/yyyy',
    percent: SpreadjsHelper.resolveNumberFormat(2),
    valor: SpreadjsHelper.resolveNumberFormat(2),
    time: 'HH:mm',
  };
  font = {
    cronograma: SpreadjsHelper.resolveFont('bold', 12),
    nivel: SpreadjsHelper.resolveFont('bold', 8),
    publicavel: SpreadjsHelper.resolveFont('bold', 8),
    status: SpreadjsHelper.resolveFont('bold', 9),
  };

  hostStyle = { width: '100%', height: '100%', overflow: 'hidden', float: 'left' };
  sheetCronogramasNome = 'Cronogramas';
  sheetCheckListNome = 'Checklist';
  sheetParticipanteNome = 'Participantes';
  workbook!: Spread.Sheets.Workbook;
  // Index que começa as sheets de fases
  obraFaseIndexStartAt = 3;
  curvaFinanceiraIndexStartAt = 3;

  idProjeto = +(this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idProjeto) ?? 0);
  idProjetoCheckListIntegrado = +(
    this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idProjetoCheckListIntegrado) ?? 0
  );

  defaultColDef: Partial<ColDef<any>> = {
    width: 120,
    titleFont: SpreadjsHelper.resolveFont('normal', 8),
    titleBackColor: this.color.nivel,
    titleVAlign: Spread.Sheets.VerticalAlign.center,
    titleBorderTop: this.border.titleTop,
    border: { border: this.border.item, options: { top: true, bottom: true } },
    titleHAlign: Spread.Sheets.HorizontalAlign.center,
    backColor: this.color.notEditable,
  };

  fragment$ = this.activatedRoute.fragment;
  activeSheetIndex$!: Observable<number>;

  trackByCheckListCor = trackByCheckListCor;
  trackByObraFase = trackByObraFase;
  trackByCurvaFinanceira = trackByCurvaFinanceira;

  private _initDev(): void {
    // Só funciona com ng serve
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      (window as any).c = this;
      const publicado = this.activatedRoute.snapshot.queryParamMap.get('publicado');
      if (!isNil(publicado)) {
        this.checkLists.publicado = this.cronogramas.publicado = coerceBooleanProperty(publicado);
      }
      const publicadoGi = this.activatedRoute.snapshot.queryParamMap.get('publicadoGi');
      if (!isNil(publicadoGi)) {
        this.checkLists.publicadoGi = coerceBooleanProperty(publicadoGi);
      }
      const protectedParam = this.activatedRoute.snapshot.queryParamMap.get('protected');
      if (!isNil(protectedParam)) {
        const protectedValue = coerceBooleanProperty(protectedParam);
        for (const sheet of this.workbook.sheets) {
          sheet.options.isProtected = protectedValue;
        }
      }
      const contextMenu = this.activatedRoute.snapshot.queryParamMap.get('contextMenu');
      if (!isNil(contextMenu)) {
        this.workbook.options.allowContextMenu = coerceBooleanProperty(contextMenu);
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  async workbookInit({ spread }: { spread: Spread.Sheets.Workbook }): Promise<void> {
    this.workbook = spread;
    this._initDev();
    const fragmentActiveSheet = this.activatedRoute.snapshot.fragment;
    if (fragmentActiveSheet) {
      this.workbook.setActiveSheet(fragmentActiveSheet);
    }
    this.activeSheetChanged();
    this.activeSheetIndex$ = this.fragment$.pipe(map(() => this.workbook.getActiveSheetIndex()));
    this.changeDetectorRef.detectChanges();
    new Spread.Sheets.StatusBar.StatusBar(this.zoomBar.nativeElement).bind(this.workbook);
    (this.customWorksheets.changes as Observable<QueryList<WorksheetAbstract>>)
      .pipe(
        takeUntil(this._destroy$),
        startWith(this.customWorksheets),
        map(changes => changes.filter(change => !change.initialized)),
        filter(changes => !!changes.length)
      )
      .subscribe(worksheets => {
        for (const worksheet of worksheets) {
          worksheet.init(this.workbook);
        }
      });
  }

  montarCabecalho(sheet: Spread.Sheets.Worksheet, colCount: number, publicado?: boolean): void {
    const { nomeProjeto, numeroProjeto } = this.cronogramas;
    const { dataSemana } = this.checkLists;
    publicado ??= this.checkLists.publicado;
    sheet.addSpan(0, 1, 1, colCount);
    sheet
      .getRange(0, 1, 1, colCount)
      .text(`Projeto: ${numeroProjeto} ${nomeProjeto}`)
      .font(SpreadjsHelper.resolveFont('bold', 11));
    sheet.addSpan(1, 1, 1, colCount);
    sheet.getRange(1, 1, 1, colCount).text(`Data semana: ${dataSemana.toLocaleDateString()}`);
    sheet.addSpan(2, 1, 1, colCount);
    sheet.getRange(2, 1, 1, colCount).text(`Publicado: ${publicado ? 'Sim' : 'Não'}`);
  }

  setColTitles<T extends Record<any, any>>(helper: SpreadjsHelper<T>, row?: number): void {
    row ??= this.rowStart.cronogramas;
    for (const colDef of helper.colDefs) {
      const cell = helper.sheet.getCell(row, colDef.col).text(colDef.title).wordWrap(true);
      helper.setWidth(colDef).setVisible(colDef).setBorder(cell, colDef);
      if (colDef.titleBackColor) {
        cell.backColor(colDef.titleBackColor);
      }
      if (colDef.titleFont) {
        cell.font(colDef.titleFont);
      }
      if (colDef.titleVAlign) {
        cell.vAlign(colDef.titleVAlign);
      }
      if (colDef.titleHAlign) {
        cell.hAlign(colDef.titleHAlign);
      }
    }
  }

  montarLinhaTitle(
    sheet: Spread.Sheets.Worksheet,
    row: number,
    colCount: number,
    descricao: string,
    sequencia?: number
  ): Spread.Sheets.CellRange {
    let colStart = 1;
    if (!isNil(sequencia)) {
      colStart = 2;
      sheet.getCell(row, 1).value(sequencia).hAlign(Spread.Sheets.HorizontalAlign.center);
    }
    sheet.addSpan(row, colStart, 1, colCount);
    const range = sheet
      .getRange(row, 1, 1, colCount)
      .font(this.font.cronograma)
      .borderTop(this.border.cronograma)
      .borderBottom(this.border.cronograma)
      .backColor(this.color.cronogramaBackColor)
      .wordWrap(true);
    sheet.getRange(row, colStart, 1, colCount).text(descricao);
    sheet.autoFitRow(row);
    return range;
  }

  activeSheetChanged(): void {
    const activeSheet = this.workbook.getActiveSheet().name();
    this.customWorksheets.find(workwheet => workwheet.sheet.name() === activeSheet)?.activated?.();
    this.router
      .navigate([], { relativeTo: this.activatedRoute, fragment: activeSheet, queryParamsHandling: 'preserve' })
      .then();
  }

  checkChanged<T extends Record<any, any> & { _id: number }>(
    row: number,
    col: number,
    colDefMap: Map<any, ColDef<T>>,
    sheet: Spread.Sheets.Worksheet,
    itens: T[],
    newValue?: any
  ): [T, keyof T, any] | undefined {
    const colDef = colDefMap.get(col);
    if (!colDef) {
      return;
    }
    const property = colDef.id;
    if (!property) {
      return;
    }
    const idCell = sheet.getCell(row, 0);
    const id = idCell?.value();
    if (isNil(id)) {
      return;
    }
    const item = itens.find(_item => _item._id === id);
    if (!item) {
      return;
    }
    const cellValue = sheet.getCell(row, col);
    newValue ??= cellValue.value();
    if (item[property] === newValue) {
      cellValue.value(newValue);
      return;
    }
    sheet.autoFitRow(row);
    return [item, property, newValue];
  }

  onObraFaseChange($event: ObraFase): void {
    this.obraFases = this.obraFases.map(obraFase => {
      if ($event._id === obraFase._id) {
        obraFase = $event;
      }
      return obraFase;
    });
  }

  ngOnInit(): void {
    this.loading$.next(true);
    let checkLists$ = this.checkListIntegradoService.getCheckLists(this.idProjeto, this.idProjetoCheckListIntegrado);
    if (this.funcao === 'GI') {
      checkLists$ = checkLists$.pipe(
        map(checkLists => ({
          ...checkLists,
          agrupadorChecklist: checkLists.agrupadorChecklist
            .map(agrupador => ({
              ...agrupador,
              checklists: agrupador.checklists.filter(checkList => checkList.funcao === 1),
            }))
            .filter(agrupador => agrupador.checklists.length),
        }))
      );
    }
    checkLists$ = checkLists$.pipe(
      tap(checkLists => {
        this.checkLists = checkLists;
        this.cores = uniqBy(
          this.checkLists.agrupadorChecklist
            .reduce((acc: CheckList[], agrupador) => [...acc, ...agrupador.checklists], [])
            .map(checkList => ({
              id: checkList.idCheckListIntegradoCategoria,
              descricao: checkList.checkListIntegradoCategoria,
              cor: CheckListCorLinha.get(checkList.idCheckListIntegradoCategoria)!,
            })),
          'id'
        );
      })
    );
    const cronogramas$ = this.checkListIntegradoService.getCronogramas(this.idProjeto).pipe(
      tap(cronogramas => {
        this.cronogramas = cronogramas;
      })
    );
    const status$ = this.checkListIntegradoService.getStatus().pipe(
      tap(status => {
        this.status = status;
      })
    );
    const participantes$ = this.cliParticipanteService.get(this.idProjeto, this.idProjetoCheckListIntegrado).pipe(
      tap(participantes => {
        this.participantes = participantes;
      })
    );
    const obraFases$ = this.cliObraFaseService.get(this.idProjeto).pipe(
      tap(obraFases => {
        this.obraFases = obraFases;
        this.curvaFinanceiraIndexStartAt = this.curvaFinanceiraIndexStartAt + obraFases.length - 1;
      })
    );
    let curvaFinanceira$: Observable<CurvaFinanceira[]> = of([]);
    if (this.funcao === 'Gerencial') {
      curvaFinanceira$ = this.cliCurvaFinanceiraService.get(this.idProjeto, this.funcao).pipe(
        tap(curvaFinanceira => {
          this.curvaFinanceira = curvaFinanceira;
        })
      );
    }

    concat(cronogramas$, checkLists$, obraFases$, forkJoin([status$, participantes$]), curvaFinanceira$)
      .pipe(
        finalize(() => {
          this.loading$.next(false);
        })
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
