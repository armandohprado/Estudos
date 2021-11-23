import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';
import { PlanilhaVendasHibridaService } from '../planilha-vendas-hibrida.service';
import { ReportsService } from '../../../services/reports/reports.service';

@Component({
  selector: 'app-quadro-resumo',
  templateUrl: './quadro-resumo.component.html',
  styleUrls: ['./quadro-resumo.component.scss'],
})
export class QuadroResumoComponent implements OnInit, OnDestroy {
  constructor(
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    public bsModalRef: BsModalRef,
    private sanitizer: DomSanitizer,
    private reportsService: ReportsService
  ) {}

  bsConfig = { isAnimated: true, containerClass: 'theme-primary' };
  qrReport: string;
  @Input() idOrcamentoCenario: number;
  safeContent: any;

  ngOnInit(): void {
    const url = this.reportsService
      .QuadroResumoHibrida({ IdOrcamentoCenario: this.idOrcamentoCenario }, { format: null })
      .getUrl();
    this.qrReport = `<iframe src="${url}" height="800" width="100%" frameborder="0"></iframe>`;
    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.qrReport);
  }

  ngOnDestroy(): void {}
}
