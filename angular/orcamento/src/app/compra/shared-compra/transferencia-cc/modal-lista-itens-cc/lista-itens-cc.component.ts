import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { GruposTransferenciaCC } from '@aw-models/transferencia-cc';
import { Observable } from 'rxjs';
import {
  GrupoConfirmacaoCompra,
  GrupoConfirmacaoCompraItens,
} from '../../../../orcamento/planilha-vendas-hibrida/models/confirmacao-compra';
import { map } from 'rxjs/operators';
import { PlanilhaHibridaTransferirSaldoCC } from '../../../../orcamento/planilha-vendas-hibrida/models/transferir-saldo';
import { trackByFactory } from '@aw-utils/track-by';
import { CcGrupoService } from '../../../controle-compras/state/grupos/cc-grupo.service';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';

@Component({
  selector: 'app-lista-itens-cc',
  templateUrl: './lista-itens-cc.component.html',
  styleUrls: ['./lista-itens-cc.component.scss'],
  animations: [collapseAnimation()],
})
export class ListaItensCCComponent implements OnInit {
  constructor(
    public bsModalRef: BsModalRef,
    private ccGruposService: CcGrupoService,
    private awDialogService: AwDialogService
  ) {}

  @Input() grupo: GruposTransferenciaCC;
  grupoConfirmacaoCompra$: Observable<GrupoConfirmacaoCompra>;
  grupoConfirmacaoCompra: GrupoConfirmacaoCompra;
  retornoPayload: PlanilhaHibridaTransferirSaldoCC[] = [];
  confirmarTransferencia: (payload: PlanilhaHibridaTransferirSaldoCC[]) => void;
  loading = false;
  totalTransferir: number;
  idPlanilhaHibrida: number;

  trackByItem = trackByFactory<GrupoConfirmacaoCompraItens>('idCompraNegociacaoGrupoConfirmacaoCompraItem');

  ngOnInit(): void {
    this.ccGruposService
      .getItensCC(this.grupo.idCompraNegociacaoGrupoConfirmacaoCompra, this.idPlanilhaHibrida)
      .pipe(
        map((grupo: GrupoConfirmacaoCompra) => {
          if (!(grupo?.itens.length > 0)) {
            this.awDialogService.error('Essa confirmação de compra não contém itens.');
            this.bsModalRef.hide();
            return grupo;
          }
          grupo.itens
            .map((item: GrupoConfirmacaoCompraItens) => {
              if (this.retornoPayload) {
                const itemAtual = this.retornoPayload.find(
                  x => x.idConfirmacaoCompraItem === item.idConfirmacaoCompraMedicaoItem
                );
                if (itemAtual) {
                  item.valorOriginal = itemAtual.valorOriginal;
                  item.valorTransferido = itemAtual.valorTransferido;
                }
              } else {
                item.valorOriginal = item.valorTransferido;
              }

              return item;
            })
            .reduce((acc, item: GrupoConfirmacaoCompraItens) => {
              acc += item.valorTransferido;
              this.totalTransferir = acc;
              return acc;
            }, 0);
          return grupo;
        })
      )
      .subscribe(x => {
        this.grupoConfirmacaoCompra = x;
      });
  }

  confirmar(): void {
    this.grupo.valorUtilizado = this.totalTransferir;
    this.confirmarTransferencia(
      this.grupoConfirmacaoCompra.itens.map(item => {
        return {
          idCompraNegociacaoGrupo: this.grupo.idCompraNegociacaoGrupo,
          idConfirmacaoCompra: this.grupo.idConfirmacaoCompraLegado,
          idConfirmacaoCompraItem: item.idConfirmacaoCompraMedicaoItem,
          valorOriginal: item.valorOriginal,
          valorTransferido: item.valorTransferido,
        };
      })
    );
    this.bsModalRef.hide();
  }

  close(): void {
    this.bsModalRef.hide();
  }

  calcular(valorAtualizado: number, itemAlterado: GrupoConfirmacaoCompraItens): void {
    itemAlterado.valorTransferido = itemAlterado.valorSaldo >= valorAtualizado ? valorAtualizado : 0;
    this.totalTransferir = this.grupoConfirmacaoCompra.itens.reduce((acc, item: GrupoConfirmacaoCompraItens) => {
      acc += item.valorTransferido;
      return acc;
    }, 0);
  }
}
