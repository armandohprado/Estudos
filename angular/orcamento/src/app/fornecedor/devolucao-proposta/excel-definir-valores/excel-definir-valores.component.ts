import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FasesListaProposta, InformacaoProposta, ListaProposta, PropostaItem } from './models/excel';
import { UnidadeMedidaQuery } from '@aw-services/unidade-medida/unidade-medida.query';
import { debounceTime, filter, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ExcelDefinirValoresService } from './excel-definir-valores.service';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { AdicionarOmisso, AtualizarItem, AtualizarQuantitativo } from '@aw-models/devolucao-proposta/atualizar-item';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { bloqueiaProduto } from '../../../grupo/definicao-escopo/shared/bloqueia-produto.pipe';
import { bloqueiaServico } from '../../../grupo/definicao-escopo/shared/bloqueia-servico.pipe';
import { FilaAtualizarPayload } from '@aw-models/devolucao-proposta/fila-atualizar';
import { upsert } from '@aw-utils/util';
import { Item } from '@aw-models/devolucao-proposta/item';
import { isArray, isEmpty, isFunction, isNil, isObject, minBy } from 'lodash-es';
import { catchAndThrow, refresh } from '@aw-utils/rxjs/operators';
import { Spread } from '@grapecity/spread-sheets';
import { SubFornecedor } from '@aw-models/devolucao-proposta/subfornecedor';
import { ActivatedRoute } from '@angular/router';
import { ColDef, ColDefValidatorFnArgs, CULTURE_EXCEL, FONT_EXCEL, numberFormat } from '@aw-utils/excel';

