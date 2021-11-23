import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { EpPropostaItem } from '../../model/item';
import { EpFornecedor } from '../../model/fornecedor';
import { EpInformacoes } from '../../model/informacaoes';

export interface EpPropostaItemState extends EntityState<EpPropostaItem>, EpInformacoes {
  fornecedores: EpFornecedor[];
  collapseFornecedorHeader: boolean;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'ep-item', idKey: 'idPropostaItem', resettable: true })
export class EpPropostaItemStore extends EntityStore<EpPropostaItemState> {
  constructor() {
    super({ collapseFornecedorHeader: true });
  }
}
