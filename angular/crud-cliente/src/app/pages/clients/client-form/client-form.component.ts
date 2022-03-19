import { AfterContentChecked, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { Client } from "../shared/client.model";
import { ClientService } from "../shared/client.service";
import { switchMap } from "rxjs";

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
})

export class ClientFormComponent implements OnInit, AfterContentChecked {
  currentAction!: string;
  clientForm!: FormGroup;
  pageTitle!: string;
  serverErrorMessages!: string[];
  submittingForm: boolean = false;
  client: Client = new Client();

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.setCurrentAction();
    this.buildClientForm();
    this.loadClient();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == 'new') this.createClient();
    else this.updateClient();
  }

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path == 'new') this.currentAction = 'new';
    else this.currentAction = 'edit';
  }

  private buildClientForm() {
    this.clientForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      email: [null, [Validators.required, Validators.minLength(2)]],
      cpf: [null, [Validators.required, Validators.minLength(2)]],
      data_nascimento: [null, [Validators.required, Validators.minLength(2)]],
      cidade: [null, [Validators.required, Validators.minLength(2)]],
      CEP: [null, [Validators.required, Validators.minLength(2)]],
      estado: [null, [Validators.required, Validators.minLength(2)]],
    });
  }

  private loadClient() {
    if (this.currentAction == 'edit') {
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            // @ts-ignore
            return this.clientService.getById(+params.get('id'));
          })
        )
        .subscribe(
          (client) => {
            this.client = client;
            this.clientForm.patchValue(client);
          },
          (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
        );
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = 'Cadastro de novo cliente';
    else {
      const clientNome = this.client.name || '';
      this.pageTitle = 'Editando Cliente: ' + clientNome;
    }
  }

  private createClient() {
    const client: Client = Object.assign(new Client(), this.clientForm.value);
    this.clientService.create(client).subscribe(
      (client) => this.actionsForSuccess(client),
    );
  }

  private updateClient() {
    const client: Client = Object.assign(new Client(), this.clientForm.value);

    this.clientService.update(client).subscribe(
      (client) => this.actionsForSuccess(client),
    );
  }

  private actionsForSuccess(client: Client) {
    this.router
      .navigateByUrl('clientes', { skipLocationChange: true })
      .then(() => this.router.navigate(['clientes', client.id ?? 1, 'edit']));
  }

}
