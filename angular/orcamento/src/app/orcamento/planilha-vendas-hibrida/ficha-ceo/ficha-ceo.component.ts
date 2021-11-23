import { Component, Input, OnInit } from '@angular/core';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { PlanilhaVendasHibridaService } from '../planilha-vendas-hibrida.service';
import { ModalProjetoTecnicoClassificacaoComponent } from '../modal-projeto-tecnico-classificacao/modal-projeto-tecnico-classificacao.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModalItensReutilizadosComponent } from '../modal-itens-reutilizados/modal-itens-reutilizados.component';

@Component({
  selector: 'app-ficha-ceo',
  templateUrl: './ficha-ceo.component.html',
  styleUrls: ['./ficha-ceo.component.scss'],
  animations: [collapseAnimation()],
})
export class FichaCeoComponent implements OnInit {
  constructor(
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private bsModalService: BsModalService
  ) {}

  @Input() idOrcamentoCenario: number;
  editar = false;

  fichaCeoInfo: {
    idOrcamentoCenario: number;
    contatoCliente: string;
    concorrentes: string;
    pontosAtencao: string;
    validadeProposta: number;
    prazoExecucaoProjeto: number;
    prazoExecucaoObra: number;
  } = {
    idOrcamentoCenario: 0,
    contatoCliente: '',
    concorrentes: '',
    pontosAtencao: '',
    validadeProposta: 0,
    prazoExecucaoProjeto: 0,
    prazoExecucaoObra: 0,
  };

  ngOnInit(): void {
    this.planilhaVendasHibridaService.getInfoFichaCEO(this.idOrcamentoCenario).subscribe(infoProjeto => {
      this.fichaCeoInfo.idOrcamentoCenario = this.idOrcamentoCenario;
      this.fichaCeoInfo.contatoCliente = infoProjeto.contatoCliente ? infoProjeto.contatoCliente : '-';
      this.fichaCeoInfo.concorrentes = infoProjeto.concorrentes ? infoProjeto.concorrentes : '-';
      this.fichaCeoInfo.pontosAtencao = infoProjeto.pontosAtencao ? infoProjeto.pontosAtencao : '-';
      this.fichaCeoInfo.prazoExecucaoProjeto = infoProjeto.prazoExecucaoProjeto ? infoProjeto.prazoExecucaoProjeto : 0;
      this.fichaCeoInfo.prazoExecucaoObra = infoProjeto.prazoExecucaoObra ? infoProjeto.prazoExecucaoObra : 0;
      this.fichaCeoInfo.validadeProposta = infoProjeto.validadeProposta ? infoProjeto.validadeProposta : 0;
    });
  }

  editarFichaCEO(): void {
    this.editar = !this.editar;
  }

  salvarFichaCEO(objFichaCEO): void {
    if (objFichaCEO.validadeProposta) {
      objFichaCEO.validadeProposta = +objFichaCEO.validadeProposta;
    }
    this.planilhaVendasHibridaService.salvarFichaCEO(objFichaCEO, this.fichaCeoInfo.idOrcamentoCenario).subscribe();
  }

  openModalProjetoTecnico(): void {
    this.bsModalService.show(ModalProjetoTecnicoClassificacaoComponent, {
      class: 'modal-lg',
      ignoreBackdropClick: false,
      initialState: {
        idOrcamentoCenario: this.idOrcamentoCenario,
      },
    });
  }

  openModalItensReutilizados(): void {
    this.bsModalService.show(ModalItensReutilizadosComponent, {
      class: 'modal-lg',
      ignoreBackdropClick: false,
      initialState: {
        idOrcamentoCenario: this.idOrcamentoCenario,
      },
    });
  }
}
