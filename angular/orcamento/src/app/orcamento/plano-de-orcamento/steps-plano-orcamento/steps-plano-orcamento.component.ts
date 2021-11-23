import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export enum PlanoOrcamentoTabsEnum {
  datas,
  grupos,
  responsaveis,
  fornecedores,
  anotacoes,
}
@Component({
  selector: 'app-steps-plano-orcamento',
  templateUrl: './steps-plano-orcamento.component.html',
  styleUrls: ['./steps-plano-orcamento.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepsPlanoOrcamentoComponent {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public orcamentoService: OrcamentoService
  ) {}
  @ViewChild('stepper', { static: false }) stepper;

  PlanoOrcamentoTabsEnum = PlanoOrcamentoTabsEnum;

  selectedIndex$ = this.activatedRoute.fragment.pipe(
    map(frament => {
      return PlanoOrcamentoTabsEnum[frament];
    })
  );

  existeGrupoes$: Observable<boolean> = this.orcamentoService.orcamento$.pipe(
    filter(orcamento => !!orcamento?.grupoes),
    map(orcamento => orcamento.grupoes.length > 0)
  );

  mudarStep(index: number): void {
    this.router.navigate([], { relativeTo: this.activatedRoute, fragment: PlanoOrcamentoTabsEnum[index] }).then();
  }
}
