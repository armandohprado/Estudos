import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { QuestionarioComponent } from './questionario.component';
import { ProjetoResolverWithCache } from '@aw-services/orcamento/projeto.resolver';

const routes: Routes = [
  {
    path: '',
    component: QuestionarioComponent,
    resolve: {
      projeto: ProjetoResolverWithCache,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuestionarioRoutingModule {}
