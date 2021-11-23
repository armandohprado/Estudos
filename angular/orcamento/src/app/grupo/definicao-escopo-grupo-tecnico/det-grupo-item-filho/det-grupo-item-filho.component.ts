import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GrupoItemTecnico, GrupoItemTecnicoFilho } from '../models/grupo-item';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { DefinicaoEscopoGrupoTecnicoService } from '../definicao-escopo-grupo-tecnico.service';

@Component({
  selector: 'app-deli-grupo-item-filho',
  templateUrl: './det-grupo-item-filho.component.html',
  styleUrls: ['./det-grupo-item-filho.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class DetGrupoItemFilhoComponent implements OnInit {
  constructor(public definicaoEscopoLojaInsumoService: DefinicaoEscopoGrupoTecnicoService) {}

  @Input() grupoItemFilho: GrupoItemTecnicoFilho;
  @Input() grupoItem: GrupoItemTecnico;

  collapse(): void {
    if (!this.grupoItemFilho.opened) {
      this.definicaoEscopoLojaInsumoService.setGrupoItemFilhoAmbientesQuantitativoApi(
        this.grupoItem.idOrcamentoGrupoItem,
        this.grupoItemFilho.idOrcamentoGrupoItem
      );
    } else {
      this.definicaoEscopoLojaInsumoService.updateGrupoItemFilho(
        this.grupoItem.idOrcamentoGrupoItem,
        this.grupoItemFilho.idOrcamentoGrupoItem,
        { opened: false }
      );
    }
  }

  excluir(): void {
    this.definicaoEscopoLojaInsumoService.excluirGrupoItemFilhoApi(
      this.grupoItem.idOrcamentoGrupoItem,
      this.grupoItemFilho.idOrcamentoGrupoItem
    );
  }

  duplicar(): void {
    this.definicaoEscopoLojaInsumoService.duplicarGrupoItemFilhoApi(
      this.grupoItem.idOrcamentoGrupoItem,
      this.grupoItemFilho.idOrcamentoGrupoItem,
      this.grupoItem.idGrupoItem
    );
  }

  ngOnInit(): void {}
}
