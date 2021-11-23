import { Component, Input, OnInit } from '@angular/core';
import { PlanilhaVendasHibridaService } from '../../../planilha-vendas-hibrida.service';
import { FamiliaGrupoOpcional, GrupoOpcional } from '../../../models/grupo-opcional';
import { Cenario } from '../../../models/cenario';

@Component({
  selector: 'app-ph-opcional-grupao-footer',
  templateUrl: './ph-opcional-grupao-footer.component.html',
  styleUrls: ['./ph-opcional-grupao-footer.component.scss', '../../../footer-familia/footer-familia.component.scss'],
})
export class PhOpcionalGrupaoFooterComponent implements OnInit {
  constructor(public planilhaVendasHibridaService: PlanilhaVendasHibridaService) {}

  @Input() familia: FamiliaGrupoOpcional;
  @Input() grupo: GrupoOpcional;
  @Input() cenario: Cenario;
  @Input() isChangeOrder: boolean;
  ngOnInit(): void {}
}
