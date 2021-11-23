import { Component, Inject, OnInit } from '@angular/core';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { BehaviorSubject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CadernoResumoJustificacao } from '@aw-models/cadernos/cadernoLayout';
import { tap } from 'rxjs/operators';
import { WINDOW_TOKEN } from '@aw-shared/tokens/window';

@Component({
  selector: 'app-modal-evidencias-caderno',
  templateUrl: './modal-evidencias-caderno.component.html',
  styleUrls: ['./modal-evidencias-caderno.component.scss'],
})
export class ModalEvidenciasCadernoComponent implements OnInit {
  constructor(
    private cadernosService: CadernosService,
    public bsModalRef: BsModalRef,
    @Inject(WINDOW_TOKEN) private window: Window
  ) {}
  idOrcamentoCenario: number;
  evidencias$ = new BehaviorSubject<CadernoResumoJustificacao[]>([]);
  ngOnInit(): void {
    this.cadernosService
      .getEvidencias(this.idOrcamentoCenario)
      .pipe(
        tap(resp => {
          this.evidencias$.next(resp);
        })
      )
      .subscribe();
  }

  download(url: string): void {
    this.window.open(url, '_blank');
  }
}
