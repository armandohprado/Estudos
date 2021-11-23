import { Component, Input, OnInit } from '@angular/core';
import { PavimentoGeneric } from '@aw-models/devolucao-proposta/pavimento-dp-generic';
import { first } from 'lodash-es';
import { forkJoin, Observable } from 'rxjs';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { trackByFactory } from '@aw-utils/track-by';
import { Item } from '@aw-models/devolucao-proposta/item';
import { catchAndThrow } from '@aw-utils/rxjs/operators';

@Component({
  selector: 'app-andar',
  templateUrl: './andar.component.html',
  styleUrls: ['./andar.component.scss'],
})
export class AndarComponent implements OnInit {
  @Input() index: number;
  @Input() id: number;
  @Input() pavimento: PavimentoGeneric;
  quantitativo;
  collapsed = false;
  addItemOmisso: boolean;
  loaderOmisso = false;
  constructor(
    public devolucaoProposta: DevolucaoPropostaService,
    private dataDevolucaoProposta: DataDevolucaoPropostaService,
    private awDialogService: AwDialogService
  ) {}

  currentPage = 1;
  total$: Observable<number>;

  trackByItem = trackByFactory<Item>('idPropostaItem');

  ngOnInit(): void {
    this.total$ = this.devolucaoProposta.total$(this.pavimento);
  }
  addItem(): void {
    this.loaderOmisso = true;
    const fase$ = this.dataDevolucaoProposta.pegarFase(this.devolucaoProposta.cabecalhoProposta.idProposta);
    const centroCusto$ = this.dataDevolucaoProposta.pegarCentroCusto(
      this.devolucaoProposta.cabecalhoProposta.idProjeto
    );

    forkJoin([fase$, centroCusto$])
      .pipe(
        catchAndThrow(() => {
          this.loaderOmisso = false;
          this.awDialogService.error('Erro ao inserir omisso!', 'Falha na api');
        })
      )
      .subscribe(([fase, centroCusto]) => {
        this.quantitativo = {
          propostaItemQuantitativo: centroCusto.map(d => {
            return {
              idProposta: this.devolucaoProposta.cabecalhoProposta.idProposta,
              idPropostaItemQuantitativo: 0,
              idPropostaItem: 0,
              idFase: first(fase)?.idFase,
              idProjetoEdificioPavimento: this.pavimento.idProjetoEdificioPavimento,
              idProjetoCentroCusto: d.idProjetoCentroCusto,
              quantidade: 0,
            };
          }),
        };
        this.loaderOmisso = false;
        this.pavimento.addOmisso = true;
      });
  }
  itemCollapse(open: boolean): void {
    this.collapsed = open;
    this.pavimento.open = open;
  }
}
