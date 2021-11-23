import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { GrupoAlt, GrupoRestricaoObra } from '../../../../../models';
import { inOutAnimation } from '@aw-shared/animations/inOut';
import { trackByFactory } from '@aw-utils/track-by';
import { format, parse } from 'date-fns';

@Component({
  selector: 'app-modal-restricoes-da-obra',
  templateUrl: './modal-restricoes-da-obra.component.html',
  styleUrls: ['./modal-restricoes-da-obra.component.scss'],
  animations: [inOutAnimation],
})
export class ModalRestricoesDaObraComponent implements OnInit {
  constructor(private fb: FormBuilder, public bsModalRef: BsModalRef) {}

  formRestricoes: FormGroup;
  grupoRestricaoObra: GrupoRestricaoObra[];
  grupo: GrupoAlt;
  @Output() setGrupoRestricaoObra: EventEmitter<any> = new EventEmitter();

  trackBy = trackByFactory<GrupoRestricaoObra>('idRestricaoObra');

  processForm(): void {
    if (this.formRestricoes.invalid) {
      return;
    }
    const formRestricoes = this.formRestricoes.value;
    const newGrupoRestricaoObra = [];
    const grupoRestricaoObra = this.grupoRestricaoObra;
    grupoRestricaoObra.forEach(restricao => {
      newGrupoRestricaoObra.push({
        idRestricaoObra: restricao.idRestricaoObra,
        nome: restricao.nome,
        restricaoObraHoraInicio: formRestricoes[restricao.idRestricaoObra].restricaoCheck
          ? formRestricoes[restricao.idRestricaoObra].restricaoObraHoraInicio
          : null,
        restricaoObraHoraFim: formRestricoes[restricao.idRestricaoObra].restricaoCheck
          ? formRestricoes[restricao.idRestricaoObra].restricaoObraHoraFim
          : null,
        restricaoComentario: formRestricoes[restricao.idRestricaoObra].restricaoCheck
          ? formRestricoes[restricao.idRestricaoObra].restricaoComentario
          : null,
      });
    });
    this.setGrupoRestricaoObra.emit(newGrupoRestricaoObra);
    this.bsModalRef.hide();
  }

  private setUpForm(): void {
    const restricoes = {};

    this.grupoRestricaoObra.forEach(restricao => {
      const idRestricaoObra: number = restricao.idRestricaoObra;
      const group: any = {};

      const checked = !!(
        (restricao.restricaoObraHoraInicio && restricao.restricaoObraHoraFim) ||
        restricao.restricaoComentario
      );

      group.restricaoCheck = this.fb.control(checked);

      if (!restricao.restricaoComentario) {
        group.restricaoObraHoraInicio = this.fb.control(
          restricao.restricaoObraHoraInicio
            ? format(parse(restricao.restricaoObraHoraInicio, 'HH:mm:ss', new Date()), 'HH:mm')
            : null
        );
        group.restricaoObraHoraFim = this.fb.control(
          restricao.restricaoObraHoraFim
            ? format(parse(restricao.restricaoObraHoraFim, 'HH:mm:ss', new Date()), 'HH:mm')
            : null
        );
      } else {
        group.restricaoComentario = this.fb.control(restricao.restricaoComentario, [
          checked ? Validators.required : null,
        ]);
      }
      restricoes[idRestricaoObra] = this.fb.group(group);
      // restricoes[idRestricaoObra].setValidators(this.restricaoGrpValidator);
    });

    this.formRestricoes = this.fb.group(restricoes);
  }

  ngOnInit(): void {
    this.setUpForm();
  }
}
