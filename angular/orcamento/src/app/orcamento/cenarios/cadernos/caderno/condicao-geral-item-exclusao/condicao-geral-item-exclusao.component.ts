import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { Caderno } from '../../../../../models/cadernos/caderno';
import { PatternEnum } from '../../../../../shared/pipes/match-pattern/pattern.enum';
import { AwDialogService } from '../../../../../aw-components/aw-dialog/aw-dialog.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CadernoApendice } from '../../../../../models/cadernos/caderno-apendice.enum';
import { CadernosService } from '../../../../../services/orcamento/cadernos.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

type CadernoTelaSelected = 'condicao-geral' | 'item-exclusao';

@Component({
  selector: 'app-condicao-geral-item-exclusao',
  templateUrl: './condicao-geral-item-exclusao.component.html',
  styleUrls: ['./condicao-geral-item-exclusao.component.scss', '../caderno.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CondicaoGeralItemExclusaoComponent implements OnInit {
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private awDialogService: AwDialogService,
    private cadernosService: CadernosService
  ) {}

  @Input() caderno: Caderno;
  @Input() successFeedback: boolean;
  @Input() idOrcamentoCenario: number;

  patternEnum = PatternEnum;

  selected: CadernoTelaSelected = 'condicao-geral';

  setSelected(selected: CadernoTelaSelected): void {
    this.selected = selected;
    this.changeDetectorRef.markForCheck();
  }

  openDeleteApendiceModal(apendice: string, nomeApendice: string, statusApendice?: boolean): void {
    if (statusApendice) {
      this.awDialogService.warning({
        title: 'Desabilitar',
        content: `Você tem certeza que deseja desabilitar a planilha "${nomeApendice}"?`,
        secondaryBtn: { title: 'Voltar' },
        primaryBtn: { title: 'Desabilitar', action: bsModalRef => this.toggleStatusApendice(apendice, bsModalRef) },
      });
    } else {
      this.toggleStatusApendice(apendice).subscribe();
    }
  }

  toggleStatusApendice(apendice: string, bsModalRef?: BsModalRef): Observable<Caderno> {
    const key = CadernoApendice.CONDICAO_GERAL === apendice ? 'habilitadoCondicaoGeral' : 'habilitadoItemExcluso';

    return this.cadernosService
      .updateCaderno('' + this.idOrcamentoCenario, this.caderno.idCaderno, {
        ...this.caderno,
        [key]: !this.caderno[key],
      })
      .pipe(
        finalize(() => {
          bsModalRef?.hide();
        })
      );
  }

  ngOnInit(): void {}
}
