import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { finalize, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CnGrupo, CnTipoGrupoEnum } from '../../../../../../models/cn-grupo';
import { CcGrupoService } from '../../../../../state/grupos/cc-grupo.service';
import { CnMigracaoGrupo, CnMigracaoGrupoPayload } from '../../../../../../models/cn-migracao-grupo';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { CurrencyMaskConfig, CurrencyMaskInputMode } from 'ngx-currency';
import { arredondamento } from '@aw-shared/pipes/arredondamento.pipe';

@Component({
  selector: 'app-modal-mudar-faturamento',
  templateUrl: './modal-mudar-faturamento.component.html',
  styleUrls: ['./modal-mudar-faturamento.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalMudarFaturamentoComponent implements OnInit {
  constructor(
    public bsModalRef: BsModalRef,
    private awDialog: AwDialogService,
    private ccGrupoService: CcGrupoService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() grupo: CnGrupo;
  @Input() idStatus: number;

  novaMeta: number;
  percentualImposto: number;
  awProduto: boolean;

  loading = false;
  msgTituloGrupo = {
    direto: 'Compras a serem efetuadas pela AW',
    refaturado: 'Faturado direto para cliente',
  };
  tipoGrupoEnum = CnTipoGrupoEnum;
  migracaoGrupo$: Observable<CnMigracaoGrupo>;

  baseCurrencyOptions: Partial<CurrencyMaskConfig> = {
    allowNegative: false,
    inputMode: CurrencyMaskInputMode.NATURAL,
  };
  currencyOptionsPercent: Partial<CurrencyMaskConfig> = { ...this.baseCurrencyOptions, max: 100, suffix: '%' };

  migrar(migracaoGrupo: CnMigracaoGrupo): void {
    const payload: CnMigracaoGrupoPayload = {
      valorNovaMeta: this.novaMeta ?? migracaoGrupo.valorMetaCompra,
      idCompraNegociacaoGrupo: migracaoGrupo.idCompraNegociacaoGrupo,
      idOrcamentoCenarioGrupoContrato: migracaoGrupo.idOrcamentoCenarioGrupoContrato === 1 ? 2 : 1,
      percentualImposto: this.percentualImposto,
      awProduto: this.awProduto,
    };

    this.loading = true;
    this.ccGrupoService
      .migrarGrupo(payload, this.grupo.tipo, this.grupo.idOrcamentoCenario)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        }),
        catchAndThrow(err => {
          this.awDialog.error(
            'Erro ao tentar migrar o grupo!',
            `${err?.error?.mensagem ?? 'Tente novamente mais tarde!'}`
          );
        }),
        tap(() => {
          this.awDialog.success({
            title: 'Grupo migrado com sucesso!',
            secondaryBtn: {
              action: bsModalRef => {
                bsModalRef.hide();
                this.bsModalRef.hide();
              },
            },
            bsModalOptions: { ignoreBackdropClick: true },
          });
        })
      )
      .subscribe();
  }

  onPercentChange(valorVendaCongelada: number, percentualImposto: number): void {
    this.novaMeta = Math.min(
      this.novaMeta,
      arredondamento(valorVendaCongelada - valorVendaCongelada * (percentualImposto / 100), 2)
    );
  }

  ngOnInit(): void {
    this.migracaoGrupo$ = this.ccGrupoService.getMigrarGrupo(this.grupo.idCompraNegociacaoGrupo).pipe(
      map(migracaoGrupo => ({
        ...migracaoGrupo,
        percentualImposto: this.grupo.tipo === CnTipoGrupoEnum.Refaturado ? 0 : migracaoGrupo.percentualImposto,
      })),
      tap(migracaoGrupo => {
        this.percentualImposto = migracaoGrupo.percentualImposto;
        this.awProduto = migracaoGrupo.awProduto;
      })
    );
  }
}
