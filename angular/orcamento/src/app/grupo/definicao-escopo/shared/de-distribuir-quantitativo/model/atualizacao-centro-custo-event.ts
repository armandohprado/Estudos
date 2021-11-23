import { Pavimento } from './pavimento';
import { CentroCusto } from './centro-custo';
import { Fase } from './fase';

export interface AtualizacaoCentroCustoEvent {
  fase?: Fase;
  pavimento?: Pavimento;
  centroCusto: CentroCusto;
  oldQtde: number;
  newQtde: number;
}
