import { Component, OnInit } from '@angular/core';
import { AwFilterPipeProperties } from '@aw-components/aw-filter/aw-filter.pipe';
import { ControleFicha } from './models/fichas';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-controle-ficha',
  templateUrl: './controle-ficha.component.html',
  styleUrls: ['./controle-ficha.component.scss'],
})
export class ControleFichaComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  filters: AwFilterPipeProperties<ControleFicha> = {};

  voltar(): void {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute }).then();
  }

  ngOnInit(): void {}
}
