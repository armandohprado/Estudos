import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { EpFornecedor } from '../model/fornecedor';
import { trackByEpFornecedor } from '../utils';
import { EpPropostaItemQuery } from '../state/item/ep-proposta-item.query';

@Component({
  selector: 'app-ep-fornecedores-info',
  templateUrl: './ep-fornecedores-info.component.html',
  styleUrls: ['./ep-fornecedores-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpFornecedoresInfoComponent implements OnInit {
  constructor(public epPropostaItemQuery: EpPropostaItemQuery) {}

  @Input() fornecedores: EpFornecedor[] = [];

  trackByEpFornecedor = trackByEpFornecedor;

  ngOnInit(): void {}
}
