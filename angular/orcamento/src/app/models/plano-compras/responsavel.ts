export type Profissional = 'construtora' | 'vertical';

export interface Responsavel {
  id: number;
  nome: string;
  cargo: string;
  profissional: Profissional;
}
