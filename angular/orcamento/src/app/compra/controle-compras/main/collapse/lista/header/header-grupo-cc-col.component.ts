import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { KeyofCcGrupos, CnTipoGrupoEnum } from '../../../../../models/cn-grupo';
import { ControleComprasQuery } from '../../../../state/controle-compras/controle-compras.query';
import { ControleComprasService } from '../../../../state/controle-compras/controle-compras.service';
import { Observable } from 'rxjs';
import { CcSort } from '@aw-models/controle-compras/controle-compras.model';
import { Order } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { AwFilterConditional, AwFilterType } from '@aw-components/aw-filter/aw-filter.type';
import { AwFilterPipeType } from '@aw-components/aw-filter/aw-filter.pipe';
import { isNil } from 'lodash-es';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-header-grupo-cc-col',
  templateUrl: './header-grupo-cc-col.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      app-header-grupo-cc-col .grid-item {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
    `,
  ],
})
export class HeaderGrupoCcColComponent implements OnInit {
  constructor(
    private controleComprasQuery: ControleComprasQuery,
    private controleComprasService: ControleComprasService
  ) {}

  @Input() tipo: CnTipoGrupoEnum;
  @Input() propertyGrupo: KeyofCcGrupos;
  @Input() name: string | SafeHtml;
  @Input() type: AwFilterType;
  @Input() sort: CcSort;

  filter$: Observable<AwFilterPipeType>;

  updateSort(property: KeyofCcGrupos, order: Order): void {
    this.controleComprasService.updateSort(this.tipo, { property, order });
  }

  removeSort(): void {
    this.controleComprasService.updateSort(this.tipo, null);
  }

  onFilter(term: any): void {
    let ccFilter: AwFilterPipeType = {
      term,
      type: this.type,
      filterType: 'filter',
    };
    if (!term) {
      ccFilter = null;
    }
    this.controleComprasService.updateFilter(this.tipo, this.propertyGrupo, ccFilter);
  }

  onConditional($event: AwFilterConditional<any>): void {
    let ccFilter: AwFilterPipeType = {
      conditional: $event,
      type: this.type,
      filterType: 'conditional',
    };
    if (isNil($event?.term) || $event?.term === '') {
      ccFilter = null;
    }
    this.controleComprasService.updateFilter(this.tipo, this.propertyGrupo, ccFilter);
  }

  ngOnInit(): void {
    this.filter$ = this.controleComprasQuery.selectFilter(this.tipo, this.propertyGrupo);
  }
}
