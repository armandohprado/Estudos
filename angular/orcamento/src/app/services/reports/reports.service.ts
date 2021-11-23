import { Inject, Injectable } from '@angular/core';
import { WINDOW_TOKEN } from '@aw-shared/tokens/window';
import { DomSanitizer } from '@angular/platform-browser';
import { Report } from './report';

export interface ReportsOptions {
  toolbar?: boolean;
  format?: string;
  command?: string;
  clearSession?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(@Inject(WINDOW_TOKEN) private window: Window, private domSanitizer: DomSanitizer) {}

  private _createReport(reportName: string, params: Record<string, any>): Report {
    return new Report(this.window, this.domSanitizer, reportName, params);
  }

  FichaCeo(params: { IdOrcamentoCenario: number }, options?: ReportsOptions): Report {
    return this._createReport('FichaCEO', { ...params, ...options });
  }

  PlanilhaAWItensFamiliaGrupaoGrupoAndarCentroCustoFamiliaChangeOrder(
    params: { IdOrcamentoCenario: number },
    options?: ReportsOptions
  ): Report {
    return this._createReport('PlanilhaAWItensFamiliaGrupaoGrupoAndarCentroCustoFamiliaChangeOrder', {
      ...params,
      ...options,
    });
  }

  PlanilhaPropostaHistorico(params: { IdPropostaHistorico: number }, options?: ReportsOptions): Report {
    return this._createReport('PropostaHistorico', {
      ...params,
      ...options,
    });
  }

  Proposta(params: { IdProjeto: number; IdProposta: number }, options?: ReportsOptions): Report {
    return this._createReport('PropostaV2', { ...params, ...options });
  }

  QuadroResumoHibrida(params: { IdOrcamentoCenario: number }, options?: ReportsOptions): Report {
    return this._createReport('QuadroResumoHibrida', { ...params, ...options });
  }
}
