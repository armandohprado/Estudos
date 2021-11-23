import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NovidadeService } from './novidade.service';
import { CardNovidades, UpdateAndCreateCardNovidades } from './models/novidade';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NovCardCComponent } from './nov-card-c/nov-card-c.component';

@Component({
  selector: 'app-novidade',
  templateUrl: './novidade.component.html',
  styleUrls: ['./novidade.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovidadeComponent {
  constructor(public novidadeService: NovidadeService, private modalService: BsModalService) {}

  bsModalRef!: BsModalRef;
  trackByCards = (index: number, item: CardNovidades): number => item.id;

  excluirCard($event: number): void {
    this.novidadeService.excluirCardNovidade($event);
  }

  editarCard(update: UpdateAndCreateCardNovidades): void {
    this.novidadeService.editarCardNovidade(update);
  }

  modalAdicionarCard(): void {
    this.bsModalRef = this.modalService.show(NovCardCComponent);
  }
}
