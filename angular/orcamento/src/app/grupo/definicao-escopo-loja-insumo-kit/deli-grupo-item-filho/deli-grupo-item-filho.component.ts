import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GrupoItemKit, GrupoItemKitFilho } from '../models/grupo-item';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { trackByFactory } from '@aw-utils/track-by';
import { GrupoItemFilhoProdutoKit } from '../../definicao-escopo/model/grupo-item';

@Component({
  selector: 'app-deli-grupo-item-filho',
  templateUrl: './deli-grupo-item-filho.component.html',
  styleUrls: ['./deli-grupo-item-filho.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class DeliGrupoItemFilhoComponent implements OnInit {
  constructor() {}

  @Input() grupoItemFilho: GrupoItemKitFilho;
  @Input() grupoItem: GrupoItemKit;

  trackByProdutoKit = trackByFactory<GrupoItemFilhoProdutoKit>();

  ngOnInit(): void {}
}
