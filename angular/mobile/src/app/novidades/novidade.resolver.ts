import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { NovidadeService } from './novidade.service';
import { CardNovidades } from './models/novidade';

@Injectable({
  providedIn: 'root',
})
export class NovidadeResolver implements Resolve<CardNovidades[]> {
  constructor(private novidadesService: NovidadeService) {}

  resolve(): Observable<CardNovidades[]> {
    return this.novidadesService.getCartaoNovidade();
  }
}
