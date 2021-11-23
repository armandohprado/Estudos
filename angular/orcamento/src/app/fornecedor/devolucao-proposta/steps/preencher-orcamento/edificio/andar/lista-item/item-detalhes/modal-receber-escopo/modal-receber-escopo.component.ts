import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { Item } from '@aw-models/devolucao-proposta/item';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { PavimentoGeneric } from '@aw-models/devolucao-proposta/pavimento-dp-generic';

@Component({
  selector: 'app-modal-receber-escopo',
  templateUrl: './modal-receber-escopo.component.html',
  styleUrls: ['./modal-receber-escopo.component.scss'],
})
export class ModalReceberEscopoComponent implements OnInit {
  constructor(
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    public devolucaoProposta: DevolucaoPropostaService,
    private dataDP: DataDevolucaoPropostaService,
    private awDialogService: AwDialogService
  ) {}

  item: Item;
  pavimento: PavimentoGeneric;
  loaderModal = false;

  closeModalContainer(): void {
    this.loaderModal = true;
    const cabecalho = this.dataDP.preencherCabecalho(this.item.idProposta);
    const proposta = this.dataDP.atualizarProposta(this.item.idProposta, this.pavimento, this.item);
    forkJoin([cabecalho, proposta])
      .pipe(
        finalize(() => {
          this.loaderModal = false;
          this.bsModalRef.hide();
        })
      )
      .subscribe();
  }

  modalTodosCampos(): void {
    this.awDialogService.warning({
      title: 'Você não preencheu todos os campos.',
      content: `Mas não tem problema. Você pode voltar em outro momento para completar o preenchimento. O importante é que antes de enviar a proposta, todos os campos precisam estar preenchidos.`,
      secondaryBtn: { title: 'Voltar e preencher os campos', useDefaultWidth: false },
      primaryBtn: {
        title: 'Prosseguir e preencher em outro momento',
        action: bsModalRef => {
          bsModalRef.hide();
          this.bsModalRef.hide();
        },
        useDefaultWidth: false,
      },
      bsModalOptions: { class: 'modal-lg' },
    });
  }

  ngOnInit(): void {}
}
