import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { WINDOW_TOKEN } from '@aw-shared/tokens/window';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-devolucao-proposta',
  templateUrl: './devolucao-proposta.component.html',
  styleUrls: ['./devolucao-proposta.component.scss'],
})
export class DevolucaoPropostaComponent implements OnInit, OnDestroy {
  constructor(
    public devolucaoProposta: DevolucaoPropostaService,
    private routerQuery: RouterQuery,
    @Inject(WINDOW_TOKEN) private window: Window,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  cabecalho$ = this.devolucaoProposta.cabecalhoProposta$;

  navigateToTutorial(): void {
    this.devolucaoProposta.mostrarTutorial = false;
    this.router
      .navigate(['tutorial'], {
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
      })
      .then();
  }

  ngOnInit(): void {
    this.devolucaoProposta.mostrarTutorial = true;
    this.window.scrollTo({ top: 0 });
    this.cabecalho$ = this.devolucaoProposta.cabecalhoProposta$;
  }

  ngOnDestroy(): void {
    this.devolucaoProposta.mostrarTutorial = false;
  }
}
