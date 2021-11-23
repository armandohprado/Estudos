import { Component } from '@angular/core';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-modo-exibicao',
  templateUrl: './modo-exibicao.component.html',
  styleUrls: ['./modo-exibicao.component.scss'],
})
export class ModoExibicaoComponent {
  constructor(public orcamentoService: OrcamentoService, private activatedRoute: ActivatedRoute) {}

  idOrcamento = +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);

  alterarModoExibicao(event: boolean): void {
    this.orcamentoService.putModoExibicao(this.idOrcamento, event).subscribe();
  }
}
