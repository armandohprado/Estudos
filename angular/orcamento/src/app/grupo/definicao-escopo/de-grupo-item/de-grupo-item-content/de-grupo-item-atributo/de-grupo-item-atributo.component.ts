import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import {
  GrupoComboConteudo,
  GrupoItemAtributo,
  GrupoItemDadoAtributo,
  GrupoItemDadoAtributoCombo,
} from '../../../model/grupo-item-atributo';
import { GrupoItemDE } from '../../../model/grupo-item';
import { isNil } from 'lodash-es';
import { DefinicaoEscopoService } from '../../../definicao-escopo.service';
import { AwSelectComparatorFn } from '@aw-components/aw-select/aw-select.type';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-de-grupo-item-atributo',
  templateUrl: './de-grupo-item-atributo.component.html',
  styleUrls: ['./de-grupo-item-atributo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeGrupoItemAtributoComponent implements OnInit {
  constructor(public definicaoEscopoService: DefinicaoEscopoService) {}

  @Input() grupoItemAtributo: GrupoItemAtributo;
  @Input() grupoItem: GrupoItemDE;

  idOrcamentoGrupoItem: number;
  idOrdem: string;

  trackByGrupoItemDadoAtributo = trackByFactory<GrupoItemDadoAtributo>('idGrupoItemDadoAtributo');
  trackByGrupoItemDadoAtributoCombo = trackByFactory<GrupoItemDadoAtributoCombo>('idGrupoItemDadoAtributoCombo');
  trackByGrupoComboConteudo = trackByFactory<GrupoComboConteudo>('idGrupoComboConteudo');

  grupoComboConteudoComparator: AwSelectComparatorFn<GrupoComboConteudo> = (valueA, valueB) =>
    valueA?.idGrupoComboConteudo === valueB?.idGrupoComboConteudo;

  formatAtributo = (value: string) => {
    const newValue = value ? '' + value.trim() : '';
    return isNil(newValue) || newValue === '' ? ' - ' : newValue;
  };

  onAtributoChange(
    grupoItemDadoAtributo: GrupoItemDadoAtributo,
    grupoItemDadoAtributoCombo?: GrupoItemDadoAtributoCombo,
    grupoComboConteudo?: GrupoComboConteudo
  ): void {
    this.definicaoEscopoService.changeAtributo(
      this.idOrcamentoGrupoItem,
      this.grupoItemAtributo,
      grupoItemDadoAtributo,
      grupoItemDadoAtributoCombo,
      grupoComboConteudo
    );
  }

  ngOnInit(): void {
    this.idOrcamentoGrupoItem = this.grupoItem.idOrcamentoGrupoItem;
    this.idOrdem = this.grupoItem.idOrcamentoGrupoItem + '-' + this.grupoItemAtributo.ordem;
  }
}
