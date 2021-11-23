import { InjectionToken } from '@angular/core';
import { DefaultPipeType } from './default.pipe';

export const DEFAULT_PIPE_TYPE = new InjectionToken<DefaultPipeType>(
  'DEFAULT_PIPE_TYPE'
);
