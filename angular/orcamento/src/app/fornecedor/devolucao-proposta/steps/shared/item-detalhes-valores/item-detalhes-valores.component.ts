import { Component, Input, OnInit } from '@angular/core';
import { Item } from '@aw-models/devolucao-proposta/item';
import { ModalReceberEscopoComponent } from '../../preencher-orcamento';
import { ControlContainer, FormBuilder, FormGroupDirective } from '@angular/forms';
import { Observable } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PavimentoGeneric } from '@aw-models/devolucao-proposta/pavimento-dp-generic';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { UnidadeMedidaService } from '@aw-services/unidade-medida/unidade-medida.service';
import { SubFornecedor } from '@aw-models/devolucao-proposta/subfornecedor';
import { UnidadeMedida } from '@aw-models/unidade-medida';
import { ActivatedRoute } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { UnidadeMedidaQuery } from '@aw-services/unidade-medida/unidade-medida.query';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-item-detalhes-valores',
  templateUrl: './item-detalhes-valores.component.html',
  styleUrls: ['./item-detalhes-valores.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class ItemDetalhesValoresComponent implements OnInit {
  @Input() item: Item;
  @Input() pavimento: PavimentoGeneric;
  @Input() omisso: boolean;

  loadingFornecedor = false;
  subFornecedores$: Observable<SubFornecedor[]>;
  unidades$: Observable<UnidadeMedida[]>;
  exibirCamposDesconto = false;
  supply: boolean;

  constructor(
    public devolucaoProposta: DevolucaoPropostaService,
    private dataDevolucaoProposta: DataDevolucaoPropostaService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private unidadeMedidasService: UnidadeMedidaService,
    private unidadeMedidaQuery: UnidadeMedidaQuery,
    public formGroupDirective: FormGroupDirective,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.supply = this.activatedRoute.snapshot.data[RouteParamEnum.supply];
    this.unidades$ = this.unidadeMedidaQuery.all$;
    this.subFornecedores$ = this.devolucaoProposta.subfornecedores$;
  }

  quantificar(): void {
    this.modalService.show(ModalReceberEscopoComponent, {
      class: 'modal-xxl',
      animated: true,
      initialState: { item: this.item, pavimento: this.pavimento },
      ignoreBackdropClick: true,
    });
  }

  setarSubFornecedores(): void {
    this.loadingFornecedor = true;
    if (!this.subFornecedores$) {
      this.subFornecedores$ = this.dataDevolucaoProposta
        .pegarSubfornecedoresProposta(this.devolucaoProposta.cabecalhoProposta.idProposta)
        .pipe(
          finalize(() => {
            this.loadingFornecedor = false;
            this.item.exibirCamposFornecedor = true;
          })
        );
    } else {
      this.loadingFornecedor = false;
      this.item.exibirCamposFornecedor = true;
    }
  }
}
