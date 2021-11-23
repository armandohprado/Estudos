import { Directive, EventEmitter, Host, Inject, Input, OnDestroy, Output, Self } from '@angular/core';
import { WorksheetAbstract } from '@aw-utils/excel/worksheet-abstract';
import { WorksheetComponent } from '@grapecity/spread-sheets-angular';
import { Spread } from '@grapecity/spread-sheets';
import {
  CheckListStatus,
  CheckListStatusDescricaoEnum,
  CheckListStatusEnum,
  CheckListTipoStatusEnum,
} from '@aw-models/check-list-status';
import {
  CheckList,
  CheckListAgrupador,
  CheckListColumnType,
  CheckListNivel,
  CheckListNivelItem,
  CheckListNivelItemAtualizarPayload,
  CheckLists,
  CheckListWithColumnType,
} from '@aw-models/check-list';
import { CliFuncao } from '@aw-models/funcao';
import { BehaviorSubject, concat, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CheckListParticipante } from '@aw-models/check-list-participante';
import { CheckListParticipanteStatusEnum } from '@aw-models/check-list-participante-status';
import { WINDOW_TOKEN } from '../../tokens/window';
import { isDate, isFunction, isNil, upsert } from '@aw-utils/utils';
import { ColDef } from '@aw-utils/excel/excel';
import { SpreadjsHelper } from '@aw-utils/excel/spreadjs-helper';
import { CheckListCorLinha } from '@aw-models/check-list-cor';
import { debounceTime, filter, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { CheckListIntegradoComponent } from '../check-list-integrado.component';
import { CheckListIntegradoService } from '../check-list-integrado.service';
import { getUid, resolvePredicates } from '../util';
import { SvgPathCellType } from '@aw-utils/excel/svg-path-cell-type/svg-path-cell-type';

@Directive({
  selector: 'gc-worksheet[appCliCheckLists]',
  providers: [{ provide: WorksheetAbstract, useExisting: CliCheckListsDirective }],
})
export class CliCheckListsDirective extends WorksheetAbstract implements OnDestroy, CheckListWithColumnType {
  constructor(
    @Self() worksheetComponent: WorksheetComponent,
    @Host() private checkListIntegradoComponent: CheckListIntegradoComponent,
    private checkListIntegradoService: CheckListIntegradoService,
    private activatedRoute: ActivatedRoute,
    @Inject(WINDOW_TOKEN) private window: Window
  ) {
    super(worksheetComponent);
  }

  private _filaCheckList$ = new BehaviorSubject<CheckListNivelItemAtualizarPayload[]>([]);
  private _status: CheckListStatus[] = [];

  @Input() idProjetoCheckListIntegrado!: number;
  @Input() idProjeto!: number;
  @Input() funcao!: CliFuncao;
  @Input() rowStart!: number;
  @Input() checkLists!: CheckLists;

  @Input()
  set status(statusList: CheckListStatus[]) {
    this._status = statusList;
    this.statusChecklistComboBox.items(
      statusList
        .filter(status =>
          [CheckListTipoStatusEnum.Comum, CheckListTipoStatusEnum.Checklist].includes(status.idCheckListTipoStatus)
        )
        .map(({ id, descricao }) => ({ value: id, text: descricao }))
    );
    this.statusChangeOrderComboBox.items(
      statusList
        .filter(status =>
          [CheckListTipoStatusEnum.Comum, CheckListTipoStatusEnum.ChangeOrder].includes(status.idCheckListTipoStatus)
        )
        .map(({ id, descricao }) => ({ value: id, text: descricao }))
    );
  }

  @Input()
  set participantes(participantes: CheckListParticipante[]) {
    const participantesPresentesCientes = participantes
      .filter(participante =>
        [CheckListParticipanteStatusEnum.Presente, CheckListParticipanteStatusEnum.Ciente].includes(
          participante.idCheckListParticipanteStatus
        )
      )
      .map(participante => participante.nome);
    this.participantesComboBox.items(['', ...participantesPresentesCientes]);
  }

  @Output() readonly checkListsChange = new EventEmitter<CheckLists>();

  get niveis(): CheckListNivel[] {
    return this.checkLists.agrupadorChecklist.reduce(
      (accAgrupador, agrupador) => [
        ...accAgrupador,
        ...agrupador.checklists.reduce(
          (accCheckList, checkList) => [...accCheckList, ...checkList.niveis],
          [] as CheckListNivel[]
        ),
      ],
      [] as CheckListNivel[]
    );
  }
  get itens(): CheckListNivelItem[] {
    return this.niveis.reduce((acc, nivel) => [...acc, ...nivel.itens], [] as CheckListNivelItem[]);
  }

  savingNewItens = 0;

  statusChecklistComboBox = new Spread.Sheets.CellTypes.ComboBox().editorValueType(
    Spread.Sheets.CellTypes.EditorValueType.value
  );
  statusChangeOrderComboBox = new Spread.Sheets.CellTypes.ComboBox().editorValueType(
    Spread.Sheets.CellTypes.EditorValueType.value
  );

  participantesComboBox = new Spread.Sheets.CellTypes.ComboBox();

  // Não alterar os nomes das propriedades abaixo, elas são acessadas dinamicamente
  itensColDef = this._generateColDefs(CheckListColumnType.Itens);
  metaColDef = this._generateColDefs(CheckListColumnType.Meta);
  changeOrderColDef = this._generateColDefs(CheckListColumnType.ChangeOrder);
  itensHelper!: SpreadjsHelper<CheckListNivelItem>;
  metaHelper!: SpreadjsHelper<CheckListNivelItem>;
  changeOrderHelper!: SpreadjsHelper<CheckListNivelItem>;

  private _colDefLockedColor(condition: boolean): string | undefined {
    const { color } = this.checkListIntegradoComponent;
    return condition ? color.notEditable : color.white;
  }

  private _generateColDefs(tipo: CheckListColumnType): ColDef<CheckListNivelItem>[] {
    const { formatter, color, font } = this.checkListIntegradoComponent;
    const acaoColumn: ColDef<CheckListNivelItem> = {
      id: 'acao',
      title: 'AÇÃO',
      locked: ({ item }) => item.bloquearAcao || this._bloqueioPadraoCheckList(item),
      backColor: 'fromLocked',
      width: 260,
    };
    const dataPrevistaColumn: ColDef<CheckListNivelItem> = {
      id: 'dataPrevista',
      title: 'DATA PREVISTA',
      formatter: formatter.date,
      datePicker: true,
      locked: ({ item }) => item.bloquearDataPrevista || this._bloqueioPadraoCheckList(item),
      backColor: 'fromLocked',
    };
    const responsavelColumn: ColDef<CheckListNivelItem> = {
      id: 'responsavel',
      title: 'RESPONSÁVEL',
      locked: ({ item }) => item.bloquearResponsavel || this._bloqueioPadraoCheckList(item),
      backColor: 'fromLocked',
      cellType: this.participantesComboBox,
    };
    switch (tipo) {
      case CheckListColumnType.Meta: {
        // Se for META, a coluna de Ação vira percentual previsto
        acaoColumn.id = 'percentualPrevisto';
        acaoColumn.title = '% PREVISTO';
        acaoColumn.locked = ({ item }) => item.bloquearPercentualPrevisto || this._bloqueioPadraoCheckList(item);
        acaoColumn.formatter = formatter.percent;

        // A coluna de Data prevista vira percentual realizado
        dataPrevistaColumn.id = 'percentualRealizado';
        dataPrevistaColumn.title = '% REALIZADO';
        dataPrevistaColumn.formatter = formatter.percent;
        dataPrevistaColumn.datePicker = false;
        dataPrevistaColumn.locked = ({ item }) => item.bloquearDataPrevista || this._bloqueioPadraoCheckList(item);

        // E a coluna de responsavel não exibe nada
        responsavelColumn.title = '';
        responsavelColumn.cellType = undefined;
        break;
      }
      case CheckListColumnType.ChangeOrder: {
        // Se for Change order, a coluna de Ação vira coluna de valor
        acaoColumn.id = 'valor';
        acaoColumn.title = 'VALOR';
        acaoColumn.locked = ({ item }) => item.bloquearValor || this._bloqueioPadraoCheckList(item);
        acaoColumn.formatter = formatter.valor;
        break;
      }
      default: {
        break;
      }
    }
    const colDefs: ColDef<CheckListNivelItem>[] = [
      {
        id: '_id',
        title: 'Id',
        visible: false,
      },
      {
        id: '_button',
        title: 'SEQ',
        width: 30,
        buttons: [
          {
            imageType: Spread.Sheets.ButtonImageType.clear,
            useButtonStyle: true,
            command: (_, row) => this._deleteCheckListNivelItem(row),
          },
        ],
        locked: ({ item }) => this._bloqueioItemInserido(item),
      },
      {
        id: 'visivel',
        width: 30,
        cellType: new SvgPathCellType(SvgPathCellType.eyeConfig),
        customCellType: true,
      },
      {
        id: 'descricao',
        title: 'DESCRIÇÃO',
        width: 400,
        titleHAlign: Spread.Sheets.HorizontalAlign.general,
        locked: ({ item }) => this._bloqueioItemInserido(item),
        backColor: 'fromLocked',
        hyperLink: ['url', {}],
      },
      acaoColumn,
      dataPrevistaColumn,
      responsavelColumn,
      {
        id: 'observacoes',
        title: 'OBSERVAÇÕES',
        locked: ({ item }) => item.bloquearObservacoes || this._bloqueioPadraoCheckList(item),
        backColor: 'fromLocked',
        width: 290,
        timepicker: ({ item }) => (item.tipoHorario ? { formatString: 'HH:mm', step: { minute: 15 } } : undefined),
        formatter: ({ item }) => (item.tipoHorario ? formatter.time : undefined),
        hAlign: ({ item }) => (item.tipoHorario ? Spread.Sheets.HorizontalAlign.center : undefined),
      },
      {
        id: 'idCheckListStatus',
        title: 'STATUS',
        cellType:
          tipo === CheckListColumnType.ChangeOrder ? this.statusChangeOrderComboBox : this.statusChecklistComboBox,
        locked: ({ item }) => item.bloquearStatus || this._bloqueioPadraoCheckList(item),
        font: this.checkListIntegradoComponent.font.status,
        hAlign: Spread.Sheets.HorizontalAlign.center,
        conditionalColor: {
          [CheckListStatusEnum.NA]: { backColor: color.backColorNA },
          [CheckListStatusEnum.Concluido]: { backColor: color.backColorConcluido },
          [CheckListStatusEnum.Atrasado]: { backColor: color.backColorAtrasado, foreColor: color.white },
          [CheckListStatusEnum.EmAndamento]: { backColor: color.backColorEmAndamento },
          [CheckListStatusEnum.Alerta]: { backColor: color.backColorAlerta, foreColor: color.white },
          [CheckListStatusEnum.ConcluidoComAtraso]: { backColor: color.backColorConcluidoComAtraso },
          [CheckListStatusEnum.Aprovada]: { backColor: color.backColorConcluido },
          [CheckListStatusEnum.NaoAprovada]: { backColor: color.backColorAtrasado, foreColor: color.white },
          [CheckListStatusEnum.EmAnalise]: { backColor: color.backColorEmAnalise },
        },
        vAlign: Spread.Sheets.VerticalAlign.center,
        width: 140,
        defaultValue: CheckListStatusEnum.NA,
      },
      {
        id: 'publicavelDescricao',
        title: 'PUBLICÁVEL NO COMUNICADO SEMANAL?',
        width: 230,
        foreColor: ({ item }) => (item.publicavelComunicado ? color.publicavel : color.naoPublicavel),
        font: font.publicavel,
        hAlign: Spread.Sheets.HorizontalAlign.center,
        vAlign: Spread.Sheets.VerticalAlign.center,
      },
    ];
    return colDefs.map(_colDef => {
      if (isFunction(_colDef.locked) && _colDef.backColor === 'fromLocked') {
        const lockedFn = _colDef.locked;
        _colDef.backColor = ({ row, col, colDef, item }) =>
          this._colDefLockedColor(lockedFn({ row, col, colDef, item }));
      }
      return _colDef;
    });
  }

  private _getNivel(
    _idCheckListAgrupador: number,
    _idCheckList: number,
    _idCheckListNivel: number
  ): CheckListNivel | undefined {
    return this.checkLists.agrupadorChecklist
      .find(agrupador => agrupador._id === _idCheckListAgrupador)
      ?.checklists.find(checkList => checkList._id === _idCheckList)
      ?.niveis.find(nivel => nivel._id === _idCheckListNivel);
  }

  private _resolvePredicates<T extends { _id: number }>(
    _id: number | ((checkList: T) => boolean),
    partial: Partial<T> | ((checkList: T) => T)
  ): { predicate: (entity: T) => boolean; update: (entity: T) => T } {
    return resolvePredicates(_id, partial);
  }

  private _setCheckLists(checkLists: CheckLists | ((checkLists: CheckLists) => CheckLists)): void {
    const update = isFunction(checkLists) ? checkLists : () => checkLists;
    this.checkLists = update(this.checkLists);
    this.checkListsChange.emit(this.checkLists);
  }

  private _updateAgrupador(
    _id: number | ((agrupador: CheckListAgrupador) => boolean),
    partial: Partial<CheckListAgrupador> | ((agrupador: CheckListAgrupador) => CheckListAgrupador)
  ): void {
    const { predicate, update } = this._resolvePredicates(_id, partial);
    this._setCheckLists(checkLists => ({
      ...checkLists,
      agrupadorChecklist: checkLists.agrupadorChecklist.map(agrupador => {
        if (predicate(agrupador)) {
          agrupador = update(agrupador);
        }
        return agrupador;
      }),
    }));
  }

  private _updateCheckList(
    _idCheckListAgrupador: number | ((agrupador: CheckListAgrupador) => boolean),
    _id: number | ((checkList: CheckList) => boolean),
    partial: Partial<CheckList> | ((checkList: CheckList) => CheckList)
  ): void {
    const { predicate, update } = this._resolvePredicates(_id, partial);
    this._updateAgrupador(_idCheckListAgrupador, agrupador => ({
      ...agrupador,
      checklists: agrupador.checklists.map(checkList => {
        if (predicate(checkList)) {
          checkList = update(checkList);
        }
        return checkList;
      }),
    }));
  }

  private _updateCheckListNivel(
    _idCheckListAgrupador: number | ((agrupador: CheckListAgrupador) => boolean),
    _idCheckList: number | ((checkList: CheckList) => boolean),
    _id: number | ((nivel: CheckListNivel) => boolean),
    partial: Partial<CheckListNivel> | ((nivel: CheckListNivel) => CheckListNivel)
  ): void {
    const { predicate, update } = this._resolvePredicates(_id, partial);
    this._updateCheckList(_idCheckListAgrupador, _idCheckList, checkList => ({
      ...checkList,
      niveis: checkList.niveis.map(nivel => {
        if (predicate(nivel)) {
          nivel = update(nivel);
        }
        return nivel;
      }),
    }));
  }

  private _updateCheckListNivelItem(
    _idCheckListAgrupador: number | ((agrupador: CheckListAgrupador) => boolean),
    _idCheckList: number | ((checkList: CheckList) => boolean),
    _idCheckListNivel: number | ((nivel: CheckListNivel) => boolean),
    _id: number | ((item: CheckListNivelItem) => boolean),
    partial: Partial<CheckListNivelItem> | ((item: CheckListNivelItem) => CheckListNivelItem)
  ): void {
    const { predicate, update } = this._resolvePredicates(_id, partial);
    this._updateCheckListNivel(_idCheckListAgrupador, _idCheckList, _idCheckListNivel, nivel => ({
      ...nivel,
      itens: nivel.itens.map(item => {
        if (predicate(item)) {
          item = update(item);
        }
        return item;
      }),
    }));
  }

  private _bloqueioGerencial(funcao: number): boolean {
    return funcao === 1 && (this.funcao === 'Gerencial' || (this.funcao === 'GI' && this.checkLists.publicadoGi));
  }

  private _bloqueioPadraoCheckList(item: CheckListNivelItem): boolean {
    return (
      this.checkLists.publicado || !item.idProjetoCheckListIntegradoNivelItem || this._bloqueioGerencial(item.funcao)
    );
  }

  private _bloqueioItemInserido(item: CheckListNivelItem): boolean {
    return (
      !!item.idCheckListIntegradoNivelItem ||
      !!item.url ||
      this.checkLists.publicado ||
      this._bloqueioGerencial(item.funcao)
    );
  }

  private _bloquearButtons(bloquear: boolean): void {
    if (bloquear) {
      this.itensHelper.lockButtons(1, bloquear);
    } else {
      for (const nivel of this.niveis) {
        const cellNivel = this.sheet.getCell(nivel._row, 1);
        if (cellNivel.cellButtons()?.length) {
          cellNivel.locked(bloquear);
        }
        this._checkMaxItensNivel(nivel._idCheckListAgrupador, nivel._idCheckList, nivel._id);
        for (const item of nivel.itens) {
          const cell = this.sheet.getCell(item._row, 1);
          if (cell.cellButtons()?.length) {
            cell.locked(bloquear);
          }
        }
      }
    }
  }

  private _getCheckboxMostrarItensOcultosValue(): boolean {
    return this.sheet.getValue(0, 6);
  }

  private _setHeader(): void {
    this.checkListIntegradoComponent.montarCabecalho(this.sheet, this.colCount, this.checkLists.publicado);
    this.sheet.removeSpan(0, 1);
    this.sheet.addSpan(0, 1, 1, 5);
    this.sheet.addSpan(0, 6, 1, 3);
    this.sheet
      .getRange(0, 6, 1, 3)
      .text('')
      .cellType(
        new Spread.Sheets.CellTypes.CheckBox().textTrue('Mostrar itens ocultos').textFalse('Mostrar itens ocultos')
      )
      .locked(false);
    this.listenToChanges(0, 6)
      .pipe(takeUntil(this._destroy$))
      .subscribe(visible => {
        this.itensHelper.executeSuspended(
          () => {
            this.toggleItensVisiveis(visible);
          },
          { paint: true, event: true }
        );
      });
  }

  private _setHeaders(row: number, helper: SpreadjsHelper<CheckListNivelItem>): void {
    this.checkListIntegradoComponent.setColTitles(helper, row);
  }

  private _watchFileCheckList(): void {
    this._filaCheckList$
      .pipe(
        debounceTime(1000),
        takeUntil(this._destroy$),
        filter(payloads => !!payloads.length),
        map(payloads =>
          payloads.map(payload => {
            if (isDate(payload.observacoes)) {
              const hours = ('' + payload.observacoes.getHours()).padStart(2, '0');
              const minutes = ('' + payload.observacoes.getMinutes()).padEnd(2, '0');
              payload = { ...payload, observacoes: `${hours}:${minutes}` };
            }
            return payload;
          })
        ),
        switchMap(payloads => {
          this._filaCheckList$.next([]);
          return this._atualizarCheckListItens(payloads);
        }),
        catchAndThrow(() => {
          alert('Ocorreu um erro ao tentar salvar as últimas alterações');
          this._watchFileCheckList();
        })
      )
      .subscribe();
  }

  private _updateFilaCheckList(payload: CheckListNivelItemAtualizarPayload): void {
    this._filaCheckList$.next(upsert(this._filaCheckList$.value, payload, 'idProjetoCheckListIntegradoNivelItem'));
  }

  private _atualizarCheckListItens(payloads: CheckListNivelItemAtualizarPayload[]): Observable<void> {
    return concat(...payloads.map(payload => this.checkListIntegradoService.putCheckListItem(payload)));
  }

  private _checkMaxItensNivel(_idCheckListAgrupador: number, _idCheckList: number, _idCheckListNivel: number): void {
    const nivel = this._getNivel(_idCheckListAgrupador, _idCheckList, _idCheckListNivel);
    if (!nivel || isNil(nivel.maxItens)) {
      return;
    }
    const cell = this.sheet.getCell(nivel._row, 1);
    const button = cell.cellButtons()?.[0];
    if (!button) {
      return;
    }
    button.enabled = nivel.itens.length < nivel.maxItens;
    cell.cellButtons([button]);
    cell.locked(!button.enabled);
  }

  private _addCheckListNivelItemLinha(
    rowNivel: number,
    _idCheckListAgrupador: number,
    _idCheckList: number,
    _idCheckListNivel: number
  ): void {
    const nivel = this._getNivel(_idCheckListAgrupador, _idCheckList, _idCheckListNivel);
    if (!nivel) {
      return;
    }
    const helper = this[nivel.helperKey];
    const row = rowNivel + nivel.itens.length + 1;
    this.sheet.addRows(row, 1);
    const uid = getUid();
    const item: CheckListNivelItem = {
      _id: uid,
      _idCheckList,
      _idCheckListNivel,
      _idCheckListAgrupador: nivel._idCheckListAgrupador,
      bloquearStatus: nivel.bloquearStatus,
      bloquearAcao: nivel.bloquearAcao,
      bloquearObservacoes: nivel.bloquearObservacoes,
      bloquearResponsavel: nivel.bloquearResponsavel,
      bloquearDataPrevista: nivel.bloquearDataPrevista,
      publicavelComunicado: nivel.publicavelComunicado,
      publicavelDescricao: nivel.publicavelDescricao,
      idCheckListStatus: this._status[0]?.id ?? 1,
      idProjetoCheckListIntegradoNivelItem: 0,
      idCheckListIntegradoNivel: nivel.idCheckListIntegradoNivel,
      idProjetoCheckListIntegrado: nivel.idProjetoCheckListIntegrado,
      status: this._status[0]?.descricao ?? 'NA',
      descricao: '',
      idCheckListIntegradoNivelItem: null,
      funcao: nivel.funcao,
      _row: -1,
      tipoHorario: nivel.tipoHorario,
      bloquearPercentualPrevisto: nivel.bloquearPercentualPrevisto,
      bloquearPercentualRealizado: nivel.bloquearPercentualRealizado,
      bloquearValor: nivel.bloquearValor,
      helperKey: nivel.helperKey,
      columnType: nivel.columnType,
      colDefKey: nivel.colDefKey,
      visivel: true,
    };
    this._updateCheckListNivel(_idCheckListAgrupador, _idCheckList, _idCheckListNivel, _nivel => ({
      ..._nivel,
      itens: [..._nivel.itens, item],
    }));
    helper.executeSuspended(
      () => {
        helper.setRow(row, item);
        this.sheet.setRowHeight(row, 22);
        this._setRowsToData();
        this._refreshStatusAgrupadorChecklist(item._idCheckListAgrupador, item._idCheckList);
        this._checkMaxItensNivel(_idCheckListAgrupador, _idCheckList, _idCheckListNivel);
      },
      { event: true, paint: true }
    );
  }

  private _saveNewCheckListNivelItem(row: number, item: CheckListNivelItem, descricao: string): void {
    if (!this.savingNewItens) {
      this._bloquearButtons(true);
    }
    this.savingNewItens++;
    this.checkListIntegradoService
      .postCheckListItem({
        idProjetoCheckListIntegrado: item.idProjetoCheckListIntegrado,
        idCheckListIntegradoNivel: item.idCheckListIntegradoNivel,
        descricao,
        idProjeto: this.idProjeto,
      })
      .pipe(
        finalize(() => {
          this.savingNewItens = Math.max(this.savingNewItens - 1, 0);
          if (!this.savingNewItens) {
            this._bloquearButtons(false);
          }
        })
      )
      .subscribe(itemCreated => {
        const helper = this[item.helperKey];
        this._updateCheckListNivelItem(
          item._idCheckListAgrupador,
          item._idCheckList,
          item._idCheckListNivel,
          item._id,
          itemCreated
        );
        helper.executeSuspended(
          () => {
            helper.setRow(row, { ...item, ...itemCreated });
          },
          { paint: true, event: true }
        );
      });
  }

  private _deleteCheckListNivelItem(row: number): void {
    const item = this._getItemByRow(row);
    if (!item) {
      return;
    }
    const helper = this[item.helperKey];
    helper.executeSuspended(
      () => {
        this.sheet.deleteRows(row, 1);
        if (item.idProjetoCheckListIntegradoNivelItem) {
          this.checkListIntegradoService.deleteCheckListItem(item.idProjetoCheckListIntegradoNivelItem).subscribe();
        }
        this._updateCheckListNivel(item._idCheckListAgrupador, item._idCheckList, item._idCheckListNivel, nivel => ({
          ...nivel,
          itens: nivel.itens.filter(_item => _item._id !== item._id),
        }));
        this._setRowsToData();
        this._refreshStatusAgrupadorChecklist(item._idCheckListAgrupador, item._idCheckList);
        this._checkMaxItensNivel(item._idCheckListAgrupador, item._idCheckList, item._idCheckListNivel);
      },
      { paint: true, event: true }
    );
  }

  private _setCheckListTitle(checkList: CheckList): void {
    const row = checkList._row;
    this.sheet.getCell(row, 1).value(checkList.sequencia).hAlign(Spread.Sheets.HorizontalAlign.center);
    this.sheet.addSpan(row, 2, 1, 5);
    this.sheet
      .getRange(row, 1, 1, this.colCount)
      .font(this.checkListIntegradoComponent.font.cronograma)
      .borderTop(this.checkListIntegradoComponent.border.cronograma)
      .borderBottom(this.checkListIntegradoComponent.border.cronograma)
      .backColor(CheckListCorLinha.get(checkList.idCheckListIntegradoCategoria))
      .wordWrap(true);
    this.sheet.getRange(row, 2, 1, 5).text(checkList.descricao).cellPadding('0 10');
    const colStatus = this.itensHelper.colDefsMap.get('idCheckListStatus')?.col;
    if (!isNil(colStatus)) {
      this.sheet.getCell(row, colStatus).value('').hAlign(Spread.Sheets.HorizontalAlign.center);
      this.sheet.getCell(row, colStatus + 1).value('');
    }
    this.sheet.getCell(row, 0).value(checkList._id);
    const lastNivel = checkList.niveis[checkList.niveis.length - 1];
    const lastItem = lastNivel?.itens[(lastNivel?.itens.length ?? 0) - 1];
    const firstRow = row + 1;
    const lastRow = lastItem?._row ?? lastNivel?._row ?? firstRow;
    this.sheet.rowOutlines.group(firstRow, lastRow - row);
    this.sheet.rowOutlines.setCollapsed(firstRow, true);
    this.sheet.autoFitRow(row);
  }

  private _setNivelTitle(nivel: CheckListNivel, funcao: number): void {
    const row = nivel._row;
    if (nivel.permitidoInserir && !this._bloqueioGerencial(funcao) && !this.checkLists.publicado) {
      this.sheet
        .getCell(row, 1)
        .cellButtons([
          {
            imageType: Spread.Sheets.ButtonImageType.plus,
            command: (_, _row) =>
              this._addCheckListNivelItemLinha(_row, nivel._idCheckListAgrupador, nivel._idCheckList, nivel._id),
            useButtonStyle: true,
          },
        ])
        .locked(this.checkLists.publicado)
        .hAlign(Spread.Sheets.HorizontalAlign.center);
      this._checkMaxItensNivel(nivel._idCheckListAgrupador, nivel._idCheckList, nivel._id);
    }
    this.sheet.addSpan(row, 2, 1, 4);
    this.sheet
      .getRange(row, 1, 1, this.colCount - 1)
      .font(this.checkListIntegradoComponent.font.nivel)
      .borderBottom(this.checkListIntegradoComponent.border.nivelBottom)
      .backColor(this.checkListIntegradoComponent.color.nivel)
      .wordWrap(true);
    this.sheet.getRange(row, 2, 1, 4).text(nivel.descricao).vAlign(Spread.Sheets.VerticalAlign.center);
    this.sheet.setRowHeight(row, 20);
    this.sheet.getCell(row, 0).value(nivel._id);
    if (nivel.tipoHorario) {
      const colObservacoes = this.itensHelper.colDefsMap.get('observacoes')?.col;
      if (isNil(colObservacoes)) {
        return;
      }
      this.sheet.getCell(row, colObservacoes).text('HORÁRIO').hAlign(Spread.Sheets.HorizontalAlign.center);
    }
  }

  private _setRowsToData(): number {
    let row = this.rowStart;
    if (this.funcao === 'GI') {
      row += 3;
    }
    const cloneAgrupador = [...this.checkLists.agrupadorChecklist].map(agrupador => ({
      ...agrupador,
      checklists: [...agrupador.checklists].map(checkList => ({
        ...checkList,
        niveis: [...checkList.niveis].map(nivel => ({ ...nivel, itens: [...nivel.itens].map(item => ({ ...item })) })),
      })),
    }));
    for (const agrupador of cloneAgrupador) {
      agrupador._row = row;
      row++;
      for (const checkList of agrupador.checklists) {
        checkList._row = row;
        row++;
        for (const nivel of checkList.niveis) {
          nivel._row = row;
          row++;
          for (const item of nivel.itens) {
            item._row = row;
            row++;
          }
        }
      }
      row++;
    }
    this._setCheckLists({ ...this.checkLists, agrupadorChecklist: cloneAgrupador });
    return row - 1;
  }

  private _setRows(): void {
    const rows = this._setRowsToData();
    if (this.funcao === 'GI') {
      this._addInformacoesEmailGI();
    }
    this.sheet.rowOutlines.direction(Spread.Sheets.Outlines.OutlineDirection.backward);
    this.sheet.setRowCount(rows);
    for (const agrupador of this.checkLists.agrupadorChecklist) {
      const helper = this[agrupador.helperKey];
      this.sheet.addSpan(agrupador._row - 1, 1, 1, this.colCount);
      this._setHeaders(agrupador._row, helper);
      for (const checkList of agrupador.checklists) {
        this._setCheckListTitle(checkList);
        for (const nivel of checkList.niveis) {
          this._setNivelTitle(nivel, checkList.funcao);
          for (const item of nivel.itens) {
            helper.setRow(item._row, item);
          }
        }
        this._refreshStatusCheckList(checkList);
      }
    }
    this.sheet.outlineColumn.refresh();
    this._watchFileCheckList();
  }

  private _addInformacoesEmailGI(): void {
    if (this.funcao !== 'GI') {
      return;
    }
    const rowLabel = this.rowStart;
    this.sheet.addSpan(rowLabel, 1, 1, this.colCount);
    this.sheet
      .getCell(rowLabel, 1)
      .value('Informação para enviar no e-mail:')
      .vAlign(Spread.Sheets.VerticalAlign.center)
      .font(SpreadjsHelper.resolveFont('bold', 12))
      .cellPadding('0 5');
    this.sheet.setRowHeight(rowLabel, 24);
    const rowInput = rowLabel + 1;
    this.sheet.addSpan(rowInput, 1, 1, 5);
    const isLocked = this.checkLists.publicadoGi || this.checkLists.publicado;
    this.sheet
      .getRange(rowInput, 1, 1, 5)
      .locked(isLocked)
      .value(this.checkLists.informacaoEmail)
      .wordWrap(true)
      .cellPadding('5 5')
      .setBorder(this.checkListIntegradoComponent.border.mediumBlack, { all: true });
    this.sheet.setRowHeight(rowInput, 62);
    this.sheet
      .getCell(rowInput, 6)
      .cellButtons([
        {
          position: Spread.Sheets.ButtonPosition.left,
          caption: 'Publicar e disparar e-mail',
          useButtonStyle: true,
          enabled: !isLocked,
          command: () => {
            const url = `http://centralizacao.athiewohnrath.com.br/projetos/web/Arquitetura/Publicacao/PublicarDiretoSalvarReuniaoObra?idProjeto=${this.idProjeto}&idProjetoCheckListIntegrado=${this.idProjetoCheckListIntegrado}`;
            this.window.open(url, '_blank');
            this._lockGI();
          },
        },
      ])
      .locked(isLocked);
    this.sheet.addSpan(rowInput, 6, 1, this.colCount);
    this.listenToChanges<string>(rowInput, 1)
      .pipe(
        takeUntil(this._destroy$),
        switchMap(informacaoEmail =>
          this.checkListIntegradoService.atualizarCheckList(this.idProjetoCheckListIntegrado, informacaoEmail)
        )
      )
      .subscribe();
  }

  private _redrawItens(): void {
    for (const agrupador of this.checkLists.agrupadorChecklist) {
      const helper = this[agrupador.helperKey];
      for (const checkList of agrupador.checklists) {
        for (const nivel of checkList.niveis) {
          for (const item of nivel.itens) {
            helper.setRow(item._row, item);
          }
        }
      }
    }
  }

  private _lockGI(): void {
    if (this.funcao !== 'GI') {
      return;
    }
    this._setCheckLists(checkLists => ({ ...checkLists, publicadoGi: true }));
    this.itensHelper.executeSuspended(
      () => {
        this._redrawItens();
        const row = this.sheet.getRowCount() - 1;
        this.sheet.getRange(row, 1, 1, this.colCount).locked(true);
      },
      { paint: true, event: true }
    );
  }

  private _getItemByRow(row: number): CheckListNivelItem | undefined {
    const idCell = this.sheet.getCell(row, 0);
    const id = idCell?.value();
    if (isNil(id)) {
      return;
    }
    return this.itens.find(_item => _item._id === id);
  }

  private _changedCheckList(row: number, col: number, newValue?: any): void {
    const oldItem = this._getItemByRow(row);
    if (isNil(oldItem)) {
      return;
    }
    const helper = this[oldItem.helperKey];
    const colDef = helper.colDefsMap.get(col);
    if (!colDef) {
      return;
    }
    const property = colDef.id;
    if (!property) {
      return;
    }
    const cellValue = this.sheet.getCell(row, col);
    newValue ??= cellValue.value();
    if (oldItem[property] === newValue) {
      cellValue.value(newValue);
      return;
    }
    this.sheet.autoFitRow(row);
    const atualizacaoItem: Partial<CheckListNivelItem> = { [property]: newValue };
    for (const colDefFormula of helper.colDefs.filter(cd => cd.formula)) {
      atualizacaoItem[colDefFormula.id!] = this.sheet.getCell(row, colDefFormula.col!).value();
    }
    const item: CheckListNivelItem = { ...oldItem, ...atualizacaoItem };
    this._updateCheckListNivelItem(
      item._idCheckListAgrupador,
      item._idCheckList,
      item._idCheckListNivel,
      item._id,
      atualizacaoItem
    );
    if (property === 'visivel' && !newValue && !this._getCheckboxMostrarItensOcultosValue()) {
      this.sheet.setRowVisible(row, false);
    }
    if (property === 'descricao' && !item.idProjetoCheckListIntegradoNivelItem) {
      this._saveNewCheckListNivelItem(row, item, newValue);
    } else {
      this._updateFilaCheckList({
        idProjetoCheckListIntegradoNivelItem: item.idProjetoCheckListIntegradoNivelItem,
        acao: item.acao,
        idCheckListStatus: item.idCheckListStatus,
        dataPrevista: item.dataPrevista,
        observacoes: item.observacoes,
        responsavel: item.responsavel,
        descricao: item.descricao,
        percentualRealizado: item.percentualRealizado,
        valor: item.valor,
        percentualPrevisto: item.percentualPrevisto,
        visivel: item.visivel,
      });
      if (property === 'idCheckListStatus') {
        helper.executeSuspended(
          () => {
            this._refreshStatusAgrupadorChecklist(item._idCheckListAgrupador, item._idCheckList);
          },
          { event: true, paint: true }
        );
      }
    }
  }

  private _refreshStatusAgrupadorChecklist(
    _idCheckListAgrupador: number | ((agrupador: CheckListAgrupador) => boolean),
    _idCheckList: number | ((checkList: CheckList) => boolean)
  ): void {
    const predicateAgrupador = isFunction(_idCheckListAgrupador)
      ? _idCheckListAgrupador
      : (agrupador: CheckListAgrupador) => agrupador._id === _idCheckListAgrupador;
    const predicateCheckList = isFunction(_idCheckList)
      ? _idCheckList
      : (checkList: CheckList) => checkList._id === _idCheckList;
    for (const agrupador of this.checkLists.agrupadorChecklist) {
      if (predicateAgrupador(agrupador)) {
        for (const checkList of agrupador.checklists) {
          if (predicateCheckList(checkList)) {
            this._refreshStatusCheckList(checkList);
          }
        }
      }
    }
  }

  private _refreshStatusCheckList(checkList: CheckList): void {
    const helper = this[checkList.helperKey];
    const colDefStatus = helper.colDefsMap.get('idCheckListStatus');
    if (!colDefStatus) {
      return;
    }
    const itens = checkList.niveis.reduce((acc, nivel) => [...acc, ...nivel.itens], [] as CheckListNivelItem[]);
    if (!itens.length) {
      return;
    }
    // Verifica se todos são Concluido ou NA
    const everyStatusIsNAOrConcluido = itens.every(item =>
      [CheckListStatusEnum.Concluido, CheckListStatusEnum.NA].includes(item.idCheckListStatus)
    );
    let status = '';
    if (everyStatusIsNAOrConcluido) {
      // Verifica se existe pelo menos 1 concluido
      if (itens.some(item => item.idCheckListStatus === CheckListStatusEnum.Concluido)) {
        // Se existe pelo menos um concluido no meio de todos NA, coloca Concluido
        status = CheckListStatusDescricaoEnum.Concluido;
      } else {
        // Se não, coloca NA
        status = CheckListStatusDescricaoEnum.NA;
      }
    }
    this.sheet.getCell(checkList._row, colDefStatus.col).value(status);
  }

  toggleItensVisiveis(visible: boolean): void {
    const itens = this.itens.filter(item => !item.visivel);
    for (const item of itens) {
      this.sheet.setRowVisible(item._row, visible);
    }
  }

  clipboardPasted({ cellRange: { col, colCount, rowCount, row } }: Spread.Sheets.IClipboardPastedEventArgs): void {
    for (let i = 0; i < colCount; i++) {
      const colI = col + i;
      for (let j = 0; j < rowCount; j++) {
        const rowI = row + j;
        this._changedCheckList(rowI, colI);
      }
    }
  }

  editEnded({ row, col }: Spread.Sheets.IEditEndedEventArgs): void {
    this._changedCheckList(row, col);
  }

  cellChanged($event: Spread.Sheets.ICellChangedEventArgs): void {
    const item = this._getItemByRow($event.row);
    if (!item) {
      return;
    }
    const helper = this[item.helperKey];
    const colDef = helper.colDefsMap.get($event.col);
    if (colDef?.datePicker || helper.resolveTimepicker($event.row, $event.col, item) || colDef?.customCellType) {
      this._changedCheckList($event.row, $event.col);
    }
  }

  deleteChanged(row: number, col: number): void {
    const item = this._getItemByRow(row);
    if (!item) {
      return;
    }
    const helper = this[item.helperKey];
    helper.checkDefaulValue(row, col);
    this._changedCheckList(row, col);
  }

  init(workbook: Spread.Sheets.Workbook): void {
    this.itensHelper = new SpreadjsHelper<CheckListNivelItem>(this.sheet, {
      colDefs: this.itensColDef,
      colDefDefault: this.checkListIntegradoComponent.defaultColDef,
      idProperty: 'idProjetoCheckListIntegradoNivelItem',
      autoFitRows: true,
    });
    this.metaHelper = new SpreadjsHelper<CheckListNivelItem>(this.sheet, {
      colDefs: this.metaColDef,
      colDefDefault: this.checkListIntegradoComponent.defaultColDef,
      idProperty: 'idProjetoCheckListIntegradoNivelItem',
      autoFitRows: true,
    });
    this.changeOrderHelper = new SpreadjsHelper<CheckListNivelItem>(this.sheet, {
      colDefs: this.changeOrderColDef,
      colDefDefault: this.checkListIntegradoComponent.defaultColDef,
      idProperty: 'idProjetoCheckListIntegradoNivelItem',
      autoFitRows: true,
    });
    this.itensHelper.executeSuspended(
      () => {
        this._setHeader();
        this._setRows();
        this.toggleItensVisiveis(false);
      },
      { paint: true, event: true }
    );
    super.init(workbook);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
