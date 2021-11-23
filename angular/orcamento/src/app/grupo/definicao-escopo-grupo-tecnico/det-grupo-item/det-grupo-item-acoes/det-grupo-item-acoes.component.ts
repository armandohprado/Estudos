import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { GrupoItemTecnico } from '../../models/grupo-item';
import { DefinicaoEscopoGrupoTecnicoService } from '../../definicao-escopo-grupo-tecnico.service';

@Component({
  selector: 'app-del-grupo-item-acoes',
  templateUrl: './det-grupo-item-acoes.component.html',
  styleUrls: [
    '../../../definicao-escopo/de-grupo-item/de-grupo-item-acoes/de-grupo-item-acoes.component.scss',
    './det-grupo-item-acoes.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetGrupoItemAcoesComponent implements OnInit {
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private definicaoEscopoLojaService: DefinicaoEscopoGrupoTecnicoService
  ) {}

  @Input() grupoItem: GrupoItemTecnico;
  collapse(opened: boolean): void {
    if (!opened) {
      this.definicaoEscopoLojaService.setGrupoItemFilhosApi(
        this.grupoItem.idOrcamentoGrupoItem,
        this.grupoItem.idGrupoItem
      );
    } else {
      this.definicaoEscopoLojaService.updateGrupoItem(this.grupoItem.idOrcamentoGrupoItem, { opened: !opened });
    }
  }

  ngOnInit(): void {}
}
