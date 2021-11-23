import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyofPlanoCompras } from '../models/plano-compras';
import { getIterablePcGridColumnGroupEnum, PcGridColumnGroupEnum, PcGridService } from '../pc-grid/pc-grid.service';

interface PcColuna {
  id: KeyofPlanoCompras;
  label: string;
  visible: boolean;
  group: PcGridColumnGroupEnum;
}

@Component({
  selector: 'app-pc-colunas',
  templateUrl: './pc-colunas.component.html',
  styleUrls: ['./pc-colunas.component.scss'],
})
export class PcColunasComponent implements OnInit {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private pcGridService: PcGridService) {}

  cols: PcColuna[] = [];

  tudo: boolean;
  dnn: boolean;
  desenvolvimento: boolean;
  responsaveis: boolean;
  fornecedores: boolean;
  datas: boolean;
  tudoI: boolean;
  dnnI: boolean;
  desenvolvimentoI: boolean;
  responsaveisI: boolean;
  fornecedoresI: boolean;
  datasI: boolean;

  pcGridColumnGroupEnum = PcGridColumnGroupEnum;

  selectAll(visible: boolean): void {
    this.cols = this.cols.map(col => ({ ...col, visible }));
    this.dnn = visible;
    this.desenvolvimento = visible;
    this.responsaveis = visible;
    this.fornecedores = visible;
    this.datas = visible;
  }

  selectGroup(group: PcGridColumnGroupEnum, visible: boolean): void {
    this.cols = this.cols.map(col => {
      if (group === col.group) {
        col.visible = visible;
      }
      return col;
    });
    this._checkAll();
  }

  selectOne(id: KeyofPlanoCompras, visible: boolean): void {
    this.cols = this.cols.map(col => {
      if (col.id === id) {
        col.visible = visible;
      }
      return col;
    });
    this._checkAll();
  }

  private _checkAll(): void {
    const isSelected = (group: PcGridColumnGroupEnum, operator: 'some' | 'every') =>
      this.cols.filter(o => o.group === group)[operator](o => o.visible);
    this.tudo = this.cols.every(o => o.visible);
    this.tudoI = this.cols.some(o => o.visible) && !this.tudo;
    const enumIterable = getIterablePcGridColumnGroupEnum([PcGridColumnGroupEnum.tudo]);
    for (const key of enumIterable) {
      this[key] = isSelected(PcGridColumnGroupEnum[key], 'every');
      this[key + 'I'] = isSelected(PcGridColumnGroupEnum[key], 'some') && !this[key];
    }
  }

  navigateBack(): void {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute }).then();
  }

  confirm(): void {
    this.pcGridService.setVisibleCols(this.cols.filter(col => col.visible).map(col => col.id));
    this.navigateBack();
  }

  ngOnInit(): void {
    this.cols = this.pcGridService.columnApi
      .getAllColumns()
      .filter(col => col.getColDef().awGroup)
      .map(col => {
        const { field, headerName, awGroup } = col.getColDef();
        return {
          id: field,
          label: headerName,
          visible: col.isVisible(),
          group: awGroup,
        };
      });
    this._checkAll();
  }
}
