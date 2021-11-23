import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PcGridColumnGroupEnum, PcGridService } from './pc-grid.service';
import { AllCommunityModules, GridReadyEvent } from '@ag-grid-community/all-modules';
import {
  CellClickedEventCustom,
  ColDefCustom,
  ColumnApiCustom,
  ICellRendererParamsCustom,
  ValueFormatterParamsCustom,
  ValueSetterParamsCustom,
} from '../util/grid-custom-models';
import { PcDatasPlanejamentoEnum, PlanoCompras } from '../models/plano-compras';
import { Subject } from 'rxjs';
import { PlanoComprasQuery } from '../state/plano-compras/plano-compras.query';
import { PlanoComprasService } from '../state/plano-compras/plano-compras.service';
import { isEqual, uniqBy } from 'lodash-es';
import { PcGridHeaderComponent } from './pc-grid-custom/pc-grid-header/pc-grid-header.component';
import { defaultOptions } from '@aw-utils/ag-grid/ag-grid';
import { PcGridFilterComponent, PcGridFilterParams } from './pc-grid-custom/pc-grid-filter/pc-grid-filter.component';
import { PcResponsabilidadeEnum, PcResponsavel } from '../models/pc-responsavel';
import { PcColumnTypesEnum } from './pc-column-types.enum';
import { PcGridCellComponent, PcGridCellRendererParams } from './pc-grid-custom/pc-grid-cell/pc-grid-cell.component';
import { PcFrameworkComponentsEnum } from './pc-framework-components.enum';
import { PcFaturamento } from '../models/pc-faturamento';
import { formatDate, formatNumber } from '@angular/common';
import { PcFornecedor } from '../models/pc-fornecedor';
import {
  PcGridResponsaveisCellEditorParams,
  PcGridResponsaveisComponent,
} from './pc-grid-responsaveis/pc-grid-responsaveis.component';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { ActivatedRoute, Router } from '@angular/router';
import { PcCabecalhoQuery } from '../state/cabecalho/pc-cabecalho.query';
import {
  PcGridCellEditorComponent,
  PcGridCellEditorParams,
} from './pc-grid-custom/pc-grid-cell-editor/pc-grid-cell-editor.component';
import { getNumeracao } from '@aw-utils/grupo-item/sort-by-numeracao';
import { compareValues } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { PcGridDatasComponent } from './pc-grid-datas/pc-grid-datas.component';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-pc-grid',
  templateUrl: './pc-grid.component.html',
  styleUrls: ['./pc-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PcGridComponent implements OnInit, OnDestroy {
  constructor(
    public pcGridService: PcGridService,
    public planoComprasQuery: PlanoComprasQuery,
    public planoComprasService: PlanoComprasService,
    private routerQuery: RouterQuery,
    @Inject(LOCALE_ID) private locale: string,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private pcCabecalhoQuery: PcCabecalhoQuery
  ) {}

  private _destroy$ = new Subject<void>();

  @Input() minified: boolean;
  @ViewChild('agGrid', { read: ElementRef }) agGridRef: ElementRef;

  readonly gridModules = AllCommunityModules;
  readonly gridColDefs: ColDefCustom[] = [
    {
      headerName: '',
      headerClass: 'grupo',
      children: [
        {
          field: 'codigoGrupo',
          headerName: 'Cód.',
          sortable: true,
          type: PcColumnTypesEnum.text,
          pinned: 'left',
          width: 70,
          cellClass: ['font-light'],
          cellRendererParams: {
            type: 'text',
            fontColor: 'light',
          } as PcGridCellRendererParams,
          comparator(valueA: string, valueB: string): number {
            const [beforeDotA, afterDotA] = getNumeracao(valueA);
            const [beforeDotB, afterDotB] = getNumeracao(valueB);
            if (beforeDotA !== beforeDotB) {
              return compareValues(beforeDotA, beforeDotB);
            } else {
              return compareValues(afterDotA, afterDotB);
            }
          },
        },
        {
          field: 'nomeGrupo',
          headerName: 'Grupo',
          type: PcColumnTypesEnum.text,
          pinned: 'left',
          sortable: false,
          headerClass: 'last',
          cellClass: ['last', 'font-weight-bold', 'font-dark', 'nome-grupo'],
          minWidth: 150,
          maxWidth: 200,
          cellRenderer: (params: PcGridCellRendererParams) => `<span title="${params.value}">${params.value}</span>`,
        },
      ],
    },
    {
      headerName: 'DNN',
      headerClass: 'dnn',
      children: [
        {
          field: 'valorOrcadoDNN',
          headerName: 'Valor orçado DNN',
          filter: false,
          type: PcColumnTypesEnum.number,
          minWidth: 100,
          maxWidth: 150,
          awGroup: PcGridColumnGroupEnum.dnn,
          cellRenderer: (params: PcGridCellRendererParams<number>) => {
            const value = params.valueFormatted;
            const other = params.data[params.otherInfo] ?? '';
            return templateValueOtherInfo(value, other, 'mt-3');
          },
          valueFormatter: params => formatNumber(params.value, this.locale, '1.2-2'),
          cellRendererParams: {
            otherInfo: 'fornecedorOrcadoDNN',
            type: 'number',
            bold: true,
            fontColor: 'light',
          } as PcGridCellRendererParams,
        },
        {
          field: 'desconto',
          headerName: 'Desconto',
          type: PcColumnTypesEnum.number,
          filter: false,
          minWidth: 100,
          maxWidth: 120,
          awGroup: PcGridColumnGroupEnum.dnn,
          cellRenderer: PcFrameworkComponentsEnum.cell,
          valueFormatter: params => params.value,
          cellRendererParams: {
            otherInfo: 'comentarioDesconto',
            otherInfoIcon: 'aw-icon-msg-success',
            otherInfoIconEmpty: 'aw-icon-msg-black',
            otherInfoJustify: 'end',
            type: 'number',
            bold: true,
            fontColor: 'light',
          } as PcGridCellRendererParams,
        },
        {
          field: 'margemEmbutida',
          headerName: 'Margem embutida',
          type: PcColumnTypesEnum.number,
          filter: false,
          minWidth: 100,
          maxWidth: 120,
          awGroup: PcGridColumnGroupEnum.dnn,
          cellClass: ['font-weight-bold', 'font-dark'],
        },
        {
          field: 'limiteCompra',
          headerName: 'Limite de compra',
          type: PcColumnTypesEnum.number,
          filter: false,
          awGroup: PcGridColumnGroupEnum.dnn,
          cellClass: ['limite-compra', 'font-weight-bold', 'font-dark'],
          minWidth: 100,
          maxWidth: 120,
        },
        {
          field: 'faturamentoDNN',
          headerName: 'Faturamento',
          type: PcColumnTypesEnum.text,
          sortable: false,
          awGroup: PcGridColumnGroupEnum.dnn,
          cellClass: ['font-weight-bold', 'font-light'],
          minWidth: 100,
          maxWidth: 120,
        },
        {
          field: 'impostoDNN',
          headerName: 'Imposto',
          type: PcColumnTypesEnum.number,
          filter: false,
          awGroup: PcGridColumnGroupEnum.dnn,
          cellClass: ['font-weight-bold', 'font-light'],
          minWidth: 100,
          maxWidth: 120,
          cellRenderer: (params: PcGridCellRendererParams<number>) => {
            const value = params.valueFormatted;
            const other = formatNumber(params.data.percentualImposto, this.locale, '1.2-2') + '%';
            return templateValueOtherInfo(value, other);
          },
        },
        {
          field: 'descontoVPDNN',
          headerName: 'Desconto VPDNN',
          type: PcColumnTypesEnum.number,
          filter: false,
          awGroup: PcGridColumnGroupEnum.dnn,
          cellClass: ['font-weight-bold', 'font-light'],
          minWidth: 100,
          maxWidth: 120,
        },
        {
          field: 'valorTotalVenda',
          headerName: 'Valor total de venda',
          type: PcColumnTypesEnum.number,
          filter: false,
          awGroup: PcGridColumnGroupEnum.dnn,
          cellClass: ['font-weight-bold', 'font-dark'],
          minWidth: 100,
          maxWidth: 120,
        },
        {
          field: 'oportunidade',
          headerName: 'Oportunidade',
          headerClass: 'last',
          cellClass: 'last',
          type: PcColumnTypesEnum.number,
          filter: false,
          minWidth: 100,
          maxWidth: 120,
          awGroup: PcGridColumnGroupEnum.dnn,
          cellRenderer: PcFrameworkComponentsEnum.cell,
          valueFormatter: params => params.value,
          cellRendererParams: {
            otherInfo: 'comentarioOportunidade',
            otherInfoIcon: 'aw-icon-msg-success',
            otherInfoIconEmpty: 'aw-icon-msg-black',
            otherInfoJustify: 'end',
            type: 'number',
            bold: true,
            fontColor: 'light',
          } as PcGridCellRendererParams,
        },
      ],
    },
    {
      headerName: 'Desenvolvimento',
      headerClass: 'desenvolvimento',
      children: [
        {
          field: 'metaCompra',
          headerName: 'Meta de compra',
          type: PcColumnTypesEnum.number,
          filter: false,
          width: 200,
          cellEditorParams: {
            comentario: 'comentarioMetaCompra',
            placeholder: '0,00',
            placeholderComentario: 'Comentário meta compra',
            type: 'number',
          },
          awGroup: PcGridColumnGroupEnum.desenvolvimento,
          valueSetter: params => {
            if (params.newValue !== params.oldValue) {
              this.planoComprasService.putMetaCompra(
                this.routerQuery.getParams(RouteParamEnum.idOrcamentoCenario),
                params.data.id,
                params.newValue
              );
              let valorPercentual: number;
              if (params.data.limiteCompra - params.newValue > 0) {
                valorPercentual = ((params.data.limiteCompra - params.newValue) / params.data.limiteCompra) * 100;
              } else {
                valorPercentual = (params.newValue * 100) / params.data.limiteCompra;
              }

              this.planoComprasService.update(params.data.id, {
                percentualMetaMiscellaneous: valorPercentual,
              });
            }

            return this.defaultValueSetter(params);
          },
          cellRenderer: (params: PcGridCellRendererParams<number>) => {
            const miscellaneous = params.data.limiteCompra - params.value;
            const limiteEMargem = params.data.limiteCompra - params.data.margemEmbutida - params.value;
            const icone = !!params.data.comentarioMetaCompra ? 'aw-icon-msg-success' : 'aw-icon-msg-error';
            const percentualMetaMiscellaneous =
              formatNumber(miscellaneous === 0 ? 0 : params.data.percentualMetaMiscellaneous, this.locale, '1.2-2') +
              '%';
            const classStatus = miscellaneous < 0 ? 'text-danger' : 'text-dark';
            let layout = `
              <div class="pc-grid-cell-custom">
                <div class="value font-light font-weight-bold text-right">
                  ${params.valueFormatted}
                </div>
              </div>`;
            if (miscellaneous < 0 || limiteEMargem < 0) {
              layout += `
                <div class="other-info mt-1 d-flex justify-content-between">
                  <div class="value">Miscellaneous: </div>
                  <div class="value ${classStatus}">
                    ${formatNumber(miscellaneous, this.locale, '1.2-2')}
                  </div>
                </div>
                <div class="d-flex justify-content-end mt-1 other-info">`;
              if (miscellaneous !== 0) {
                layout += `
                  <span
                    class="icon ${icone}"
                    title="${params.data.comentarioMetaCompra ?? ''}">
                  </span>
                  `;
              }
              layout += `
                <div class="value ${classStatus} ml-4">
                    ${percentualMetaMiscellaneous}
                  </div>
                </div>`;
            } else {
              layout += `
              <div class="other-info mt-1 d-flex justify-content-between">
                <div class="value">Miscellaneous: </div>
                <div class="value ">
                  ${formatNumber(miscellaneous, this.locale, '1.2-2')}
                </div>
              </div>
              <div class="d-flex justify-content-end mt-1 other-info">
                <div class="value ml-4">
                  ${percentualMetaMiscellaneous}
                </div>
              </div>
              `;
            }
            return layout;
          },

          editable: params => {
            return !params.data.grupoTaxa && !this.pcCabecalhoQuery.isCongelado();
          },
        },
        {
          field: 'faturamentoDesenvolvimento',
          headerName: 'Faturamento',
          type: PcColumnTypesEnum.text,
          awGroup: PcGridColumnGroupEnum.desenvolvimento,
          width: 140,
          cellEditorParams: {
            selectOptions: {
              bindLabel: 'nome',
            },
            type: 'select',
            selectItems: this.planoComprasService.faturamentos$,
          } as PcGridCellEditorParams,
          filterParams: {
            customValueGetter: (data, colDef) => (data[colDef.field] as PcFaturamento)?.nome,
            type: 'text',
          } as PcGridFilterParams,
          sortable: false,
          valueFormatter: (params: ValueFormatterParamsCustom<PcFaturamento>) => params.value?.nome,
          valueSetter: (params: ValueSetterParamsCustom<PcFaturamento>) => {
            if (params.newValue?.id !== params.oldValue?.id) {
              this.planoComprasService.putFaturamento(
                this.routerQuery.getParams(RouteParamEnum.idOrcamentoCenario),
                params.data.id,
                params.newValue.id
              );
            }
            return this.defaultValueSetter(params);
          },
          comparator: (valueA: PcFaturamento, valueB: PcFaturamento) => valueA?.nome?.localeCompare(valueB?.nome),
          editable: params => {
            return !params.data.grupoTaxa && !this.pcCabecalhoQuery.isCongelado();
          },
        },
        {
          field: 'impostoDesenvolvimento',
          headerName: 'Imposto',
          type: PcColumnTypesEnum.number,
          filter: false,
          minWidth: 100,
          maxWidth: 120,
          awGroup: PcGridColumnGroupEnum.desenvolvimento,
          cellClass: ['font-weight-bold', 'font-light'],
          cellRenderer: (params: PcGridCellRendererParams<number>) => {
            const value = params.valueFormatted;
            const other = formatNumber(params.data.percentualImposto, this.locale, '1.2-2') + '%';
            return templateValueOtherInfo(value, other);
          },
        },
        {
          field: 'comentario',
          headerName: 'Comentários',
          type: PcColumnTypesEnum.text,
          filter: false,
          sortable: false,
          width: 250,
          awGroup: PcGridColumnGroupEnum.desenvolvimento,
          cellEditorParams: {
            type: 'text',
            textarea: true,
            placeholder: 'Comentário',
          } as PcGridCellEditorParams,
          editable: () => {
            return !this.pcCabecalhoQuery.isCongelado();
          },
          valueSetter: params => {
            if (params.oldValue !== params.newValue) {
              this.planoComprasService.putComentario(params.data.id, params.newValue);
            }
            return this.defaultValueSetter(params);
          },
        },
        {
          field: 'responsavelEscopo',
          headerName: 'Responsável pela montagem do escopo',
          type: [PcColumnTypesEnum.text, PcColumnTypesEnum.responsavel],
          awGroup: PcGridColumnGroupEnum.responsaveis,
          cellEditorParams: {
            responsabilidade: PcResponsabilidadeEnum.responsavelEscopo,
          } as PcGridResponsaveisCellEditorParams,
        },
        {
          field: 'responsavelNegociacao',
          headerName: 'Responsável pela negociação',
          type: [PcColumnTypesEnum.text, PcColumnTypesEnum.responsavel],
          awGroup: PcGridColumnGroupEnum.responsaveis,
          cellEditorParams: {
            responsabilidade: PcResponsabilidadeEnum.responsavelNegociacao,
          } as PcGridResponsaveisCellEditorParams,
        },
        {
          field: 'responsavelBatidaMartelo',
          headerName: 'Responsável pela batida do martelo',
          type: [PcColumnTypesEnum.text, PcColumnTypesEnum.responsavel],
          awGroup: PcGridColumnGroupEnum.responsaveis,
          cellEditorParams: {
            responsabilidade: PcResponsabilidadeEnum.responsavelBatidaMartelo,
          } as PcGridResponsaveisCellEditorParams,
        },
        {
          field: 'comentarioFornecedores',
          headerName: 'Comentários do fornecedor',
          type: PcColumnTypesEnum.text,
          filter: false,
          sortable: false,
          width: 250,
          awGroup: PcGridColumnGroupEnum.fornecedores,
          cellEditorParams: {
            type: 'text',
            textarea: true,
            placeholder: 'Comentário do fornecedor',
          } as PcGridCellEditorParams,
          editable: () => !this.pcCabecalhoQuery.isCongelado(),
          valueSetter: params => {
            if (params.oldValue !== params.newValue) {
              this.planoComprasService.putComentarioFornecedores(params.data.id, params.newValue);
            }
            return this.defaultValueSetter(params);
          },
        },
        {
          field: 'fornecedores',
          headerName: 'Fornecedores',
          sortable: false,
          cellRenderer: (params: ICellRendererParamsCustom<PcFornecedor[]>) => {
            const fornecedores = uniqBy(params.value ?? [], 'idFornecedor')
              .map(fornecedor => {
                let classes = 'icon';
                if (fornecedor.favorito) {
                  classes += ' icon-star-full';
                } else if (fornecedor.lastCall) {
                  classes += ' aw-icon-last-call';
                } else {
                  classes += ' nothing';
                }
                return `
                <div class="item">
                  <div class="indicator">
                    <span class="${classes}">
                      <span class="path1"></span>
                      <span class="path2"></span>
                    </span>
                  </div>
                  <span class="nome" title="${fornecedor.nomeFantasia}">
                    ${fornecedor.nomeFantasia}
                  </span>
                </div>`;
              })
              .join('');
            return `<div class="pc-grid-fornecedores-custom">${fornecedores}</div>`;
          },
          awGroup: PcGridColumnGroupEnum.fornecedores,
          width: 400,
          onCellClicked: ({ data }: CellClickedEventCustom<PcFornecedor[]>) => {
            if (!this.pcCabecalhoQuery.isCongelado()) {
              this.router
                .navigate(['fornecedores', data.id], {
                  relativeTo: this.activatedRoute,
                })
                .then();
            }
          },
          filterParams: {
            type: 'text',
            customValueGetter: (data, colDef) =>
              (data[colDef.field] as PcFornecedor[])?.map(fornecedor => fornecedor.nomeFantasia).join(),
          } as PcGridFilterParams,
        },
        {
          field: 'dataPlanejamentoInclusaoPO',
          headerName: 'Inclusão da PO',
          type: [PcColumnTypesEnum.date, PcColumnTypesEnum.datePlanejamento],
        },
        {
          field: 'dataPlanejamentoBatidaMartelo',
          headerName: 'Batida de martelo',
          type: [PcColumnTypesEnum.date, PcColumnTypesEnum.datePlanejamento],
        },
        {
          field: 'dataPlanejamentoEmissaoCC',
          headerName: 'Emissão da CC',
          type: [PcColumnTypesEnum.date, PcColumnTypesEnum.datePlanejamento],
        },
      ],
    },
  ];

  readonly gridOptions = defaultOptions({
    context: this,
    columnDefs: this.gridColDefs,
    animateRows: true,
    headerHeight: 80,
    rowHeight: 70,
    groupHeaderHeight: 25,
    enableCellTextSelection: true,
    rowSelection: 'multiple',
    enableRangeSelection: true,
    immutableData: true,
    suppressMovableColumns: true,
    suppressColumnVirtualisation: true,
    rowBuffer: 200,
    singleClickEdit: true,
    frameworkComponents: {
      [PcFrameworkComponentsEnum.header]: PcGridHeaderComponent,
      [PcFrameworkComponentsEnum.filter]: PcGridFilterComponent,
      [PcFrameworkComponentsEnum.cell]: PcGridCellComponent,
      [PcFrameworkComponentsEnum.responsaveisEdit]: PcGridResponsaveisComponent,
      [PcFrameworkComponentsEnum.datasEdit]: PcGridDatasComponent,
      [PcFrameworkComponentsEnum.cellEditor]: PcGridCellEditorComponent,
    },
    defaultColDef: {
      resizable: false,
      editable: false,
      sortable: true,
      filter: PcFrameworkComponentsEnum.filter,
      minWidth: 70,
      headerComponent: PcFrameworkComponentsEnum.header,
      cellEditor: PcFrameworkComponentsEnum.cellEditor,
      valueSetter: (params: ValueSetterParamsCustom) => {
        return this.defaultValueSetter(params);
      },
    },
    columnTypes: {
      [PcColumnTypesEnum.number]: {
        filterParams: {
          filterable: false,
          conditional: true,
          type: 'number',
        } as PcGridFilterParams,
        cellStyle: { 'text-align': 'end' },
        valueFormatter: params => formatNumber(params.value ?? 0, this.locale, '1.2-2'),
        cellEditorParams: {
          type: 'number',
        } as PcGridCellEditorParams,
      },
      [PcColumnTypesEnum.datePlanejamento]: {
        cellEditorParams: {
          type: 'date',
          placeholder: 'Definir Data',
        } as PcGridCellEditorParams,
        cellEditor: PcFrameworkComponentsEnum.datasEdit,
        editable: () => !this.pcCabecalhoQuery.isCongelado(),
        cellRenderer: PcFrameworkComponentsEnum.cell,
        cellRendererParams: {
          type: 'date',
          allowsDel: true,
        } as PcGridCellRendererParams,
        valueFormatter: params => params.value,
        valueSetter: () => true,
        onDelete: (params: PcGridCellRendererParams) => {
          this.planoComprasService.updateStatusProperty(
            params.data.id,
            PcDatasPlanejamentoEnum[params.colDef.field],
            'loading'
          );

          this.planoComprasService
            .putDatas(
              [params.data.idPlanoCompraGrupo],
              null,
              params.colDef.field,
              0,
              PcDatasPlanejamentoEnum[params.colDef.field]
            )
            .pipe(
              tap(() => {
                this.planoComprasService.updateStatusProperty(
                  params.data.id,
                  PcDatasPlanejamentoEnum[params.colDef.field],
                  'completed'
                );
              })
            )
            .subscribe();
        },
        filter: false,
        minWidth: 100,
        maxWidth: 120,
        awGroup: PcGridColumnGroupEnum.datas,
        cellClass: ['font-weight-bold', 'font-light'],
      },
      [PcColumnTypesEnum.text]: {
        filterParams: {
          filterable: true,
          conditional: true,
          type: 'text',
        } as PcGridFilterParams,
      },
      [PcColumnTypesEnum.date]: {
        filterParams: {
          filterable: false,
          conditional: true,
          type: 'date',
        } as PcGridFilterParams,
        valueFormatter: params => (params.value ? formatDate(params.value, 'dd/MM/yyyy', this.locale) : null),
        cellEditorParams: {
          type: 'date',
        } as PcGridCellEditorParams,
      },
      [PcColumnTypesEnum.responsavel]: {
        editable: true,
        cellEditor: PcFrameworkComponentsEnum.responsaveisEdit,
        sortable: false,
        filterParams: {
          conditional: false,
          filterBy: 'nome',
          customValueGetter: (data, colDef) => (data[colDef.field] as PcResponsavel)?.nome,
        } as PcGridFilterParams,
        width: 150,
        cellClass: ['font-light', 'reponsaveis'],
        cellRendererParams: {
          type: 'text',
          fontColor: 'light',
          allowsDel: true,
        } as PcGridCellRendererParams,
        cellRenderer: PcFrameworkComponentsEnum.cell,
        onDelete: (params: PcGridCellRendererParams) => {
          this.planoComprasService
            .putResponsavel(
              params.data.idPlanoCompraGrupo,
              PcResponsabilidadeEnum[params.colDef.field],
              0,
              false,
              params.colDef.field
            )
            .subscribe();
          this.planoComprasService.update(params.data.id, {
            [params.colDef.field]: null,
          });
        },
        comparator: (valueA: PcResponsavel, valueB: PcResponsavel) => valueA?.nome?.localeCompare(valueB?.nome),
        valueFormatter(params: ValueFormatterParamsCustom<PcResponsavel>): string {
          return params?.value?.nome;
        },
      },
    },
    getRowNodeId: ({ id }: PlanoCompras) => id,
  });

  onGridReady($event: GridReadyEvent): void {
    this.pcGridService.api = $event.api;
    this.pcGridService.columnApi = $event.columnApi as ColumnApiCustom;
    this.pcGridService.setInitialGrid();
  }

  firstDataRendered(): void {
    const idPlanoCompraGrupo = this.routerQuery.getQueryParams<string>('rowId');
    const columnId = this.routerQuery.getQueryParams<string>('colId');
    if (columnId) {
      this.pcGridService.api.ensureColumnVisible(columnId);
    }
    const node = this.pcGridService.api.getRowNode(idPlanoCompraGrupo);
    if (node) {
      const row = this.agGridRef.nativeElement.querySelector(`.ag-row[row-index="${node.rowIndex}"`);
      row?.scrollIntoView?.({ block: 'center' });
    }
  }

  stateChanged(): void {
    this.pcGridService.sortModel = this.pcGridService.columnApi.getColumnState();
    this.pcGridService.filterModel = this.pcGridService.api.getFilterModel();
  }

  defaultValueSetter<T = any>({ newValue, oldValue, colDef, data }: ValueSetterParamsCustom<T>): boolean {
    if (isEqual(oldValue, newValue)) return false;
    this.planoComprasService.update(data.id, { [colDef.field]: newValue });
    return false;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

function templateValueOtherInfo(value: any, otherInfo: any, otherInfoClazz: string = ''): string {
  return `
    <div class="pc-grid-cell-custom">
      <div class="value font-light font-weight-bold text-right">
        ${value}
      </div>
      <div class="other-info mt-1 ${otherInfoClazz}">
        <div class="value" title="${otherInfo}">
          ${otherInfo}
        </div>
      </div>
    </div>
  `;
}
