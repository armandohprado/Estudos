import { Andar } from './andar-dp';
import { Site } from './site-dp';
import { Edificio } from './edificio-dp';

export interface Pavimento {
  edificios?: Edificio[];
  sites?: Site[];
  andares?: Andar[];
}
