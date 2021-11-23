import { Grupao } from './grupao';

export interface Familia {
  idFamilia?: number;
  numeroFamilia: number;
  idFamiliaCustomizada?: number;
  idOrcamentoFamilia?: number;
  descricaoFamilia: string;
  ordemFamilia: number;
  grupoes: Grupao[];
  idOrcamento?: number;
  idPlanoCompra?: number;
  id?: string;
  customizada?: boolean;

  ativo?: boolean;

  idOrcamentoCenario?: number;
  opcional?: boolean;
  totalSelecionado?: number;
}
