import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { RouteParamEnum } from '@aw-models/route-param.enum';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  constructor(private router: Router, private routerQuery: RouterQuery) {}

  home(): void {
    const idProjeto = this.routerQuery.getParams(RouteParamEnum.idProjeto);
    this.router.navigateByUrl(`projetos/${idProjeto}/orcamentos`).then();
  }
}
