import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { finalize } from 'rxjs/operators';
import { Familia } from '@aw-models/familia';
import { refresh } from '@aw-utils/rxjs/operators';

@Component({
  selector: 'app-modal-nova-familia',
  templateUrl: './modal-nova-familia.component.html',
  styleUrls: ['./modal-nova-familia.component.scss'],
})
export class ModalNovaFamiliaComponent implements OnInit {
  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private orcamentoService: OrcamentoService
  ) {}

  @Input() familia: Familia;
  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;

  familiaForm = this.formBuilder.group({
    nomeFamiliaCustomizada: this.formBuilder.control('', Validators.required),
  });

  loaderSubmit = false;

  ngOnInit(): void {
    if (this.familia) {
      this.familiaForm.setValue({
        nomeFamiliaCustomizada: this.familia.descricaoFamilia,
      });
    }
  }

  addFamilia(): void {
    if (this.familiaForm.valid) {
      this.loaderSubmit = true;
      const payload = this.familia
        ? {
            ...this.familia,
            nomeFamiliaCustomizada: this.familiaForm.value.nomeFamiliaCustomizada,
          }
        : this.familiaForm.value;

      this.orcamentoService
        .salvarFamilia({ ...payload, idOrcamento: this.idOrcamento, idOrcamentoCenario: this.idOrcamentoCenario })
        .pipe(
          refresh(this.orcamentoService.refreshOrcamento(this.idOrcamento, this.idOrcamentoCenario)),
          finalize(() => {
            this.loaderSubmit = false;
          })
        )
        .subscribe(() => {
          this.close();
        });
    }
  }

  close(): void {
    this.bsModalRef.hide();
  }
}
