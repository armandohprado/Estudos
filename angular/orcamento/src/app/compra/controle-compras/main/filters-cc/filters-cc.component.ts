import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CcGrupoQuery } from '../../state/grupos/cc-grupo.query';
import { ControleComprasService } from '../../state/controle-compras/controle-compras.service';
import { AwSelectFooterOptions } from '@aw-components/aw-select/aw-select.type';
import { ControleComprasQuery } from '../../state/controle-compras/controle-compras.query';

@Component({
  selector: 'app-filters-cc',
  templateUrl: './filters-cc.component.html',
  styleUrls: ['./filters-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersCcComponent implements OnInit {
  constructor(
    public ccGruposQuery: CcGrupoQuery,
    public controleComprasService: ControleComprasService,
    public controleComprasQuery: ControleComprasQuery
  ) {}

  gruposFooterOptions: AwSelectFooterOptions = {
    primaryBtn: {
      title: 'Aplicar',
      defaultAction: true,
    },
    secondaryBtn: {
      title: 'Limpar',
      defaultAction: true,
    },
  };

  grupos: number[] = [];

  ngOnInit(): void {
    this.grupos = this.controleComprasQuery.getValue().filterGrupos ?? [];
  }
}
