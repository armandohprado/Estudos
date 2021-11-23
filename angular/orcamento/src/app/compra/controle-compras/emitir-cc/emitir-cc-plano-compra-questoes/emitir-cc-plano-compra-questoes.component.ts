import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CnGrupo } from '../../../models/cn-grupo';
import { PlanoCompraQuestao } from '@aw-models/plano-compra-questao';
import { CcGrupoService } from '../../state/grupos/cc-grupo.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-emitir-cc-plano-compra-questoes',
  templateUrl: './emitir-cc-plano-compra-questoes.component.html',
  styleUrls: [
    '../../main/collapse-grupos-cc/lista-grupos-cc/body-header-grupo-cc/body-grupo-cc/tab-confirmacao-compra-cc/tab-confirmacao-compra-cc.component.scss',
    './emitir-cc-plano-compra-questoes.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmitirCcPlanoCompraQuestoesComponent {
  constructor(private ccGrupoService: CcGrupoService) {}

  @Input() form: FormGroup;
  @Input() grupo: CnGrupo;

  get dataFluxoSDControl(): FormControl | undefined {
    return this.form?.get('dataFluxoSD') as FormControl;
  }

  onQuestaoChange($event: PlanoCompraQuestao): void {
    this.ccGrupoService.updateGrupoPlanoCompraQuestao(
      this.grupo.idCompraNegociacaoGrupo,
      $event.idPlanoCompraQuestao,
      $event
    );
  }
}
