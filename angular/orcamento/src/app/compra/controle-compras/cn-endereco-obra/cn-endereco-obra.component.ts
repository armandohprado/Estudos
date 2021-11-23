import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { cnMapEnderecoObraFormGroupToPayload, cnMapEnderecoObraToFormGroup } from '../../models/cn-endereco-obra';
import { forkJoin, Observable, of } from 'rxjs';
import { Cidade } from '@aw-models/enderecos/cidade';
import { EnderecosService } from '@aw-services/enderecos/enderecos.service';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';

function createFormEndereco(): FormGroup {
  return new FormGroup({
    cep: new FormControl(null, [Validators.required]),
    endereco: new FormControl(null, [Validators.required]),
    complemento: new FormControl(null),
    bairro: new FormControl(null, [Validators.required]),
    idCidade: new FormControl(null, [Validators.required]),
    idEstado: new FormControl(null, [Validators.required]),
    idPais: new FormControl(null, [Validators.required]),
    cidade: new FormControl(null),
  });
}

@Component({
  selector: 'app-cn-endereco-obra',
  templateUrl: './cn-endereco-obra.component.html',
  styleUrls: ['./cn-endereco-obra.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnEnderecoObraComponent implements OnInit {
  constructor(
    private bsModalRef: BsModalRef,
    private projetoService: ProjetoService,
    private enderecosService: EnderecosService,
    private awDialogService: AwDialogService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  readonly form = new FormGroup({
    documento: createFormEndereco(),
    entrega: createFormEndereco(),
  });

  readonly formDocumento = this.form.get('documento') as FormGroup;
  readonly formEntrega = this.form.get('entrega') as FormGroup;

  loading = true;
  saving = false;

  @Input() idProjeto: number;

  close(): void {
    this.bsModalRef.hide();
  }

  save(): void {
    this.saving = true;
    const payload = cnMapEnderecoObraFormGroupToPayload(this.idProjeto, this.form.value);
    this.form.disable();
    this.projetoService
      .putCnEnderecoObra(this.idProjeto, payload)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetectorRef.markForCheck();
          this.form.enable();
        }),
        tap(() => {
          this.awDialogService.success({
            content: 'Endereço salvo com sucesso!',
            primaryBtn: null,
            secondaryBtn: {
              title: 'Fechar',
              action: bsModalRef => {
                bsModalRef.hide();
                this.bsModalRef.hide();
              },
            },
            bsModalOptions: { ignoreBackdropClick: true },
          });
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.projetoService
      .getCnEnderecoObra(this.idProjeto)
      .pipe(
        map(cnMapEnderecoObraToFormGroup),
        switchMap(cnEnderecoObra => {
          const requests: [Observable<Cidade[]>, Observable<Cidade[]>] = [of([]), of([])];
          if (cnEnderecoObra.entrega.idEstado && cnEnderecoObra.entrega.cidade) {
            requests[0] = this.enderecosService.getCidades(cnEnderecoObra.entrega.idEstado);
          }
          if (cnEnderecoObra.documento.idEstado && cnEnderecoObra.documento.cidade) {
            requests[1] = this.enderecosService.getCidades(cnEnderecoObra.documento.idEstado);
          }
          return forkJoin(requests).pipe(
            map(([cidadesEntrega, cidadesDocumento]) => {
              const cidadeEntrega = cidadesEntrega.find(cidade => cidade.nome === cnEnderecoObra.entrega.cidade);
              if (cidadeEntrega) {
                cnEnderecoObra.entrega.idCidade = cidadeEntrega.idCidade;
              }
              const cidadeDocumento = cidadesDocumento.find(cidade => cidade.nome === cnEnderecoObra.documento.cidade);
              if (cidadeDocumento) {
                cnEnderecoObra.documento.idCidade = cidadeDocumento.idCidade;
              }
              return cnEnderecoObra;
            })
          );
        }),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(cnEnderecoObra => {
        this.form.setValue(cnEnderecoObra);
      });
  }
}
