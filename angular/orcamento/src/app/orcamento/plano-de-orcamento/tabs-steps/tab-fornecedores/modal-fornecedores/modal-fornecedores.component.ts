import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Fornecedor, Grupo, SituacaoFornecedor } from '../../../../../models';
import { debounceTime, switchMap, take, takeUntil } from 'rxjs/operators';
import { FornecedorService } from '@aw-services/orcamento/fornecedor.service';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { Subject } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MaskEnum } from '@aw-models/mask.enum';

@Component({
  selector: 'app-modal-fornecedores',
  templateUrl: './modal-fornecedores.component.html',
  styleUrls: ['./modal-fornecedores.component.scss'],
})
export class ModalFornecedoresComponent implements OnInit, OnDestroy {
  @Input() idOrcamentoCenario: number;
  @Input() grupo: Grupo;

  fornecedores$ = this.fornecedorService.fornecedores$;
  situacaoFornecedor = SituacaoFornecedor;
  filtersForm: FormGroup = this.formBuilder.group({
    busca: this.formBuilder.control(''),
    situacaoFornecedorEnum: this.formBuilder.control(this.situacaoFornecedor.HOMOLOGADO),
  });

  private _destroy$ = new Subject<void>();

  fornecedoresSelecionados: Fornecedor[];

  maskEnum = MaskEnum;
  loading: boolean;
  constructor(
    private bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    public fornecedorService: FornecedorService,
    private orcamentoService: OrcamentoService,
    private domSanitizer: DomSanitizer
  ) {}

  get mensagem(): string | SafeHtml {
    let situacao: string;

    switch (this.filtersForm.get('situacaoFornecedorEnum').value) {
      case this.situacaoFornecedor.HOMOLOGADO:
        situacao = `homologados no grupo`;
        break;
      case this.situacaoFornecedor.OUTROGRUPO:
        situacao = `homologados na EAP`;
        break;
      case this.situacaoFornecedor.SIMPLESFORNECEDOR:
        situacao = `cadastrados`;
        break;
    }

    return this.domSanitizer.bypassSecurityTrustHtml(`Não existem fornecedores ${situacao} <br/>
          Cadastre na Organização de Projeto`);
  }

  getFornecedores(situacao: SituacaoFornecedor, busca?: string, tipo?: string): void {
    this.fornecedorService.fornecedoresFilters$.next({
      idOrcamento: this.grupo.idOrcamento,
      idGrupo: this.grupo.idGrupo,
      idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
      situacao,
      busca,
      tipo,
    });
  }

  addFornecedores(): void {
    this.loading = true;
    this.fornecedorService
      .addFornecedoresGrupo(
        this.grupo.idOrcamento,
        this.grupo.idGrupo,
        this.grupo.idOrcamentoGrupo,
        this.fornecedoresSelecionados
      )
      .pipe(
        switchMap(() => {
          return this.orcamentoService.refreshOrcamento(this.grupo.idOrcamento, this.idOrcamentoCenario);
        }),
        take(1)
      )
      .subscribe(() => {
        this.close();
        this.loading = false;
      });
  }

  close(): void {
    this.bsModalRef.hide();
  }

  ngOnInit(): void {
    this.fornecedoresSelecionados = this.grupo.fornecedores.filter(element => !element.fornecedorInterno);
    this.getFornecedores(this.situacaoFornecedor.HOMOLOGADO);
    this.filtersForm
      .get('situacaoFornecedorEnum')
      .valueChanges.pipe(takeUntil(this._destroy$))
      .subscribe(value => {
        this.fornecedores$.next([]);
        this.filtersForm.get('busca').reset();
        if (value === this.situacaoFornecedor.HOMOLOGADO) {
          this.getFornecedores(value);
        }
      });
    this.filtersForm.valueChanges
      .pipe(takeUntil(this._destroy$), debounceTime(1000))
      .subscribe(({ busca, situacaoFornecedorEnum }) => {
        const tipo = isNaN(busca) ? 'nome' : 'cnpj';
        if (busca && busca.length > 2) {
          this.getFornecedores(situacaoFornecedorEnum, busca, tipo);
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
