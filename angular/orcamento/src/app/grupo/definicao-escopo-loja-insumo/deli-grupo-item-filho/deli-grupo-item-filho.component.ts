import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GrupoItemDELI, GrupoItemDELIFilho } from '../models/grupo-item';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { DefinicaoEscopoLojaInsumoService } from '../definicao-escopo-loja-insumo.service';
import { AW_REFERENCIA_REGEXP } from '../../../models';

@Component({
  selector: 'app-deli-grupo-item-filho',
  templateUrl: './deli-grupo-item-filho.component.html',
  styleUrls: ['./deli-grupo-item-filho.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class DeliGrupoItemFilhoComponent implements OnInit {
  constructor(public definicaoEscopoLojaInsumoService: DefinicaoEscopoLojaInsumoService) {}

  @Input() grupoItemFilho: GrupoItemDELIFilho;
  @Input() grupoItem: GrupoItemDELI;

  awReferenciaReg = AW_REFERENCIA_REGEXP;

  collapse(): void {
    if (this.grupoItemFilho.opened) {
      this.definicaoEscopoLojaInsumoService.updateGrupoItemFilho(
        this.grupoItem.idOrcamentoGrupoItem,
        this.grupoItemFilho.idOrcamentoGrupoItem,
        { opened: false }
      );
    } else {
      this.definicaoEscopoLojaInsumoService.setGrupoItemFilhoProdutosApi(
        this.grupoItem.idOrcamentoGrupoItem,
        this.grupoItemFilho.id,
        this.grupoItemFilho.idOrcamentoGrupoItem
      );
    }
  }

  ngOnInit(): void {}
}
