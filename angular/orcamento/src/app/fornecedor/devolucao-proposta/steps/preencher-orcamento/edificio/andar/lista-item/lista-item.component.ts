import { Component, Input, OnInit } from '@angular/core';
import { Item } from '@aw-models/devolucao-proposta/item';

@Component({
  selector: 'app-lista-item',
  templateUrl: './lista-item.component.html',
  styleUrls: ['./lista-item.component.scss'],
})
export class ListaItemComponent implements OnInit {
  @Input() item: Item;
  @Input() first: boolean;
  @Input() last: boolean;
  @Input() omisso: boolean;
  isOpen = false;
  @Input() pavimento;
  collapsed = false;

  constructor() {}

  ngOnInit(): void {
    this.isOpen = !!this.item.open;
  }
}
