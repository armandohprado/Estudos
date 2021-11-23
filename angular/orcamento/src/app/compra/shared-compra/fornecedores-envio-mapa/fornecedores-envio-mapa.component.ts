import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CnFornecedor } from '../../models/cn-fornecedor';
import { CnGrupo } from '../../models/cn-grupo';
import { trackByFactory } from '@aw-utils/track-by';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

export enum TipoSelecaoFornecedorEnum {
  semConcorrencia,
  comConcorrencia,
}

@Component({
  selector: 'app-fornecedores-envio-mapa',
  templateUrl: './fornecedores-envio-mapa.component.html',
  styleUrls: ['./fornecedores-envio-mapa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FornecedoresEnvioMapaComponent {
  static ngAcceptInputType_selecionavel: BooleanInput;

  private _fornecedores: CnFornecedor[] = [];

  @Input() grupo: CnGrupo;
  @Input() selectsEmpClassificacao = false;
  @Input() tipoSelecaoFornecedor = TipoSelecaoFornecedorEnum.semConcorrencia;

  @Input()
  get fornecedores(): CnFornecedor[] {
    return this._fornecedores;
  }
  set fornecedores(fornecedores: CnFornecedor[]) {
    this._fornecedores = fornecedores ?? [];
    this.fornecedoresEmitir = this._fornecedores.filter(
      fornecedor => !fornecedor.mapaEmitido && fornecedor.emitirMapaEmissaoCompra
    );
  }

  @Input()
  get selecionavel(): boolean {
    return this._selecionavel;
  }
  set selecionavel(selectable: boolean) {
    this._selecionavel = coerceBooleanProperty(selectable);
  }
  private _selecionavel = false;

  @Output() readonly tipoSelecaoFornecedorChange = new EventEmitter<TipoSelecaoFornecedorEnum>();
  @Output() readonly selecionadoChanged = new EventEmitter<CnFornecedor[]>();

  fornecedoresEmitir: CnFornecedor[] = [];
  tipoSelecaoFornecedorEnum = TipoSelecaoFornecedorEnum;

  trackBy = trackByFactory<CnFornecedor>('idProposta');

  alterarTipoSelecao(tipoSelecaoFornecedorEnum: TipoSelecaoFornecedorEnum): void {
    this.tipoSelecaoFornecedorChange.emit(tipoSelecaoFornecedorEnum);
    if (tipoSelecaoFornecedorEnum === TipoSelecaoFornecedorEnum.semConcorrencia) {
      const primeiroFornecedorSelecionado = this.fornecedoresEmitir.find(fornecedor => fornecedor.selecionado);
      if (primeiroFornecedorSelecionado) {
        this.selecionadoChanged.emit([primeiroFornecedorSelecionado]);
      } else {
        this.selecionadoChanged.emit([]);
      }
    }
  }

  selecionarFornecedor($event: boolean, fornecedorSelecionado: CnFornecedor): void {
    if (this.tipoSelecaoFornecedor === TipoSelecaoFornecedorEnum.semConcorrencia) {
      this.selecionadoChanged.emit($event ? [fornecedorSelecionado] : []);
    } else {
      const fornecedoresSelecionados = this.fornecedoresEmitir.filter(fornecedor => fornecedor.selecionado);
      this.selecionadoChanged.emit(
        $event
          ? [...fornecedoresSelecionados, fornecedorSelecionado]
          : fornecedoresSelecionados.filter(
              fornecedor => fornecedor.idFornecedor !== fornecedorSelecionado.idFornecedor
            )
      );
    }
  }

  selectAll($event: boolean): void {
    this.selecionadoChanged.emit($event ? this.fornecedoresEmitir : []);
  }
}
