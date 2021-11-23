import { FamiliaGrupoAlt } from '@aw-models/familia-grupo-alt';

export interface GrupoAlt extends FamiliaGrupoAlt {
  possuiAwEstimado?: boolean;
  somenteAwEstimado?: boolean;
  possuiMultiplasPropostas?: boolean;
}
