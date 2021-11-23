import { CompraNegociacaoGrupo } from '../../compra/models/cn-grupo';

export interface GrupoTransferencia extends CompraNegociacaoGrupo {
  transferencia?: number;
  valorSaldoUtilizado?: number;
  idPlanilhaHibridaDestinoTransferenciaCO?: number;

  bloqueado?: boolean;
  updated?: boolean;
}
