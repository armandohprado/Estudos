import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FamiliaGrupoOpcional } from '../models/grupo-opcional';
import { trackByFactory } from '@aw-utils/track-by';
import { PlanilhaVendasHibridaOpcionalService } from '../planilha-vendas-hibrida-opcional.service';
import { Cenario } from '../models/cenario';
import { PhOpcionalFamiliaComponent } from './ph-opcional-familia/ph-opcional-familia.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ph-opcional',
  templateUrl: './ph-opcional.component.html',
  styleUrls: ['./ph-opcional.component.scss', '../planilha-vendas-hibrida.component.scss'],
})
export class PhOpcionalComponent implements OnInit {
  @Input() idOrcamentoCenario: number;
  @Input() cenario: Cenario;
  @Input() isChangeOrder: boolean;
  @ViewChildren('familiaBody') familiasBody: QueryList<ElementRef<HTMLDivElement>>;

  constructor(public planilhaVendasHibridaOpcionalService: PlanilhaVendasHibridaOpcionalService) {}

  trackByOrcamentoFamilia = trackByFactory<FamiliaGrupoOpcional>('idOrcamentoCenarioFamilia');

  ngOnInit(): void {
    forkJoin([
      this.planilhaVendasHibridaOpcionalService.getFamiliaGruposOpcionais(this.idOrcamentoCenario),
      this.planilhaVendasHibridaOpcionalService.getTaxasGrupaoOpcional(this.idOrcamentoCenario),
    ]).subscribe();
  }

  scrollFamiliaBody(component: PhOpcionalFamiliaComponent, direita = false): void {
    const element = component.scrollFamilia.nativeElement;
    const totalScroll = Math.max(element.scrollWidth - element.getBoundingClientRect().width, 0);
    const scrollLeft = element.scrollLeft;
    const scrollTo = direita ? Math.min(scrollLeft + 100, totalScroll) : Math.max(scrollLeft - 100, 0);
    element.scrollTo({ behavior: 'smooth', left: scrollTo });
  }

  atualizarFamilia(): void {
    this.planilhaVendasHibridaOpcionalService.getFamiliaGruposOpcionais(this.idOrcamentoCenario).subscribe();
  }
}
