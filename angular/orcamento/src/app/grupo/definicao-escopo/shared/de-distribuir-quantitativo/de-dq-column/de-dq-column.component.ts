import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Pavimento } from '../model/pavimento';
import { Entity } from '@aw-utils/types/entity';
import { CentroCusto } from '../model/centro-custo';
import { AtualizacaoCentroCustoEvent } from '../model/atualizacao-centro-custo-event';
import { trackByFactory } from '@aw-utils/track-by';
import { DistribuirQuantitativoAmbienteEvent } from '../de-distribuir-quantitativo.component';
import { Fase } from '../model/fase';
import { filter, takeUntil } from 'rxjs/operators';
import { DeDistribuirQuantitativoService } from '../de-distribuir-quantitativo.service';
import { Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { CurrencyMaskConfig, CurrencyMaskInputMode } from 'ngx-currency';

@Component({
  selector: 'app-de-dq-column',
  templateUrl: './de-dq-column.component.html',
  styleUrls: ['./de-dq-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeDqColumnComponent implements AfterViewInit, OnDestroy {
  constructor(
    private deDistribuirQuantitativoService: DeDistribuirQuantitativoService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  private _destroy$ = new Subject<void>();

  @Input() @HostBinding('class.last') last: boolean;

  @ViewChildren('input') inputsRef: QueryList<ElementRef<HTMLInputElement>>;

  @Input() pavimento: Pavimento;
  @Input() loading: Entity<boolean> = {};
  @Input() idOrcamentoGrupoItem: number;
  @Input() fase: Fase;
  @Input() quantidadeProperty: 'quantidadeReferencia' | 'quantidadeOrcada';
  @Input() tipoQuantitativo: 'definicao-escopo' | 'devolucao-proposta';
  @Input() sugestaoQtdeReferencia: boolean;
  @Input() enableAmbiente = false;
  @Input() canChangeValue = true;
  @Output() ambiente = new EventEmitter<DistribuirQuantitativoAmbienteEvent>();
  @Output() atualizaCentroCusto = new EventEmitter<AtualizacaoCentroCustoEvent>();

  currencyMaskOptions: Partial<CurrencyMaskConfig> = {
    allowNegative: false,
    align: 'center',
    inputMode: CurrencyMaskInputMode.NATURAL,
  };

  trackByCentroCusto = trackByFactory<CentroCusto>('idProjetoCentroCusto');

  updateCentroCusto(centroCusto: CentroCusto, oldQtde: number | null, newQtde: number | null): void {
    if (oldQtde === newQtde) {
      return;
    }
    this.atualizaCentroCusto.emit({
      fase: this.fase,
      pavimento: this.pavimento,
      centroCusto,
      oldQtde: oldQtde ?? 0,
      newQtde,
    });
  }

  onClick(element: HTMLInputElement, centroCusto: CentroCusto): void {
    this.document.getSelection().removeAllRanges();
    element.select();
    if (centroCusto.ativo) {
      return;
    }
    this.updateCentroCusto(centroCusto, null, 0);
  }

  ngAfterViewInit(): void {
    this.deDistribuirQuantitativoService.focus$
      .pipe(
        takeUntil(this._destroy$),
        filter(() => !(this.document.activeElement instanceof HTMLInputElement))
      )
      .subscribe(id => {
        this.inputsRef.find(element => element.nativeElement.id === id)?.nativeElement?.select();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
