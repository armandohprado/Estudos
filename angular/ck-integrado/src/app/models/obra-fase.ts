import { TrackByFunction } from '@angular/core';
import { CliFuncao } from '@aw-models/funcao';

export interface ObraFase {
  idObraFase: number;
  idProjeto: number;
  descricao: string;
  alteraPercentual: boolean;
  alteraPercentualCargo: number;
  obraFasePeriodo: ObraFasePeriodo[];
  dataPublicacao:Date;
  _id: number;
  _funcao: CliFuncao;
}

export interface ObraFasePeriodo {
  idObraFasePeriodo: number;
  idObraFase: number;
  dataInicio: Date;
  dataFim: Date;
  relatorioEnviado: boolean;
  execucaoPrevista: number;
  execucaoPrevistaAcumulada: number;
  execucaoRealizada: number;
  execucaoRealizadaAcumulada: number;
  execucaoPrevistaTemporario: number;
  execucaoPrevistaAcumuladaTemporario: number;

  execucaoPrevistaAcumuladaInicial:number;
  execucaoPrevistaInicial:number;

  ordem: number;

  _id: number;
  _idObraFase: number;
  _row: number;
}

export interface ObraFasePeriodoAtualizarPayload {
  idObraFasePeriodo: number;
  execucaoPrevistaTemporario: number;
}

export const trackByObraFase: TrackByFunction<ObraFase> = (_, element) => element.idObraFase;
