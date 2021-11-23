import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CardNovidades, UpdateAndCreateCardNovidades } from '../models/novidade';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-nov-card-re',
  templateUrl: './nov-card-re.component.html',
  styleUrls: ['./nov-card-re.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovCardReComponent implements OnInit {
  constructor(private modalService: BsModalService, private formBuilder: FormBuilder) {}
  @Input() card!: CardNovidades;
  @Output() readonly excluir = new EventEmitter<number>();
  @Output() readonly editar = new EventEmitter<UpdateAndCreateCardNovidades>();
  modalRef!: BsModalRef;
  _editar = false;

  formEditandoCardNovidades!: FormGroup;

  ngOnInit(): void {
    this.setForm();
  }

  excluirCard(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  editarCard(): void {
    this.editar.emit(this.formEditandoCardNovidades.value);
    this._editar = false;
  }

  eventoModal(confirm = false): void {
    if (confirm) {
      this.excluir.emit(this.card.id);
    }
    this.modalRef.hide();
  }

  setForm(): void {
    this.formEditandoCardNovidades = this.formBuilder.group({
      titulo: this.card?.titulo,
      link: this.card?.link,
      corFundo: this.card?.corFundo && `#${this.card.corFundo}`,
      ordem: this.card?.ordem,
      id: this.card.id,
    });
  }

  editMode(): void {
    this.setForm();
    this._editar = !this._editar;
  }
}
