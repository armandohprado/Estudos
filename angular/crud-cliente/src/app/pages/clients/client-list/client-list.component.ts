import { Component, OnInit } from '@angular/core';
import { Client } from '../shared/client.model';
import { ClientService } from '../shared/client.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss'],
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  constructor(private clientServicec: ClientService) {}

  ngOnInit() {
    this.clientServicec.getAll().subscribe(
      (clients) => (this.clients = clients),
      (error) => alert('Erro ao carregar a lista')
    );
  }

  deleteClient(clients: any) {
    const mustDelete = confirm('Deseja realmente excluir este item?');

    if (mustDelete) {
      this.clientServicec.delete(clients.id).subscribe(
        () =>
          (this.clients = this.clients.filter((element) => element != clients)),
        () => alert('Erro ao tentar excluir!')
      );
    }
  }
}
