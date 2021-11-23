import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { PlanoCompraQuestao, trackByPlanoCompraQuestao } from '@aw-models/plano-compra-questao';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

let uid = 1;

@Component({
  selector: 'app-plano-compra-questoes',
  templateUrl: './plano-compra-questoes.component.html',
  styleUrls: ['./plano-compra-questoes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanoCompraQuestoesComponent {
  static ngAcceptInputType_showDataFluxoSD: BooleanInput;
  static ngAcceptInputType_readonly: BooleanInput;

  private _showDataFluxoDS = false;
  private _readonly = false;

  @Input() questoes: PlanoCompraQuestao[] = [];
  @Input() dataFluxoSD: Date;
  @Input() dataFluxoSDInvalid: boolean;

  @Output() readonly questoesChange = new EventEmitter<PlanoCompraQuestao[]>();
  @Output() readonly questaoChange = new EventEmitter<PlanoCompraQuestao>();
  @Output() readonly dataFluxoSDChange = new EventEmitter<Date>();

  @Input()
  get showDataFluxoSD(): boolean {
    return this._showDataFluxoDS;
  }
  set showDataFluxoSD(showDataFluxoSD: boolean) {
    this._showDataFluxoDS = coerceBooleanProperty(showDataFluxoSD);
  }

  @Input()
  get readonly(): boolean {
    return this._readonly;
  }
  set readonly(readonly: boolean) {
    this._readonly = coerceBooleanProperty(readonly);
  }

  readonly trackByPlanoCompraQuestao = trackByPlanoCompraQuestao;
  readonly uid = 'plano-compra-questoes-' + uid++;

  readonly bsConfig: Partial<BsDatepickerConfig> = {
    isAnimated: true,
    containerClass: 'theme-primary',
    dateInputFormat: 'DD/MM/YYYY',
  };

  onRespostaChange(questao: PlanoCompraQuestao, $event: boolean): void {
    this.questaoChange.emit({ ...questao, resposta: $event });
    this.questoes = this.questoes.map(_questao => {
      if (_questao.idPlanoCompraQuestao === questao.idPlanoCompraQuestao) {
        _questao = { ..._questao, resposta: $event };
      }
      return _questao;
    });
    this.questoesChange.emit(this.questoes);
  }
}
