import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Cidade } from '../../models/enderecos/cidade';
import { EnderecosService } from './enderecos.service';
import { Estado } from '../../models/enderecos/estado';
import { Pais } from '../../models/enderecos/pais';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EnderecosCidadesResolver implements Resolve<Cidade[]> {
  constructor(private enderecosService: EnderecosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Cidade[]> | Promise<Cidade[]> | Cidade[] {
    return this.enderecosService.getCidades();
  }
}

@Injectable({ providedIn: 'root' })
export class EnderecosEstadosResolver implements Resolve<Estado[]> {
  constructor(private enderecosService: EnderecosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Estado[]> | Promise<Estado[]> | Estado[] {
    return this.enderecosService.getEstados();
  }
}

@Injectable({ providedIn: 'root' })
export class EnderecosPaisesResolver implements Resolve<Pais[]> {
  constructor(private enderecosService: EnderecosService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Pais[]> | Promise<Pais[]> | Pais[] {
    return this.enderecosService.getPaises();
  }
}

export function resolveEnderecos(
  tipos: { estados: boolean; cidades: boolean; paises: boolean } = {
    estados: true,
    cidades: true,
    paises: true,
  }
): any[] {
  const resolvers: any[] = [];
  if (tipos.cidades) {
    resolvers.push(EnderecosCidadesResolver);
  }
  if (tipos.estados) {
    resolvers.push(EnderecosEstadosResolver);
  }
  if (tipos.paises) {
    resolvers.push(EnderecosPaisesResolver);
  }
  return resolvers;
}
