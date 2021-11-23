import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CollapseService {
  /** Whether the other panels should be closed when a panel is opened */
  collapses: any[] = [];
}
