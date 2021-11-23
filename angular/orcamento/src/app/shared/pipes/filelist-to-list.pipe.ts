import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filelistToList' })
export class FilelistToListPipe implements PipeTransform {
  transform(filelist: FileList | undefined | null): string[] {
    if (!filelist?.length) {
      return [];
    }
    return Array.from({ length: filelist.length }).map((_, index) => filelist.item(index).name);
  }
}
