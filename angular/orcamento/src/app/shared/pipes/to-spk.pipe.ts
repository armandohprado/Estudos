import { Pipe, PipeTransform } from '@angular/core';
import { SpkEnum, spkList } from '../../models/spk';

@Pipe({ name: 'toSpk' })
export class ToSpkPipe implements PipeTransform {
  spkList = spkList();

  transform(idSpk: SpkEnum): string {
    return this.spkList.find(spk => spk.key === idSpk)?.value;
  }
}
