import { ConnectedPosition } from '@angular/cdk/overlay';

export type AwFilterConditionalTypes =
  | 'contem'
  | 'naoContem'
  | 'igual'
  | 'naoIgual'
  | 'comeca'
  | 'termina'
  | 'menor'
  | 'menorIgual'
  | 'maior'
  | 'maiorIgual'
  | 'entre'
  | 'some'
  | 'every';

export interface AwFilterConditional<T> {
  term: T;
  condition: AwFilterConditionalTypes;
  term2?: T;
  key?: string;
}

export type AwFilterType = 'text' | 'number' | 'date' | 'array';

export interface AwFilterConditionalSelectItem<T> {
  label: string;
  types: AwFilterType[];
  value: AwFilterConditionalTypes;
}

export type AwFilterPosition = 'top' | 'bottom' | 'left' | 'right';

export const awFilterConditionalItems: ReadonlyArray<AwFilterConditionalSelectItem<string | number | Date>> = [
  {
    label: 'Contém',
    types: ['text'],
    value: 'contem',
  },
  {
    label: 'Não contém',
    types: ['text'],
    value: 'naoContem',
  },
  {
    label: 'Igual',
    types: ['text', 'number', 'date'],
    value: 'igual',
  },
  {
    label: 'Não é igual',
    types: ['text', 'number', 'date'],
    value: 'naoIgual',
  },
  {
    label: 'Começa com',
    types: ['text'],
    value: 'comeca',
  },
  {
    label: 'Termina com',
    types: ['text'],
    value: 'termina',
  },
  {
    label: 'Menor que',
    types: ['number', 'date'],
    value: 'menor',
  },
  {
    label: 'Menor ou igual à',
    types: ['number'],
    value: 'menorIgual',
  },
  {
    label: 'Maior que',
    types: ['number', 'date'],
    value: 'maior',
  },
  {
    label: 'Maior ou igual à',
    types: ['number'],
    value: 'maiorIgual',
  },
  {
    label: 'Entre',
    types: ['number', 'date'],
    value: 'entre',
  },
];

export type AwFilterPositions = {
  [key in AwFilterPosition]: ConnectedPosition;
};
