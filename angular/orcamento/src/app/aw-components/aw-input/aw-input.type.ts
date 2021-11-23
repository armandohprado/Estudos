export type AwInputStatus =
  | 'completed'
  | 'valid'
  | 'invalid'
  | 'loading'
  | 'error';

export type AwInputStatusProperty<T> = Partial<Record<keyof T, AwInputStatus>>;