@Component({
  selector: 'app-excel-definir-valores',
  templateUrl: './excel-definir-valores.component.html',
  styleUrls: ['./excel-definir-valores.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExcelDefinirValoresComponent implements OnDestroy, AfterViewInit {
  constructor(
    private unidadeMedidaQuery: UnidadeMedidaQuery,
    private excelDefinirValoresService: ExcelDefinirValoresService,
    private devolucaoPropostaService: DevolucaoPropostaService,
    private dataDevolucaoPropostaService: DataDevolucaoPropostaService,
    private routerQuery: RouterQuery,
    private awDialogService: AwDialogService,
    private activatedRoute: ActivatedRoute
  ) {}

  private _destroy$ = new Subject<void>();

  private _2numberFormat = numberFormat(2);
  private _4numberFormat = numberFormat(4);
  private _normal10Calibri = FONT_EXCEL.normal['16'];
  private _bold10Calibri = FONT_EXCEL.bold['10'];
  private _bold12Calibri = FONT_EXCEL.bold['12'];
  private _bold16Calibri = FONT_EXCEL.bold['16'];
  private _bold20Calibri = FONT_EXCEL.bold['20'];

  color = { editable: '#e3e3e3' };

  hostStyle = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    float: 'left',
  };
  sheet!: Spread.Sheets.Worksheet;
  workbook!: Spread.Sheets.Workbook;
  subFornecedoresComboBox = new Spread.Sheets.CellTypes.ComboBox();
  unidadesMedidasComboBox = new Spread.Sheets.CellTypes.ComboBox();
  totalColunas = 23;
  totalColunasDescricao = 7;
  inicioTabela = 14;
  idProposta = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idDevolucaoProposta);
  idPavimento = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idPavimento);
  filaRequests$ = new BehaviorSubject<Partial<FilaAtualizarPayload>[]>([]);
  private _backLoading$ = new Subject<boolean>();
  backLoading$: Observable<boolean> = this._backLoading$.asObservable();
  private _saving = 0;

  @ViewChild('zoom') zoomBar!: ElementRef;

  subFornecedores: SubFornecedor[] = this.activatedRoute.snapshot.data.subFornecedores ?? [];
  informacaoProposta: InformacaoProposta = this.activatedRoute.snapshot.data.informacaoProposta ?? {};

  fases: FasesListaProposta[] = this.activatedRoute.snapshot.data.listaProposta ?? [];

  defaultColDef: Partial<ColDef<PropostaItem>> = {
    border: {
      border: new Spread.Sheets.LineBorder('#000', Spread.Sheets.LineStyle.thin),
      options: { all: true },
    },
    width: 120,
    widthSheetArea: Spread.Sheets.SheetArea.viewport,
  };

  private _colDefs: ColDef<PropostaItem>[] = [
    { id: 'idPropostaItemQuantitativo', nome: 'Id', col: 0 },
    { id: 'sequencia', nome: 'Sequência', col: 1, formatter: '@', width: 110 },
    {
      id: 'descricao',
      nome: 'Descrição',
      col: 2,
      locked: ({ item }) => (item.itemOmisso ? this.bloquearPlanilha : true),
      backColor: ({ item }) => (item.itemOmisso && !this.bloquearPlanilha ? this.color.editable : undefined),
      colSpan: 7,
      width: 130,
    },
    { col: 3, width: 20 },
    { col: 4, width: 100 },
    { col: 5, width: 130 },
    { col: 6, width: 20 },
    { col: 7, width: 100 },
    { col: 8, width: 130 },
    {
      id: 'observacao',
      nome: 'Observação',
      col: 9,
      locked: () => this.bloquearPlanilha,
      backColor: () => (!this.bloquearPlanilha ? this.color.editable : undefined),
      width: 120,
    },
    {
      id: 'unidadeMedida',
      nome: 'Unidade',
      col: 10,
      cellType: this.unidadesMedidasComboBox,
      locked: ({ item }) => (item.itemOmisso ? this.bloquearPlanilha : true),
      backColor: ({ item }) => (item.itemOmisso && !this.bloquearPlanilha ? this.color.editable : undefined),
    },
    {
      id: 'quantidade',
      nome: 'Quantidade',
      col: 11,
      locked: () => this.bloquearPlanilha,
      formatter: this._2numberFormat,
      backColor: () => (!this.bloquearPlanilha ? this.color.editable : undefined),
      comment: ({ item }) =>
        item.liberarQuantitativoReferencia
          ? {
              text: `Quantidade de referência: ${item.quantitativoReferencia}`,
              foreColor: '#000',
              fontSize: '18px',
              horizontalAlign: Spread.Sheets.HorizontalAlign.center,
              dynamicMove: true,
              autoSize: true,
              padding: new Spread.Sheets.Comments.Padding(2.5, 2.5, 2.5, 2.5),
              displayMode: Spread.Sheets.Comments.DisplayMode.hoverShown,
            }
          : undefined,
      validator: this.validatorNumeroNegativo,
      defaultValue: 0,
    },
    {
      id: 'produtoValorUnitario',
      nome: 'Valor\nunitário\nR$',
      col: 12,
      locked: () => this.bloquearPlanilha,
      formatter: this._2numberFormat,
      backColor: () => (!this.bloquearPlanilha ? this.color.editable : undefined),
      validator: this.validatorNumeroNegativo,
      defaultValue: 0,
    },
    {
      id: 'produtoPercentualDesconto',
      nome: 'Desconto\n%',
      col: 13,
      locked: () => this.bloquearPlanilha,
      formatter: this._4numberFormat,
      backColor: () => (!this.bloquearPlanilha ? this.color.editable : undefined),
      validator: this.validatorNumeroPercentual,
      defaultValue: 0,
    },
    {
      id: 'produtoDescontoUnidade',
      nome: 'Valor unitário\ncom desconto',
      col: 14,
      formatter: this._2numberFormat,
      formula: ({ row }) => {
        const linhaFormula = row + 1;
        return '=M' + linhaFormula + '-((M' + linhaFormula + '*N' + linhaFormula + ')/100)';
      },
    },
    {
      id: 'produtoSubTotal',
      nome: 'Sub total R$',
      col: 15,
      formatter: this._2numberFormat,
      formula: ({ row }) => {
        const linhaFormula = row + 1;
        return '=L' + linhaFormula + '*O' + linhaFormula;
      },
    },
    {
      id: 'produtoFornecedor',
      nome: 'Sub Fornecedor',
      col: 16,
      cellType: this.subFornecedoresComboBox,
      locked: () => this.bloquearPlanilha,
      backColor: () => (!this.bloquearPlanilha ? this.color.editable : undefined),
    },
    {
      id: 'servicoValorUnitario',
      nome: 'Valor \nunitário\nR$',
      col: 17,
      locked: () => this.bloquearPlanilha,
      formatter: this._2numberFormat,
      backColor: () => (!this.bloquearPlanilha ? this.color.editable : undefined),
      validator: this.validatorNumeroNegativo,
      defaultValue: 0,
    },
    {
      id: 'servicoPercentualDesconto',
      nome: 'Desconto \n%',
      col: 18,
      locked: () => this.bloquearPlanilha,
      formatter: this._4numberFormat,
      backColor: () => (!this.bloquearPlanilha ? this.color.editable : undefined),
      validator: this.validatorNumeroPercentual,
      defaultValue: 0,
    },
    {
      id: 'servicoDescontoUnidade',
      nome: 'Valor unitário \ncom desconto',
      col: 19,
      formatter: this._2numberFormat,
      formula: ({ row }) => {
        const linhaFormula = row + 1;
        return '=R' + linhaFormula + '-((R' + linhaFormula + '*S' + linhaFormula + ')/100)';
      },
    },
    {
      id: 'servicoSubTotal',
      nome: 'Sub total R$\n',
      col: 20,
      formatter: this._2numberFormat,
      formula: ({ row }) => {
        const linhaFormula = row + 1;
        return '=L' + linhaFormula + '*T' + linhaFormula;
      },
    },
    {
      id: 'servicoFornecedor',
      nome: 'Sub Fornecedor \n',
      col: 21,
      cellType: this.subFornecedoresComboBox,
      locked: () => this.bloquearPlanilha,
      backColor: () => (!this.bloquearPlanilha ? this.color.editable : undefined),
    },
    {
      id: 'total',
      nome: 'Total R$',
      col: 22,
      formatter: this._2numberFormat,
      formula: ({ row }) => {
        const linhaFormula = row + 1;
        return '=L' + linhaFormula + '*(O' + linhaFormula + '+T' + linhaFormula + ')';
      },
      width: 130,
    },
  ];

  private _colDefMap = this._mapColDefMap();

  private _keysSameValue: (keyof PropostaItem)[] = [
    'produtoValorUnitario',
    'servicoValorUnitario',
    'produtoPercentualDesconto',
    'servicoPercentualDesconto',
    'produtoFornecedor',
    'servicoFornecedor',
  ];

  private _atualizarAmbiente(
    idFaseTemp: number,
    idAmbienteTemp: number,
    update: (ambiente: ListaProposta) => ListaProposta
  ): void {
    this.fases = this.fases.map(fase => {
      if (fase.idFaseTemp === idFaseTemp) {
        fase = {
          ...fase,
          listaPropostas: fase.listaPropostas.map(ambiente => {
            if (ambiente.idAmbienteTemp === idAmbienteTemp) {
              ambiente = update(ambiente);
            }
            return ambiente;
          }),
        };
      }
      return fase;
    });
  }

  private _atualizarItem(
    idFaseTemp: number,
    idAmbienteTemp: number,
    idPropostaItemQuantitativo: number,
    partial: Partial<PropostaItem>
  ): void {
    this._atualizarAmbiente(idFaseTemp, idAmbienteTemp, ambiente => ({
      ...ambiente,
      itens: ambiente.itens.map(item => {
        if (item.idPropostaItemQuantitativo === idPropostaItemQuantitativo) {
          item = { ...item, ...partial };
        }
        return item;
      }),
    }));
  }

  private _addItem(idFaseTemp: number, idAmbienteTemp: number, item: PropostaItem): void {
    this._atualizarAmbiente(idFaseTemp, idAmbienteTemp, ambiente => ({
      ...ambiente,
      itens: [...ambiente.itens, item],
    }));
  }

  private _getPropostaItens(): PropostaItem[] {
    return this.fases.reduce((acc, fase) => {
      return [...acc, ...fase.listaPropostas.reduce((acc2, item) => [...acc2, ...item.itens], [] as PropostaItem[])];
    }, [] as PropostaItem[]);
  }

  private _getItem(idPropostaItemQuantitativo: number): PropostaItem | undefined {
    return this._getPropostaItens().find(item => item.idPropostaItemQuantitativo === idPropostaItemQuantitativo);
  }

  get colDefs(): ColDef<PropostaItem>[] {
    return this._colDefs.map(colDef => ({ ...this.defaultColDef, ...colDef }));
  }

  get bloquearPlanilha(): boolean {
    return this.devolucaoPropostaService.cabecalhoProposta.retornoProposta;
  }

  watchUpdates(): void {
    this.filaRequests$
      .pipe(
        debounceTime(1500),
        takeUntil(this._destroy$),
        takeUntil(this.backLoading$),
        filter(payloads => !!payloads.length),
        switchMap(payloads => {
          this.filaRequests$.next([]);
          return this.executarRequestsFila(payloads);
        }),
        catchAndThrow(() => {
          this.awDialogService.error('Algo deu errado, vamos tentar novamente!');
          this.watchUpdates();
        })
      )
      .subscribe();
  }

  updateFilaRequests(payload: Partial<FilaAtualizarPayload>): void {
    this.filaRequests$.next(
      upsert(this.filaRequests$.value, [payload], 'id', (valueA, valueB) => {
        return {
          ...valueA,
          ...valueB,
          item: {
            ...valueA?.item,
            ...valueB?.item,
          },
          quantitativo: {
            ...valueA?.quantitativo,
            ...valueB?.quantitativo,
          },
        };
      })
    );
  }

  ngAfterViewInit(): void {
    this.initZoomBar(this.zoomBar);
  }

  initZoomBar(element: ElementRef): void {
    const statusBar = new Spread.Sheets.StatusBar.StatusBar(element.nativeElement);
    this.sheet.zoom(0.75);
    statusBar.bind(this.workbook);
  }

  executarRequestsFila(payloads: Partial<FilaAtualizarPayload>[]): Observable<any> {
    this._saving++;
    return payloads
      .reduce((filaRequests, payload) => {
        let requests$ = of(null);
        if (payload.item && !isEmpty(payload.item)) {
          requests$ = requests$.pipe(refresh(this.atualizarPavimento(payload.item, payload.item.idPropostaItem)));
        }
        if (payload.quantitativo && !isEmpty(payload.quantitativo)) {
          requests$ = requests$.pipe(
            refresh(this.atualizarQuantitativo(payload.quantitativo.idPropostaItem, payload.quantitativo))
          );
        }
        return filaRequests.pipe(refresh(requests$));
      }, of(null))
      .pipe(
        finalize(() => {
          this._saving = Math.max(this._saving - 1, 0);
        })
      );
  }

  atualizarPavimento(payload: AtualizarItem, idPropostaItem: number): Observable<Item> {
    return this.dataDevolucaoPropostaService.atualizarPavimento(payload, idPropostaItem);
  }

  atualizarQuantitativo(idPropostaItem: number, payload: AtualizarQuantitativo): Observable<number[]> {
    return this.dataDevolucaoPropostaService.atualizarQuantitativo(idPropostaItem, [payload]);
  }

  workbookInit(args: any): void {
    this.unidadesMedidasComboBox.items(this.unidadeMedidaQuery.getAll().map(um => um.descricao));
    this.subFornecedoresComboBox.items(['', ...this.subFornecedores.map(sub => sub.nomeCnpj)]);
    this.watchUpdates();

    this.workbook = args.spread;
    this.sheet = this.workbook.getActiveSheet();

    this.configurarCabecalho();
    this.configurarValoresCabecalho();
    const fases = this.fases;
    this.configurarPlanilha(
      fases.reduce(
        (accFase, fase) =>
          accFase + 2 + fase.listaPropostas.reduce((accLista, lista) => accLista + 2 + lista.itens.length, 0),
        0
      )
    );
    this.sheet.suspendPaint();
    this.sheet.suspendEvent();

    const tituloProduto = this.sheet.getCell(this.inicioTabela - 1, 12);
    tituloProduto.text('Produto');
    tituloProduto.hAlign(Spread.Sheets.HorizontalAlign.center);
    tituloProduto.vAlign(Spread.Sheets.VerticalAlign.center);
    tituloProduto.font(this._bold16Calibri);
    this.sheet.addSpan(this.inicioTabela - 1, 12, 1, 5);
    this.sheet
      .getRange(this.inicioTabela - 1, 12, 1, 5)
      .setBorder(new Spread.Sheets.LineBorder('#000', Spread.Sheets.LineStyle.thin), { all: true });

    const tituloServico = this.sheet.getCell(this.inicioTabela - 1, 17);
    tituloServico.text('Serviço');
    tituloServico.hAlign(Spread.Sheets.HorizontalAlign.center);
    tituloServico.vAlign(Spread.Sheets.VerticalAlign.center);
    tituloServico.font(this._bold16Calibri);
    this.sheet.addSpan(this.inicioTabela - 1, 17, 1, 5);
    this.sheet
      .getRange(this.inicioTabela - 1, 17, 1, 5)
      .setBorder(new Spread.Sheets.LineBorder('#000', Spread.Sheets.LineStyle.thin), { all: true });

    const grupoItens = this.sheet.tables.add(
      'Grupos',
      this.inicioTabela,
      0,
      this.fases.length + 1,
      this.totalColunas,
      Spread.Sheets.Tables.TableThemes.light1
    );

    for (const colDef of this.colDefs) {
      const titulo = this.sheet.getCell(this.inicioTabela, colDef.col);
      titulo.text(colDef.nome);
      titulo.font(this._bold10Calibri);
      titulo.hAlign(Spread.Sheets.HorizontalAlign.center);
      titulo.vAlign(Spread.Sheets.VerticalAlign.center);
      titulo.setBorder(new Spread.Sheets.LineBorder('#000', Spread.Sheets.LineStyle.thin), { all: true });
      titulo.wordWrap(true);
      this.sheet.autoFitColumn(colDef.col);
      this.sheet.autoFitRow(this.inicioTabela);
      grupoItens.filterButtonVisible(colDef.col, false);
      this.setWidth(colDef);
    }

    // merge da coluna descrição
    this.sheet.addSpan(this.inicioTabela, 2, 1, this.totalColunasDescricao, Spread.Sheets.SheetArea.viewport);

    let linhaAtual = this.inicioTabela + 1;
    for (let faseIndex = 0; faseIndex < this.fases.length; faseIndex++) {
      const fase = this.fases[faseIndex];
      linhaAtual += faseIndex;
      this.adicionarLinha('Fase: ' + fase.nomeFase, linhaAtual + 1, 1);
      for (const ambiente of fase.listaPropostas) {
        linhaAtual += 2;
        this.adicionarLinha(ambiente.ambiente, linhaAtual, 1, '#ABADA9');
        const itens = ambiente.itens;
        for (const item of itens) {
          linhaAtual++;
          this.addLinha(linhaAtual, item);
        }

        linhaAtual++;
        this.adicionarBotaoItemOmisso(linhaAtual);
      }
    }
    this.sheet.resumePaint();
    this.sheet.resumeEvent();
  }

  addLinha(row: number, item: PropostaItem): void {
    for (const colDef of this.colDefs) {
      const { id, col, formatter, cellType, colSpan, border, formula, backColor, comment } = colDef;
      if (id) {
        const value = item[id];
        const cell = this.sheet.getCell(row, col);
        cell.value(value ?? '');
        cell.wordWrap(true);
        const isLocked = this._lockCell(row, colDef, item);
        if (!isLocked) {
          cell.cellType(cellType);
        }
        if (colSpan) {
          this.sheet.addSpan(row, col, 1, colSpan, Spread.Sheets.SheetArea.viewport);
        }
        if (border) {
          const borderObj = isFunction(border) ? border({ row, col, colDef, item }) : border;
          if (colSpan) {
            this.sheet.getRange(row, col, 1, colSpan).setBorder(borderObj.border, borderObj.options);
          } else {
            cell.setBorder(borderObj.border, borderObj.options);
          }
        }
        if (formula) {
          cell.formula(formula({ row, col, colDef, item }));
        }
        cell.formatter(formatter);
        if (backColor) {
          if (isFunction(backColor)) {
            cell.backColor(backColor({ colDef, col, item, row }));
          } else {
            cell.backColor(backColor);
          }
        }
        if (comment) {
          const commentOptions = isFunction(comment) ? comment({ col, colDef, item, row }) : comment;
          if (commentOptions) {
            const commentBox = new Spread.Sheets.Comments.Comment();
            for (const [option, optionArg] of Object.entries(commentOptions)) {
              commentBox[option](optionArg);
            }
            cell.comment(commentBox);
          }
        }
      }
    }
    this.sheet.autoFitRow(row);
  }

  private _lockCell(row: number, colDef: ColDef<PropostaItem>, item: PropostaItem): boolean {
    const { col, locked } = colDef;
    const cell = this.sheet.getCell(row, col);
    let isLocked: boolean | undefined;
    if (!isNil(locked)) {
      if (isFunction(locked)) {
        isLocked = locked({ row, col, item, colDef });
        cell.locked(isLocked);
      } else {
        isLocked = locked;
        cell.locked(isLocked);
      }
    }
    return isLocked ?? true;
  }

  configurarPlanilha(totalLinhas = 100): void {
    Spread.Common.CultureManager.addCultureInfo('pt-BR', CULTURE_EXCEL);
    Spread.Common.CultureManager.culture('pt-BR');

    this.sheet.name('Preenchimento Empreitada');
    this.sheet.setRowCount(totalLinhas + 50);
    this.sheet.setColumnCount(this.totalColunas);

    this.sheet.frozenColumnCount(9);
    this.sheet.frozenRowCount(15);
    this.sheet.options.isProtected = true;

    this.sheet.getCell(0, 0).visible(false);
    this.sheet.getRange(-1, 0, -1, 1).visible(false);

    this.sheet.rowOutlines.group(0, 4);
    this.sheet.rowOutlines.group(5, 8);
    if (bloqueiaProduto(this.devolucaoPropostaService.cabecalhoProposta.classificacao)) {
      this.bloquearProdutos();
      this.sheet.name('Preenchimento Serviços');
    } else if (bloqueiaServico(this.devolucaoPropostaService.cabecalhoProposta.classificacao)) {
      this.bloquearServicos();
      this.sheet.name('Preenchimento Produtos');
    }

    this.sheet.setRowVisible(10, false);
    this.sheet.setRowVisible(11, false);
  }

  setWidth({ col, width, widthSheetArea }: ColDef<PropostaItem>): void {
    if (width) {
      if (isArray(width)) {
        const [value, sheetArea] = width;
        this.sheet.setColumnWidth(col, value, sheetArea ?? widthSheetArea);
      } else if (isObject(width)) {
        const { value, sheetArea } = width;
        this.sheet.setColumnWidth(col, value, sheetArea ?? widthSheetArea);
      } else {
        this.sheet.setColumnWidth(col, width, widthSheetArea);
      }
    }
  }

  configurarCabecalho(): void {
    const titulo = this.sheet.getCell(0, 1);
    const grupo = this.sheet.getCell(2, 2);
    const {
      codigoGrupo,
      nomeGrupo,
      versaoProposta,
      idProposta,
      nomeFornecedor,
    } = this.devolucaoPropostaService.cabecalhoProposta;
    const proposta = this.sheet.getCell(3, 2);

    titulo.backColor('#ABADA9');
    titulo.foreColor('#fff');
    titulo.text('Orçamento');
    titulo.font(this._bold16Calibri);
    titulo.hAlign(Spread.Sheets.HorizontalAlign.center);
    titulo.vAlign(Spread.Sheets.VerticalAlign.center);
    this.sheet.addSpan(0, 1, 4, 1, Spread.Sheets.SheetArea.viewport);
    this.sheet.getCell(0, 2).text(nomeFornecedor);
    grupo.text('Grupo: ' + codigoGrupo + ' ' + nomeGrupo);
    grupo.font(this._bold20Calibri);
    this.sheet.setRowHeight(2, 30, Spread.Sheets.SheetArea.viewport);
    this.sheet.addSpan(2, 2, 1, this.totalColunas, Spread.Sheets.SheetArea.viewport);
    proposta.text('Proposta: ' + idProposta + ' V:' + versaoProposta);
    proposta.font(this._bold20Calibri);
    this.sheet.setRowHeight(3, 30, Spread.Sheets.SheetArea.viewport);
    this.sheet.addSpan(3, 2, 1, this.totalColunas, Spread.Sheets.SheetArea.viewport);

    const legenda = this.sheet.getCell(0, 9);
    legenda.hAlign(Spread.Sheets.HorizontalAlign.center);
    if (this.bloquearPlanilha) {
      legenda.text('Planilha bloqueada');
      legenda.backColor('#ff0000');
      legenda.foreColor('#ffffff');
    } else {
      legenda.text('Colunas editáveis');
      legenda.backColor(this.color.editable);
    }
    legenda.setBorder(new Spread.Sheets.LineBorder('#000', Spread.Sheets.LineStyle.thin), {
      all: true,
    });

    if (this.fases.some(fase => fase.liberarQuantitativo)) {
      const comment = new Spread.Sheets.Comments.Comment(`
    Os valores indicados com "+" são referenciais.\n
    É responsabilidade do fornecedor conferir nas plantas \n e documentos fornecidos e indicar os quantitativos do item, incluindo perdas \n se necessário. \n
    Caso confirme o valor de referência o fornecedor \n declara que se responsabiliza com a informação.`);
      comment.backColor('#f7bd00');
      comment.foreColor('#fff');
      comment.height(200);
      comment.width(500);
      comment.padding(15);
      comment.fontSize('18px');
      comment.displayMode(Spread.Sheets.Comments.DisplayMode.hoverShown);

      this.sheet.addSpan(0, 10, 2, 1);

      const commentCell = this.sheet.getCell(0, 10);
      commentCell.comment(comment);
      commentCell.wordWrap(true);
      comment.backColor('#f7bd00');
      commentCell.hAlign(Spread.Sheets.HorizontalAlign.center);
      commentCell.text(`Informações de quantidade`);
      commentCell.setBorder(new Spread.Sheets.LineBorder('#000', Spread.Sheets.LineStyle.thin), {
        top: true,
        right: true,
        left: true,
      });

      const commentCell2 = this.sheet.getCell(1, 10);
      commentCell2.setBorder(new Spread.Sheets.LineBorder('#000', Spread.Sheets.LineStyle.thin), {
        bottom: true,
        right: true,
        left: true,
      });
    }
  }

  configurarValoresCabecalho(): void {
    const valores = this.informacaoProposta;
    this.sheet.suspendPaint();
    this.sheet.suspendEvent();

    const lineStyle = Spread.Sheets.LineStyle.thick;
    const lineBorder = new Spread.Sheets.LineBorder('#000', lineStyle);
    const valoresAndares = this.sheet.getRange(5, 1, 5, this.totalColunas + 3);
    valoresAndares.setBorder(lineBorder, { top: true, bottom: true });
    valoresAndares.backColor('#D3D3D3');

    /* Andar atual */
    const andarAtual = this.sheet.getCell(5, 1);
    andarAtual.text(valores.andarAtual ?? '1º Andar');
    andarAtual.font(this._bold12Calibri);
    andarAtual.hAlign(Spread.Sheets.HorizontalAlign.center);
    andarAtual.vAlign(Spread.Sheets.VerticalAlign.center);
    this.sheet.addSpan(5, 1, 1, 2, Spread.Sheets.SheetArea.viewport);

    this.sheet.getCell(6, 1).text('Produto');
    const andarAtualProdutoValor = this.sheet.getCell(6, 2);
    andarAtualProdutoValor.formula('=SUM(P17:P' + this.sheet.getRowCount() + ')');
    andarAtualProdutoValor.formatter(this._2numberFormat);

    andarAtualProdutoValor.hAlign(Spread.Sheets.HorizontalAlign.right);

    this.sheet.getCell(7, 1).text('Serviço');
    const andarAtualServicoValor = this.sheet.getCell(7, 2);
    andarAtualServicoValor.formula('=SUM(U17:U' + this.sheet.getRowCount() + ')');
    andarAtualServicoValor.hAlign(Spread.Sheets.HorizontalAlign.right);
    andarAtualServicoValor.formatter(this._2numberFormat);

    const andarAtualTotal = this.sheet.getCell(8, 1);
    andarAtualTotal.text('Total');
    andarAtualTotal.backColor('#A6A6A6');
    andarAtualTotal.font(this._bold16Calibri);

    const andarAtualValorTotal = this.sheet.getCell(8, 2);
    andarAtualValorTotal.formula('=SUM(C7:C8)');
    andarAtualValorTotal.backColor('#A6A6A6');
    andarAtualValorTotal.font(this._bold16Calibri);
    andarAtualValorTotal.hAlign(Spread.Sheets.HorizontalAlign.right);
    andarAtualValorTotal.formatter(this._2numberFormat);

    const andarAtualDescontoProduto = this.sheet.getCell(10, 1);
    andarAtualDescontoProduto.text('Desconto produto');
    andarAtualDescontoProduto.font(this._normal10Calibri);

    const andarAtualDescontoProdutoValor = this.sheet.getCell(10, 2);
    andarAtualDescontoProdutoValor.formula('=SUM(N17:N' + this.sheet.getRowCount() + ')');
    andarAtualDescontoProdutoValor.formatter(this._2numberFormat);
    andarAtualDescontoProdutoValor.font(this._normal10Calibri);
    andarAtualDescontoProdutoValor.hAlign(Spread.Sheets.HorizontalAlign.right);

    const andarAtualDescontoServico = this.sheet.getCell(11, 1);
    andarAtualDescontoServico.text('Desconto serviço');
    andarAtualDescontoServico.font(this._normal10Calibri);

    const andarAtualDescontoServicoValor = this.sheet.getCell(11, 2);
    andarAtualDescontoServicoValor.formula('=SUM(S17:S' + this.sheet.getRowCount() + ')');
    andarAtualDescontoServicoValor.formatter(this._2numberFormat);
    andarAtualDescontoServicoValor.font(this._normal10Calibri);
    andarAtualDescontoServicoValor.hAlign(Spread.Sheets.HorizontalAlign.right);
    /* Andar atual */

    /* Outros andares */
    const outrosAndares = this.sheet.getCell(5, 4);
    outrosAndares.text('Outros Andares');
    outrosAndares.font(this._bold12Calibri);
    outrosAndares.hAlign(Spread.Sheets.HorizontalAlign.center);
    outrosAndares.vAlign(Spread.Sheets.VerticalAlign.center);
    this.sheet.addSpan(5, 4, 1, 2, Spread.Sheets.SheetArea.viewport);

    this.sheet.getCell(6, 4).text('Produto');
    this.sheet.getCell(6, 5).value(valores.valorProduto);
    this.sheet.getCell(6, 5).formatter(this._2numberFormat);

    this.sheet.getCell(7, 4).text('Serviço');
    this.sheet.getCell(7, 5).value(valores.valorServico);
    this.sheet.getCell(7, 5).formatter(this._2numberFormat);

    const outrosAndaresTotal = this.sheet.getCell(8, 4);
    outrosAndaresTotal.text('Total');
    outrosAndaresTotal.backColor('#A6A6A6');
    outrosAndaresTotal.font(this._bold16Calibri);

    const outrosAndaresValorTotal = this.sheet.getCell(8, 5);
    outrosAndaresValorTotal.formula('=F7+F8');
    outrosAndaresValorTotal.backColor('#A6A6A6');
    outrosAndaresValorTotal.formatter(this._2numberFormat);
    outrosAndaresValorTotal.font(this._bold16Calibri);

    const outrosAndaresDescontoProduto = this.sheet.getCell(10, 4);
    outrosAndaresDescontoProduto.text('Desconto produto');
    outrosAndaresDescontoProduto.font(this._normal10Calibri);

    const outrosAndaresDescontoProdutoValor = this.sheet.getCell(10, 5);
    outrosAndaresDescontoProdutoValor.value(valores.descontoProduto);
    outrosAndaresDescontoProdutoValor.formatter(this._2numberFormat);
    outrosAndaresDescontoProdutoValor.font(this._normal10Calibri);
    outrosAndaresDescontoProdutoValor.hAlign(Spread.Sheets.HorizontalAlign.right);

    const outrosAndaresDescontoServico = this.sheet.getCell(11, 4);
    outrosAndaresDescontoServico.text('Desconto serviço');
    outrosAndaresDescontoServico.font(this._normal10Calibri);

    const outrosAndaresDescontoServicoValor = this.sheet.getCell(11, 5);
    outrosAndaresDescontoServicoValor.value(valores.descontoServico);
    outrosAndaresDescontoServicoValor.formatter(this._2numberFormat);
    outrosAndaresDescontoServicoValor.font(this._normal10Calibri);
    outrosAndaresDescontoServicoValor.hAlign(Spread.Sheets.HorizontalAlign.right);
    /* Outros andares */

    /* Total grupo */
    const totalProposta = this.sheet.getCell(5, 7);
    totalProposta.text('Total Proposta');
    totalProposta.font(this._bold12Calibri);
    totalProposta.hAlign(Spread.Sheets.HorizontalAlign.center);
    totalProposta.vAlign(Spread.Sheets.VerticalAlign.center);
    this.sheet.addSpan(5, 7, 1, 2, Spread.Sheets.SheetArea.viewport);

    this.sheet.getCell(6, 7).text('Produto');
    this.sheet.getCell(6, 8).formula('=C7+F7');
    this.sheet.getCell(6, 8).formatter(this._2numberFormat);

    this.sheet.getCell(7, 7).text('Serviço');
    this.sheet.getCell(7, 8).formula('=C8+F8');
    this.sheet.getCell(7, 8).formatter(this._2numberFormat);

    const totalPropostaTotal = this.sheet.getCell(8, 7);
    totalPropostaTotal.text('Total');
    totalPropostaTotal.backColor('#A6A6A6');
    totalPropostaTotal.font(this._bold16Calibri);

    const totalPropostaValorTotal = this.sheet.getCell(8, 8);
    totalPropostaValorTotal.formula('=I7+I8');
    totalPropostaValorTotal.backColor('#A6A6A6');
    totalPropostaValorTotal.font(this._bold16Calibri);
    totalPropostaValorTotal.formatter(this._2numberFormat);

    const totalPropostaDescontoProduto = this.sheet.getCell(10, 7);
    totalPropostaDescontoProduto.text('Desconto produto');
    totalPropostaDescontoProduto.font(this._normal10Calibri);

    const totalPropostaDescontoProdutoValor = this.sheet.getCell(10, 8);
    totalPropostaDescontoProdutoValor.formula('=C11+F11');
    totalPropostaDescontoProdutoValor.formatter(this._2numberFormat);
    totalPropostaDescontoProdutoValor.font(this._normal10Calibri);
    totalPropostaDescontoProdutoValor.hAlign(Spread.Sheets.HorizontalAlign.right);

    const totalPropostaDescontoServico = this.sheet.getCell(11, 7);
    totalPropostaDescontoServico.text('Desconto serviço');
    totalPropostaDescontoServico.font(this._normal10Calibri);

    const totalPropostaDescontoServicoValor = this.sheet.getCell(11, 8);
    totalPropostaDescontoServicoValor.formula('=C12+F12');
    totalPropostaDescontoServicoValor.formatter(this._2numberFormat);
    totalPropostaDescontoServicoValor.font(this._normal10Calibri);
    totalPropostaDescontoServicoValor.hAlign(Spread.Sheets.HorizontalAlign.right);
    /* Total grupo */

    this.sheet.resumePaint();
    this.sheet.resumeEvent();
  }

  bloquearProdutos(): void {
    this.sheet.getRange(-1, 12, -1, 5).visible(false);
  }

  bloquearServicos(): void {
    this.sheet.getRange(-1, 17, -1, 5).visible(false);
  }

  adicionarLinha(titulo: string, numeroLinha: number, coluna: number, cor: string = '#808080'): void {
    const linha = this.sheet.getCell(numeroLinha, coluna);
    linha.text(titulo);
    linha.foreColor('#fff');
    this.sheet.addSpan(numeroLinha, coluna, 1, this.totalColunas, Spread.Sheets.SheetArea.viewport);
    this.sheet.getRange(numeroLinha, coluna, 1, this.totalColunas).backColor(cor);
  }

  adicionarBotaoItemOmisso(linhaAtual: number): void {
    const botaoItemOmisso = new Spread.Sheets.Style();
    botaoItemOmisso.cellButtons = [
      {
        position: Spread.Sheets.ButtonPosition.left,
        imageType: Spread.Sheets.ButtonImageType.plus,
        caption: 'Inserir omisso',
        width: 110,
        command: (sheet, row) => {
          this.sheet.suspendPaint();
          this.sheet.suspendEvent();

          const linha = row + 1;

          sheet.addRows(linha, 1);
          const idPropostaItemQuantitativo = this.sheet.getCell(row - 1, 0).value();

          const linhaRef = this._getItem(idPropostaItemQuantitativo);

          if (!linhaRef) {
            this.awDialogService.error('Erro ao tentar adicionar item omisso');
            return;
          }
          const idTemporario = this._getMinIdTemporario();
          this.sheet.getCell(linha, 0).value(idTemporario);
          const novoRegistro: PropostaItem = {
            idPropostaItemQuantitativo: idTemporario,
            idPropostaItem: 0,
            sequencia: '',
            tag: '',
            descricao: '',
            observacao: '',
            unidadeMedida: '',
            quantidade: 0,
            produtoValorUnitario: 0,
            produtoPercentualDesconto: 0,
            produtoDescontoUnidade: 0,
            produtoSubTotal: 0,
            produtoFornecedor: '',
            servicoValorUnitario: 0,
            servicoPercentualDesconto: 0,
            servicoDescontoUnidade: 0,
            servicoSubTotal: 0,
            servicoFornecedor: '',
            total: 0,
            quantitativoReferencia: 0,
            liberarQuantitativoReferencia: false,
            idFase: linhaRef.idFase,
            idProjetoCentroCusto: linhaRef.idProjetoCentroCusto,
            idProjetoEdificioPavimento: linhaRef.idProjetoEdificioPavimento,
            itemOmisso: true,
            idAmbienteTemp: linhaRef.idAmbienteTemp,
            idFaseTemp: linhaRef.idFaseTemp,
          };
          this._addItem(linhaRef.idFaseTemp, linhaRef.idAmbienteTemp, novoRegistro);
          this.addLinha(linha, novoRegistro);
          this.sheet.resumePaint();
          this.sheet.resumeEvent();
        },
      },
    ];

    this.sheet.addRows(linhaAtual, 1);
    this.sheet.setStyle(linhaAtual, 1, botaoItemOmisso);
    this.sheet.getCell(linhaAtual, 1).locked(this.bloquearPlanilha);
  }

  clipboardPasted({ cellRange: { col, colCount, rowCount, row } }: Spread.Sheets.IClipboardPastedEventArgs): void {
    for (let i = 0; i < colCount; i++) {
      const colI = col + i;
      for (let j = 0; j < rowCount; j++) {
        const rowI = row + j;
        this._changed(rowI, colI);
      }
    }
  }

  editEnded({ row, col }: Spread.Sheets.IEditEndedEventArgs): void {
    this._changed(row, col);
  }

  cellChanged({ row, col, isUndo, newValue }: Spread.Sheets.ICellChangedEventArgs): void {
    if (isUndo) {
      this._changed(row, col, newValue);
    }
  }

  rangeChanged($event: Spread.Sheets.IRangeChangedEventArgs): void {
    if ($event.action !== Spread.Sheets.RangeChangedAction.clear) {
      return;
    }
    for (const { row, col } of $event.changedCells) {
      const colDef = this._colDefMap.get(col);
      if (colDef && !isNil(colDef.defaultValue)) {
        const cell = this.sheet.getCell(row, col);
        const cellValue = cell.value();
        if (isNil(cellValue)) {
          cell.value(colDef.defaultValue);
        }
      }
      this._changed(row, col);
    }
  }

  private _changed(row: number, col: number, newValue?: any): void {
    if (row < this.inicioTabela) return;
    const colDef = this._colDefMap.get(col);
    if (!colDef) {
      return;
    }
    const property = colDef.id;
    if (!property) {
      return;
    }
    const idCell = this.sheet.getCell(row, 0);
    const id = idCell?.value();
    if (!id) {
      return;
    }
    const propostaItem = this._getItem(id);
    if (!propostaItem) {
      return;
    }
    newValue ??= this.sheet.getCell(row, col).value();
    if (colDef.validator) {
      newValue = colDef.validator({ col, value: newValue, colDef, item: propostaItem, row });
    }
    if (propostaItem[property] === newValue) {
      this.sheet.getCell(row, col).value(newValue);
      return;
    }
    const propostaItemAtualizado = { ...propostaItem, [property]: newValue };
    this._atualizarItem(propostaItem.idFaseTemp, propostaItem.idAmbienteTemp, id, propostaItemAtualizado);
    if (id > 0) {
      if (colDef.id === 'quantidade') {
        this._atualizarPropostaItemQuantitativo(propostaItemAtualizado);
      } else {
        this._atualizarPropostaItem(propostaItemAtualizado);
      }
      this._checkSamePropostaItem(propostaItemAtualizado, property, newValue, col);
    } else {
      const adicionarOmisso$ = this._adicionarOmisso(propostaItemAtualizado);
      if (adicionarOmisso$) {
        this.bloquearOmisso(row, true, propostaItem);
        adicionarOmisso$.subscribe(([itemOmisso, [idPropostaItemQuantitativo]]) => {
          this._atualizarItem(
            propostaItem.idFaseTemp,
            propostaItem.idAmbienteTemp,
            propostaItem.idPropostaItemQuantitativo,
            {
              idPropostaItemQuantitativo,
              sequencia: itemOmisso.numeracao,
              idPropostaItem: itemOmisso.idPropostaItem,
            }
          );
          idCell.value(idPropostaItemQuantitativo);
          this.sheet.getCell(row, 1).text(itemOmisso.numeracao);
          this.bloquearOmisso(row, false, {
            ...propostaItem,
            idPropostaItemQuantitativo,
            sequencia: itemOmisso.numeracao,
            idPropostaItem: itemOmisso.idPropostaItem,
          });
        });
      }
    }
  }

  bloquearOmisso(row: number, bloquear: boolean, item: PropostaItem): void {
    for (const colDef of this.colDefs) {
      this._lockCell(row, { ...colDef, locked: bloquear || colDef.locked }, item);
    }
    for (; row > this.inicioTabela; row--) {
      const cell = this.sheet.getStyle(row, 1);
      if (cell?.cellButtons?.length) {
        this.sheet.getCell(row, 1).locked(bloquear);
      }
    }
  }

  private _atualizarPropostaItem(linha: PropostaItem): void {
    this.updateFilaRequests({
      id: linha.idPropostaItemQuantitativo,
      item: {
        idProposta: this.devolucaoPropostaService.cabecalhoProposta.idProposta,
        idPropostaItem: linha.idPropostaItem,
        descricao: linha.descricao,
        observacao: linha.observacao,
        idProjetoEdificioPavimento: linha.idProjetoEdificioPavimento, // rota
        idUnidade: this.unidadeMedidaQuery.getNome(linha.unidadeMedida ?? '')?.idUnidadeMedida,
        idFornecedorSubProduto:
          this.subFornecedores.find(sub => sub.nomeCnpj === linha.produtoFornecedor)?.idFornecedorRelacionado ?? null,
        idFornecedorSubServico:
          this.subFornecedores.find(sub => sub.nomeCnpj === linha.servicoFornecedor)?.idFornecedorRelacionado ?? null,
        valorUnitarioProduto: linha.produtoValorUnitario,
        valorUnitarioServico: linha.servicoValorUnitario,
        descontoUnitarioProduto: linha.produtoPercentualDesconto,
        descontoUnitarioServico: linha.servicoPercentualDesconto,
        idPropostaItemStatus: 1,
      },
    });
  }

  private _atualizarPropostaItemQuantitativo(linha: PropostaItem): void {
    const atualizarQuantitativoPayload: AtualizarQuantitativo = {
      idPropostaItem: linha.idPropostaItem,
      idPropostaItemQuantitativo: linha.idPropostaItemQuantitativo,
      idProjetoCentroCusto: linha.idProjetoCentroCusto,
      idProjetoEdificioPavimento: linha.idProjetoEdificioPavimento,
      idFase: linha.idFase,
      idProposta: this.idProposta,
      quantidade: linha.quantidade,
      quantidadeOrcada: linha.quantidade,
    };
    this.updateFilaRequests({ id: linha.idPropostaItemQuantitativo, quantitativo: atualizarQuantitativoPayload });
  }

  private _adicionarOmisso(propostaItem: PropostaItem): Observable<[Item, number[]]> | void {
    if (
      propostaItem.descricao &&
      propostaItem.quantidade &&
      propostaItem.unidadeMedida &&
      (propostaItem.produtoValorUnitario || propostaItem.servicoValorUnitario) &&
      propostaItem.idPropostaItemQuantitativo < 0
    ) {
      const unidadeMedida = this.unidadeMedidaQuery.getNome(propostaItem.unidadeMedida);
      const adicionarOmisso: AdicionarOmisso = {
        descricao: propostaItem.descricao,
        idUnidade: unidadeMedida?.idUnidadeMedida,
        quantidade: +propostaItem.quantidade,
        observacao: propostaItem.observacao,
        valorUnitarioProduto: +propostaItem.produtoValorUnitario,
        descontoUnitarioProduto: +propostaItem.produtoDescontoUnidade,
        valorUnitarioServico: +propostaItem.servicoValorUnitario,
        descontoUnitarioServico: +propostaItem.servicoDescontoUnidade,
        idPropostaItemStatus: 1,
        idPropostaItem: 0,
        idProposta: this.idProposta,
      };
      return this.dataDevolucaoPropostaService.adicionarItemOmisso(adicionarOmisso, this.idProposta).pipe(
        switchMap(itemOmisso => {
          const payload = {
            quantidade: adicionarOmisso.quantidade,
            quantidadeOrcada: adicionarOmisso.quantidade,
            idProposta: this.idProposta,
            idPropostaItem: itemOmisso.idPropostaItem,
            idFase: propostaItem.idFase,
            idProjetoEdificioPavimento: propostaItem.idProjetoEdificioPavimento,
            idProjetoCentroCusto: propostaItem.idProjetoCentroCusto,
            idPropostaItemQuantitativo: 0,
          };
          return this.dataDevolucaoPropostaService
            .atualizarQuantitativo(itemOmisso.idPropostaItem, [payload])
            .pipe(map(ids => [itemOmisso, ids] as [Item, number[]]));
        })
      );
    }
  }

  private _mapColDefMap(): Map<number, ColDef<PropostaItem>> {
    return this.colDefs.reduce((acc, colDef) => acc.set(colDef.col, colDef), new Map<number, ColDef<PropostaItem>>());
  }

  private _getMinIdTemporario(): number {
    return Math.min(minBy(this._getPropostaItens(), 'idPropostaItemQuantitativo').idPropostaItemQuantitativo, 0) - 1;
  }

  private _checkSamePropostaItem(propostaItem: PropostaItem, property: string, newValue: any, col: number): void {
    if (!this._keysSameValue.includes(property as any)) {
      return;
    }
    const idPropostaItemQuantitativos = new Set<number>();
    for (const fase of this.fases) {
      for (const ambiente of fase.listaPropostas) {
        for (const item of ambiente.itens) {
          if (
            item.idPropostaItemQuantitativo !== propostaItem.idPropostaItemQuantitativo &&
            item.idPropostaItem === propostaItem.idPropostaItem
          ) {
            idPropostaItemQuantitativos.add(item.idPropostaItemQuantitativo);
            this._atualizarItem(item.idFaseTemp, item.idAmbienteTemp, item.idPropostaItemQuantitativo, {
              [property]: newValue,
            });
          }
        }
      }
    }
    const rowCount = this.sheet.getRowCount();
    for (let i = this.inicioTabela; i < rowCount; i++) {
      const cell = this.sheet.getCell(i, 0);
      const idPropostaItemQuantitativo = cell.value();
      if (idPropostaItemQuantitativos.has(idPropostaItemQuantitativo)) {
        this.sheet.getCell(i, col).value(newValue);
      }
    }
  }

  voltar(): Observable<any> {
    let request$ = of(true);
    if (this.filaRequests$.value.length) {
      this._backLoading$.next(true);
      request$ = this.executarRequestsFila(this.filaRequests$.value).pipe(
        finalize(() => {
          this._backLoading$.next(false);
        })
      );
    }
    return request$;
  }

  validatorNumeroNegativo({ value, colDef, item }: ColDefValidatorFnArgs<PropostaItem>): number {
    if (value < 0) {
      alert('Não é possível incluir números negativos!');
      return item[colDef.id] as number;
    }
    return value;
  }

  validatorNumeroPercentual({ value, colDef, item }: ColDefValidatorFnArgs<PropostaItem>): number {
    if (value < 0 || value > 100) {
      alert('É possível incluir números entre 0 e 100!');
      return item[colDef.id] as number;
    }
    return value;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
