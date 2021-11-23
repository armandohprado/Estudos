import { CnGrupo, CnTipoGrupoEnum, KeyofCcGrupos } from '../../compra/models/cn-grupo';
import { Order } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { AwFilterPipeProperties } from '@aw-components/aw-filter/aw-filter.pipe';
import { CnArea } from '../../compra/models/cn-area';
import { CnCausa } from '../../compra/models/cn-causa';
import { EmpresaFaturamento } from '../empresa-faturamento';
import { CnTipoFicha } from '../../compra/models/cn-tipo-ficha';

export interface ControleCompras {
  collapseDireto: boolean;
  loaderDireto?: boolean;
  loaderRefaturado?: boolean;
  collapseRefaturado: boolean;
  contratoTipo: any; // TODO tipo
  filterGrupos: number[];
  filterModel: Partial<{ [key in CnTipoGrupoEnum]: AwFilterPipeProperties<CnGrupo> }>;
  sortModel: Partial<{ [key in CnTipoGrupoEnum]: CcSort }>;
  listaAreas: CnArea[];
  listaCausas: CnCausa[];
  listaCausasDispensa: CnCausa[];
  listaEmpresaFaturamento: EmpresaFaturamento[];
  tiposFicha: CnTipoFicha[];
}

export interface CcSort {
  order: Order;
  property: KeyofCcGrupos;
}
