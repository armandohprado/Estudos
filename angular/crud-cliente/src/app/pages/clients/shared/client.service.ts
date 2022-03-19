import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { Client } from "./client.model";

@Injectable({
  providedIn: "root"
})
export class ClientService {
  constructor() {
  }

  mockAtual$ = new BehaviorSubject(mockClients);

  getAll(): Observable<Client[]> {
    return this.mockAtual$.asObservable(
    );
  }

  getById(id: number): Observable<any> {
    if (!id) return of()
    return this.mockAtual$.pipe(map(clientes => clientes.find(cliente => cliente.id === id)));
  }

  create(client: Client): Observable<Client> {
    const create = { ...client, id: Math.ceil(Math.random() * Math.PI * 156) };
    this.mockAtual$.next([...this.mockAtual$.getValue(), create]);
    return of(create);
  }

  update(client: Client): Observable<Client> {
    const clientsSwap = this.mockAtual$.value.map(cliente => {
      if (cliente.id === client.id) {
        return client;
      }
      return cliente;
    });
    this.mockAtual$.next(clientsSwap);
    return of(client);
  }

  delete(id: number): Observable<any> {
    const clientes = this.mockAtual$.getValue();
    const update = clientes.filter(cliente => cliente.id !== id);
    this.mockAtual$.next(update);
    return this.mockAtual$.asObservable();
  }
}

export const mockClients: Client[] = [
  {
    id: 1,
    name: "Mikasa",
    email: "mikasa.ackerman@teste.com.br",
    data_nascimento: "10/08/1960",
    cpf: "12345678909",
    cidade: "são paulo",
    estado: "são paulo",
    CEP: "02440-000"
  },
  {
    id: 2,
    name: "Levi",
    email: "levi.ackerman@teste.com.br",
    data_nascimento: "10/08/1960",
    cpf: "12345678909",
    cidade: "são paulo",
    estado: "são paulo",
    CEP: "02440-000"
  },
  {
    id: 3,
    name: "Eren",
    email: "eren.yeager@teste.com.br",
    data_nascimento: "10/08/1960",
    cpf: "12345678909",
    cidade: "são paulo",
    estado: "são paulo",
    CEP: "02440-000"
  },
  {
    id: 4,
    name: "Armin",
    email: "armin.arlert@teste.com.br",
    data_nascimento: "10/08/1960",
    cpf: "12345678909",
    cidade: "são paulo",
    estado: "são paulo",
    CEP: "02440-000"
  },
  {
    id: 5,
    name: "Annie",
    email: "annie.leohart@teste.com.br",
    data_nascimento: "10/08/1960",
    cpf: "12345678909",
    cidade: "são paulo",
    estado: "são paulo",
    CEP: "02440-000"
  }
];
