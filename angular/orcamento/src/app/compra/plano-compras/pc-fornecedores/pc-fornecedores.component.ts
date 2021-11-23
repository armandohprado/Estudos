import { Component, OnInit } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanoComprasQuery } from '../state/plano-compras/plano-compras.query';
import { Observable } from 'rxjs';
import { PlanoCompras } from '../models/plano-compras';
import { PlanoComprasService } from '../state/plano-compras/plano-compras.service';
import { SelectFornecedor } from '@aw-components/select-fornecedores/select-fornecedores.component';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Component({
  selector: 'app-pc-fornecedores',
  templateUrl: './pc-fornecedores.component.html',
  styleUrls: ['./pc-fornecedores.component.scss'],
})
export class PcFornecedoresComponent implements OnInit {
  constructor(
    private planoComprasQuery: PlanoComprasQuery,
    private routerQuery: RouterQuery,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private planoComprasService: PlanoComprasService
  ) {}

  planoCompra$: Observable<PlanoCompras>;
  idOrcamento: number;
  idPlanoCompraGrupo: string;

  onSelect(fornecedor: SelectFornecedor): void {
    this.planoComprasService.addFornecedor(this.idPlanoCompraGrupo, fornecedor);
  }

  onRemove(fornecedor: SelectFornecedor): void {
    this.planoComprasService.removeFornecedor(this.idPlanoCompraGrupo, fornecedor.idOrcamentoGrupoFornecedor);
  }

  voltar(): void {
    this.router
      .navigate(['../../'], {
        relativeTo: this.activatedRoute,
        queryParams: {
          colId: 'fornecedores',
          rowId: this.idPlanoCompraGrupo,
        },
      })
      .then();
  }

  ngOnInit(): void {
    this.idPlanoCompraGrupo = this.routerQuery.getParams(RouteParamEnum.idPlanoCompraGrupo);
    this.planoCompra$ = this.planoComprasQuery.selectEntity(this.idPlanoCompraGrupo);
    this.idOrcamento = +this.routerQuery.getParams(RouteParamEnum.idOrcamento);
  }
}
