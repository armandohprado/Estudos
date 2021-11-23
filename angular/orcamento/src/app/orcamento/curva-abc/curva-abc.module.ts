import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CurvaABCRoutingModule } from './curva-abc-routing.module';
import { CurvaABCComponent } from './curva-abc.component';
import { SharedModule } from '@aw-shared/shared.module';
import { HeaderCurvaComponent } from './header-curva/header-curva.component';
import { GrupoPropostaModule } from '../../grupo/grupo-proposta.module';
import { AwComponentsModule } from '@aw-components/aw-components.module';
import { SumCurvaABCGroupGoalPipe } from './sum-curva-abcgroup-goal.pipe';
import { ValorConsideradoGrupoPipe } from './valor-considerado-grupo.pipe';
import { CurvaAbcTableComponent } from './curva-abc-table/curva-abc-table.component';

@NgModule({
  declarations: [
    CurvaABCComponent,
    HeaderCurvaComponent,
    SumCurvaABCGroupGoalPipe,
    ValorConsideradoGrupoPipe,
    CurvaAbcTableComponent,
  ],
  imports: [CommonModule, CurvaABCRoutingModule, SharedModule, GrupoPropostaModule, AwComponentsModule],
})
export class CurvaABCModule {}
