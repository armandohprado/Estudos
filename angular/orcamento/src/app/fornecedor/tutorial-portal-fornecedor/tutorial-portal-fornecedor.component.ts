import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tutorial-portal-fornecedor',
  templateUrl: './tutorial-portal-fornecedor.component.html',
  styleUrls: ['./tutorial-portal-fornecedor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialPortalFornecedorComponent implements OnInit {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  voltar(): void {
    this.router.navigate(['../', 'interno'], { relativeTo: this.activatedRoute, queryParamsHandling: 'merge' }).then();
  }

  ngOnInit(): void {}
}
