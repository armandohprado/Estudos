import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FamiliaGrupoOpcional, GrupaoOpcional } from '../../models/grupo-opcional';
import { BehaviorSubject } from 'rxjs';
import { PlanilhaVendasHibridaService } from '../../planilha-vendas-hibrida.service';
import { PlanilhaVendasHibridaOpcionalService } from '../../planilha-vendas-hibrida-opcional.service';
import { tap } from 'rxjs/operators';
import { Cenario } from '../../models/cenario';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-ph-opcional-familia',
  templateUrl: './ph-opcional-familia.component.html',
  styleUrls: ['./ph-opcional-familia.component.scss'],
})
export class PhOpcionalFamiliaComponent implements OnInit {
  constructor(
    private planilhaVendasHibridaService: PlanilhaVendasHibridaService,
    private planilhaVendasHibridaOpcionalService: PlanilhaVendasHibridaOpcionalService
  ) {}
  @Input() familia: FamiliaGrupoOpcional;
  @Input() cenario: Cenario;
  @Input() isChangeOrder: boolean;
  @Output() atualizarFamilia = new EventEmitter();
  @ViewChild('scrollFamilia') scrollFamilia: ElementRef<HTMLDivElement>;

  trackByGrupao = trackByFactory<GrupaoOpcional>('idGrupao');

  _grupao$ = new BehaviorSubject<GrupaoOpcional[]>([]);
  grupao$ = this._grupao$.asObservable();

  ngOnInit(): void {
    this.planilhaVendasHibridaOpcionalService
      .getGrupaoOpcional(this.familia.idOrcamentoCenarioFamilia)
      .pipe(tap(grupoes => this._grupao$.next(grupoes)))
      .subscribe();
  }

  atualizarGrupao(idOrcamentoCenarioFamilia: number): void {
    this.planilhaVendasHibridaOpcionalService
      .getGrupaoOpcional(this.familia.idOrcamentoCenarioFamilia)
      .pipe(
        tap(grupoes => {
          this._grupao$.next(grupoes);
          this.atualizarFamiliaMethod();
        })
      )
      .subscribe();
  }

  atualizarFamiliaMethod(): void {
    this.atualizarFamilia.emit();
  }
}
