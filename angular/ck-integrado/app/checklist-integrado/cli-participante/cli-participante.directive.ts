import { Directive, EventEmitter, Host, Input, Output, Self } from '@angular/core';
import { WorksheetAbstract } from '@aw-utils/excel/worksheet-abstract';
import { WorksheetComponent } from '@grapecity/spread-sheets-angular';
import { CheckListIntegradoComponent } from '../check-list-integrado.component';
import { Spread } from '@grapecity/spread-sheets';
import { CheckListParticipante } from '@aw-models/check-list-participante';
import { ColDef } from '@aw-utils/excel/excel';
import { SpreadjsHelper } from '@aw-utils/excel/spreadjs-helper';
import {
  CheckListParticipanteStatusEnum,
  getCheckListParticipantesList,
} from '@aw-models/check-list-participante-status';
import { isFunction } from '@aw-utils/utils';
import { debounceTime, filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { CliParticipanteService } from './cli-participante.service';
import { BehaviorSubject, concat, Observable } from 'rxjs';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { getUid } from '../util';

@Directive({
  selector: 'gc-worksheet[appCliParticipante]',
  providers: [{ provide: WorksheetAbstract, useExisting: CliParticipanteDirective }],
})
export class CliParticipanteDirective extends WorksheetAbstract {
  constructor(
    @Self() worksheetComponent: WorksheetComponent,
    @Host() private checkListIntegradoComponent: CheckListIntegradoComponent,
    private cliParticipanteService: CliParticipanteService
  ) {
    super(worksheetComponent);
  }

  // Map com idCheckListParticipante como key e idCheckListParticipanteStatus como value
  private _fila$ = new BehaviorSubject<Map<number, number>>(new Map<number, number>());

  @Input() rowStart!: number;
  @Input() participantes!: CheckListParticipante[];
  @Input() publicado!: boolean;
  @Input() idProjetoCheckListIntegrado!: number;
  @Output() readonly participantesChange = new EventEmitter<CheckListParticipante[]>();

  radioCellType = new Spread.Sheets.CellTypes.RadioButtonList()
    .items(getCheckListParticipantesList().map(item => ({ text: item.descricao, value: item.id })))
    .isFlowLayout(true);

  helper!: SpreadjsHelper<CheckListParticipante>;

  savingNewItens = 0;

  colDefs: ColDef<CheckListParticipante>[] = [
    {
      id: '_id',
      visible: false,
    },
    {
      id: 'idCheckListParticipante',
      visible: false,
    },
    {
      id: '_button',
      buttons: [
        {
          imageType: Spread.Sheets.ButtonImageType.minus,
          useButtonStyle: true,
          command: (_, row) => this._removeParticipante(row),
        },
      ],
      locked: ({ item }) => item.importadoAutomatico || this.publicado,
      width: 30,
      hAlign: Spread.Sheets.HorizontalAlign.center,
    },
    {
      id: 'idCheckListParticipanteStatus',
      title: 'STATUS',
      cellType: this.radioCellType,
      width: 260,
      locked: () => this.publicado,
      backColor: () =>
        this.publicado
          ? this.checkListIntegradoComponent.color.notEditable
          : this.checkListIntegradoComponent.color.white,
      cellPadding: '0 5',
      defaultValue: CheckListParticipanteStatusEnum.Ausente,
    },
    {
      id: 'nome',
      title: 'NOME',
      width: 300,
      locked: ({ item }) => !!item.idCheckListParticipante || this.publicado,
      backColor: ({ item }) =>
        !!item.idCheckListParticipante || this.publicado
          ? this.checkListIntegradoComponent.color.notEditable
          : this.checkListIntegradoComponent.color.white,
    },
    {
      id: 'email',
      title: 'E-MAIL',
      width: 250,
      locked: ({ item }) => !!item.idCheckListParticipante || this.publicado,
      backColor: ({ item }) =>
        !!item.idCheckListParticipante || this.publicado
          ? this.checkListIntegradoComponent.color.notEditable
          : this.checkListIntegradoComponent.color.white,
    },
  ];

  private _watchFila(): void {
    this._fila$
      .pipe(
        debounceTime(1000),
        takeUntil(this._destroy$),
        filter(payloads => !!payloads.size),
        switchMap(payloads => {
          this._fila$.next(new Map());
          return this._atualizarParticipantesApi(payloads);
        }),
        catchAndThrow(() => {
          alert('Ocorreu um erro ao tentar salvar as últimas alterações');
          this._watchFila();
        })
      )
      .subscribe();
  }

  private _atualizarParticipantesApi(payloads: Map<number, number>): Observable<void> {
    const tuples = [...payloads];
    return concat(
      ...tuples.map(([idCheckListParticipante, idCheckListParticipanteStatus]) =>
        this.cliParticipanteService.put(idCheckListParticipante, idCheckListParticipanteStatus)
      )
    );
  }

  private _atualizarFila(idCheckListParticipante: number, idCheckListParticipanteStatus: number): void {
    this._fila$.next(this._fila$.value.set(idCheckListParticipante, idCheckListParticipanteStatus));
  }

  private _removeParticipante(row: number): void {
    const id = this.sheet.getCell(row, 0).value();
    if (!id) {
      return;
    }
    const participante = this.participantes.find(_participante => _participante._id === id);
    if (!participante) {
      return;
    }
    this.sheet.deleteRows(participante._row, 1);
    if (participante.idCheckListParticipante) {
      // Se o participante já estiver salvo, precisa fazer o delete
      this.cliParticipanteService.delete(participante.idCheckListParticipante).subscribe();
    }
    // Remove o participante do array, e seta a _row para o valor correto dos que estão abaixo dele
    this._setParticipantes(participantes =>
      participantes
        .filter(_participante => _participante._id !== participante._id)
        .map(_participante => {
          if (_participante._row > participante._row) {
            _participante = { ..._participante, _row: _participante._row - 1 };
          }
          return _participante;
        })
    );
  }

  private _adicionarParticipante(): void {
    const lastRow = this.sheet.getRowCount();
    const participante: CheckListParticipante = {
      _button: undefined,
      importadoAutomatico: false,
      _id: getUid(),
      email: '',
      _row: lastRow,
      idCheckListParticipante: 0,
      nome: '',
      idCheckListParticipanteStatus: 1,
      idProjetoCheckListIntegrado: this.idProjetoCheckListIntegrado,
    };
    this._setParticipantes(participantes => [...participantes, participante]);
    this.helper.executeSuspended(
      () => {
        this.sheet.addRows(lastRow, 1);
        this.helper.setRow(lastRow, participante);
      },
      { paint: true, event: true }
    );
  }

  private _setParticipantes(
    participantes: CheckListParticipante[] | ((participantes: CheckListParticipante[]) => CheckListParticipante[])
  ): void {
    const update = isFunction(participantes) ? participantes : () => participantes;
    this.participantes = update(this.participantes);
    this.participantesChange.emit(this.participantes);
  }

  private _updateParticipante(_id: number, partial: Partial<CheckListParticipante>): void {
    this._setParticipantes(participantes =>
      participantes.map(participante => {
        if (_id === participante._id) {
          participante = { ...participante, ...partial };
        }
        return participante;
      })
    );
  }

  private _montar(): void {
    this.sheet.setRowCount(this.participantes.length + this.rowStart + 1);
    this.checkListIntegradoComponent.montarCabecalho(this.sheet, this.colCount);
    this.checkListIntegradoComponent.setColTitles(this.helper);
    let row = this.rowStart + 1;
    for (const participante of this.participantes) {
      this.helper.setRow(row, participante);
      this._updateParticipante(participante._id, { _row: row });
      row++;
    }
    if (this.publicado) {
      return;
    }
    this.sheet.addRows(row, 1);
    this.sheet.addSpan(row, 1, 1, this.colCount);
    this.sheet
      .getCell(row, 1)
      .cellButtons([
        {
          imageType: Spread.Sheets.ButtonImageType.plus,
          useButtonStyle: true,
          caption: 'Adicionar participante',
          position: Spread.Sheets.ButtonPosition.left,
          command: () => this._adicionarParticipante(),
        },
      ])
      .locked(false);
    this.sheet.setRowHeight(row, 28);
    this._watchFila();
  }

  private _changed(row: number, col: number, _newValue?: any): void {
    const tupple = this.checkListIntegradoComponent.checkChanged(
      row,
      col,
      this.helper.colDefsMap,
      this.sheet,
      this.participantes,
      _newValue
    );
    if (!tupple) {
      return;
    }
    let [item, property, newValue] = tupple;
    const atualizacaoItem: Partial<CheckListParticipante> = { [property]: newValue };
    for (const colDefFormula of this.helper.colDefs.filter(cd => cd.formula)) {
      atualizacaoItem[colDefFormula.id!] = this.sheet.getCell(row, colDefFormula.col!).value();
    }
    item = { ...item, ...atualizacaoItem };
    this._updateParticipante(item._id, atualizacaoItem);
    if (item.idCheckListParticipante) {
      if (property === 'idCheckListParticipanteStatus') {
        this._atualizarFila(item.idCheckListParticipante, item.idCheckListParticipanteStatus);
      }
    } else if (item.idCheckListParticipanteStatus && item.nome && item.email) {
      this._salvarNovoParticipante(item);
    }
  }

  private _salvarNovoParticipante(participante: CheckListParticipante): void {
    const buttonColDef = this.helper.colDefsMap.get('_button');
    if (!buttonColDef) {
      return;
    }
    if (!this.savingNewItens) {
      this.helper.lockButtons(buttonColDef.col, true);
    }
    this.helper.lockRow(participante._row, true);
    this.savingNewItens++;
    this.cliParticipanteService
      .post({
        idCheckListParticipante: 0,
        nome: participante.nome,
        idProjetoCheckListIntegrado: participante.idProjetoCheckListIntegrado,
        importadoAutomatico: participante.importadoAutomatico,
        email: participante.email,
        idCheckListParticipanteStatus: participante.idCheckListParticipanteStatus,
      })
      .pipe(
        finalize(() => {
          this.savingNewItens = Math.max(this.savingNewItens - 1, 0);
          if (!this.savingNewItens) {
            this.helper.lockButtons(buttonColDef.col, false);
          }
        }),
        catchAndThrow(() => {
          this.helper.lockRow(participante._row, false);
          alert('Erro ao tentar salvar as últimas alterações');
        })
      )
      .subscribe(participanteCreated => {
        this._updateParticipante(participante._id, participanteCreated);
        this.helper.executeSuspended(
          () => {
            this.helper.setRow(participante._row, { ...participante, ...participanteCreated });
          },
          { paint: true, event: true }
        );
      });
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

  cellChanged({ row, col }: Spread.Sheets.ICellChangedEventArgs): void {
    const colDef = this.helper.colDefsMap.get(col);
    if (colDef?.datePicker || colDef?.cellType) {
      this._changed(row, col);
    }
  }

  deleteChanged(row: number, col: number): void {
    this.helper.checkDefaulValue(row, col);
    this._changed(row, col);
  }

  init(workbook: Spread.Sheets.Workbook): void {
    this.helper = new SpreadjsHelper<CheckListParticipante>(this.sheet, {
      colDefs: this.colDefs,
      colDefDefault: this.checkListIntegradoComponent.defaultColDef,
      autoFitRows: true,
      idProperty: 'idCheckListParticipante',
    });
    this.helper.executeSuspended(
      () => {
        this._montar();
      },
      { event: true, paint: true }
    );
    this.helper.autoFitRows(this.participantes.map(participante => participante._row));
    super.init(workbook);
  }
}
