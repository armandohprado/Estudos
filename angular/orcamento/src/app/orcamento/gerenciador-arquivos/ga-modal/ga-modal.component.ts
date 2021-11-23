import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-ga-modal',
  templateUrl: './ga-modal.component.html',
  styleUrls: ['./ga-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaModalComponent implements OnInit {
  constructor(private bsModalRef: BsModalRef) {}

  nomeGrupo: string;
  idOrcamentoGrupo: number;
  idOrcamentoCenario: number;
  idOrcamento: number;
  idProjeto: number;
  readonly: boolean;
  title = 'Gerenciador de Arquivos';
  apenasSelecionados = false;
  destroyState = true;

  @Output() closed = new EventEmitter();

  close(): void {
    this.bsModalRef.hide();
    this.closed.emit();
  }

  ngOnInit(): void {}
}
