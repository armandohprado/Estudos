import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { EqualizacaoPropostaService } from '../equalizacao-proposta.service';
import { EpHistorico } from '../model/historico';
import { delay, finalize, tap } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-ep-historico',
  templateUrl: './ep-historico.component.html',
  styleUrls: ['./ep-historico.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpHistoricoComponent implements OnInit, AfterViewInit {
  constructor(
    private equalizacaoPropostaService: EqualizacaoPropostaService,
    private changeDetectorRef: ChangeDetectorRef,
    private bsModalRef: BsModalRef<EpHistoricoComponent>
  ) {}

  @ViewChildren('itemTemplateRef') readonly itemsTemplateRef: QueryList<ElementRef<HTMLLIElement>>;
  @Input() idOrcamentoGrupo: number;

  historico: EpHistorico[] = [];
  loading = true;

  readonly trackBy = trackByFactory<EpHistorico>('idEqualizacaoHistorico');

  close(): void {
    this.bsModalRef.hide();
  }

  ngOnInit(): void {
    this.equalizacaoPropostaService
      .getHistorico(this.idOrcamentoGrupo)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        }),
        tap(historico => {
          this.historico = historico;
        }),
        delay(0)
      )
      .subscribe(() => {
        if (this.itemsTemplateRef.length) {
          this.itemsTemplateRef.first?.nativeElement.focus();
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.itemsTemplateRef.length) {
      this.itemsTemplateRef.first?.nativeElement.focus();
    }
  }
}
