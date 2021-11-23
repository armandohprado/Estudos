import { TrackByFunction } from '@angular/core';
import { CliFuncao } from '@aw-models/funcao';

export interface CurvaFinanceira {
  id: number;
  idProjeto: number;
  descricao: string;
  _id: number;
  _funcao: CliFuncao;
}

export interface DataCurvaFinanceira {
  idObraCurvaFinanceira: number;
  congelado: boolean;
  alteraPercentual: boolean;
  periodos: CurvaFinanceiraPeriodo[];
}

export interface CurvaFinanceiraPeriodo {
  idObraCurvaFinanceiraPeriodo: number;
  ordem: number;
  dataInicio: Date;
  dataFim: Date;
  relatorioEnviado: boolean;
  execucaoPrevista: number;
  execucaoPrevistaAcumulada: number;
  execucaoPrevistaTemporario: number;
  execucaoPrevistaAcumuladaTemporario: number;
  execucaoRealizada: number;
  execucaoRealizadaAcumulada: number;

  _id: number;
  _idCurvaFinanceira: number;
  _row: number;
}

export interface CurvaFinanceiraPeriodoAtualizarPayload {
  idObraCurvaFinanceiraPeriodo: number;
  execucaoPrevistaTemporario: number;
}

export const trackByCurvaFinanceira: TrackByFunction<CurvaFinanceira> = (_, element) => element.id;
