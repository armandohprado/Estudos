import { Inject, Optional, Pipe, PipeTransform } from '@angular/core';
import { DEFAULT_PIPE_TYPE } from './default.token';

/**
 * @parameter { T (any) } value - Valor original
 * @parameter { R (any) } defaultValue - Valor que substituirá
 * @parameter { DefaultPipeType } type? - Tipo de verificação
 * @option 'loose' - irá fazer uma verificação simples (!!value ? value : default)
 * @option 'strict' - irá fazer uma verificação somente para ver se é null ou undefined (value ?? default)
 */

export type DefaultPipeType = 'loose' | 'strict';

@Pipe({ name: 'default' })
export class DefaultPipe implements PipeTransform {
  constructor(@Optional() @Inject(DEFAULT_PIPE_TYPE) private defaultPipeType: DefaultPipeType) {}

  transform<T = any, R = any>(value: T, defaultValue: R, type?: DefaultPipeType): T | R {
    type ??= this.defaultPipeType;
    return type === 'strict' ? value ?? defaultValue : !!value ? value : defaultValue;
  }
}
