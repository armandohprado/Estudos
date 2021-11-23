import { GrupoClassificacaoEnum } from '@aw-models/grupo-classificacao.enum';
import { Pipe, PipeTransform } from '@angular/core';

export function bloqueiaServico(classificacao: GrupoClassificacaoEnum): boolean {
  return ![
    GrupoClassificacaoEnum.servico,
    GrupoClassificacaoEnum.empreitada,
    GrupoClassificacaoEnum.locacao,
    GrupoClassificacaoEnum.projetista,
  ].includes(classificacao);
}

@Pipe({ name: 'bloqueiaServico' })
export class BloqueiaServicoPipe implements PipeTransform {
  transform(classificacao: GrupoClassificacaoEnum): boolean {
    return bloqueiaServico(classificacao);
  }
}
