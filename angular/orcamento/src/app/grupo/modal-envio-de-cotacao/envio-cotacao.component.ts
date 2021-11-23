import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';
import { Fornecedor, GrupoAlt, PropostaDetalhada, ResponsavelAlt, Visita } from '../../models';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { refreshMap } from '@aw-utils/rxjs/operators';
import { ValidacaoGrupoItem } from '../definicao-escopo/model/grupo-item';
import { TipoGrupoEnum } from '@aw-models/tipo-grupo.enum';
import { OrcamentoGrupoResponsavelService } from '@aw-services/orcamento-grupo-responsavel/orcamento-grupo-responsavel.service';
import { EnvioCotacaoPayload } from '@aw-models/envio-cotacao-payload';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

@Component({
  selector: 'app-modal-envio-de-cotacao',
  templateUrl: './envio-cotacao.component.html',
  styleUrls: ['./envio-cotacao.component.scss'],
})
export class EnvioCotacaoComponent implements OnInit, OnDestroy {
  constructor(
    public orcamentoService: OrcamentoService,
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    public envioService: EnvioDeCotacaoService,
    private orcamentoGrupoResponsavelService: OrcamentoGrupoResponsavelService,
    private orcamentoAltService: OrcamentoAltService
  ) {}

  private readonly _destroy$ = new Subject<void>();
  loaderValidacaoGrupo = false;
  loaderSubmitEnvioCotacao = false;

  idOrcamento: number;
  idOrcamentoCenario: number;
  grupo: GrupoAlt;
  reenvio: boolean;
  idProjeto: number;
  idFornecedorAtual: number;
  propostaDetalhada: PropostaDetalhada;
  formSteps: FormGroup;
  formValid = false;
  validacaoGrupoItem$: Observable<ValidacaoGrupoItem[]>;
  isControleCompras: boolean;

  contatos$: Observable<ResponsavelAlt[]>;

  onSelectTab(index: number): void {
    this.envioService.changeStep(index);
  }

  sendForm(formValido?: boolean): void {
    if (!formValido) {
      return;
    }
    const firstStepValue = this.formSteps.get('firstStep').value;
    if (this.formSteps.get('fourthStep').invalid || !firstStepValue?.idFuncionarioContato) {
      this.formValid = false;
      return;
    } else {
      this.formValid = true;
      // unico item checado para validar no final é se necessariaVisita está preenchido
      // adicionada mais uma validacao por necessitar de um idFuncionarioContato
    }
    this.loaderSubmitEnvioCotacao = true;
    const customizada = !!this.grupo.idFamiliaCustomizada;

    let fornecedorContato = (this.formSteps.get('secondStep').value ?? []) as Fornecedor[];

    if (this.reenvio && this.idFornecedorAtual) {
      fornecedorContato = fornecedorContato.filter(fornecedor =>
        this.grupo.propostas.some(proposta => proposta.idFornecedor === fornecedor.idFornecedor)
      );
    } else {
      fornecedorContato = fornecedorContato.filter(fornecedor => fornecedor.selected);
    }

    const payload: EnvioCotacaoPayload = {
      ...(firstStepValue ?? {}),
      fornecedorContato: fornecedorContato.map(
        ({ idFornecedor, idContatoFornecedor, idProposta, comentarioProposta }) => ({
          idFornecedor,
          idContatoFornecedor,
          idProposta,
          comentarioProposta,
        })
      ),
      ...(this.formSteps.get('thirdStep').value ?? {}),
      ...(this.formSteps.get('fourthStep').value ?? {}),
      ...(this.formSteps.get('fifthStep').value ?? {}),
      idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
      faseDNN: !this.isControleCompras,
    };
    this.orcamentoService
      .saveCotacao(payload, this.idOrcamento, this.grupo.idGrupo, this.reenvio, customizada)
      .pipe(
        refreshMap(() =>
          this.orcamentoAltService.getGrupo(this.idOrcamento, this.idOrcamentoCenario, this.grupo.idOrcamentoGrupo)
        ),
        finalize(() => {
          this.loaderSubmitEnvioCotacao = false;
          this.bsModalRef.hide();
        })
      )
      .subscribe();
  }

  private setUpForm(): void {
    this.formSteps = this.formBuilder.group({
      firstStep: this.formBuilder.control({
        dataLimiteRecebimento: this.grupo.dataLimiteRecebimento && new Date(this.grupo.dataLimiteRecebimento),
        idFuncionarioContato: this.grupo.idFuncionarioContato,
        dataLimiteEntregaMercadoria: this.grupo.dataLimiteEntregaMercadoria
          ? new Date(this.grupo.dataLimiteEntregaMercadoria)
          : '',
        dataInicioExecucaoServico: this.grupo.dataInicioExecucaoServico
          ? new Date(this.grupo.dataInicioExecucaoServico)
          : '',
        dataFimExecucaoServico: this.grupo.dataFimExecucaoServico ? new Date(this.grupo.dataFimExecucaoServico) : '',
        mensagemEnvioCotacao: `<p>${this.grupo.mensagemEnvioCotacao ?? ''}</p>`,
      }),
      secondStep: this.formBuilder.control([]),
      thirdStep: this.formBuilder.control({
        arquivoAnexo: [],
      }),
      fourthStep: this.formBuilder.control({
        necessariaVisita: this.formBuilder.control(false, [Validators.required]),
        contatoVisita: this.formBuilder.control(''),
        telefoneVisita: this.formBuilder.control(''),
        grupoRestricaoObra: this.formBuilder.control(''),
        tipoFaturamento: this.formBuilder.control(0),
      }),
      fifthStep: this.formBuilder.control({
        liberarQuantitativo: this.grupo.liberarQuantitativo,
      }),
    });

    this.fillSecondStep();
    this.fillFourthStep();
  }

  fillValidacaoGrupoItemStep(): void {
    if ([TipoGrupoEnum.Insumo, TipoGrupoEnum.InsumoKit, TipoGrupoEnum.Tecnico].includes(this.grupo.idTipoGrupo)) {
      this.envioService.changeStep(1);
      return;
    }
    this.loaderValidacaoGrupo = true;
    this.validacaoGrupoItem$ = this.envioService.getValidacaoGrupoItem(this.grupo.idOrcamentoGrupo).pipe(
      tap(grupos => {
        if (!grupos.length) {
          this.envioService.changeStep(1);
        }
      }),
      finalize(() => {
        this.loaderValidacaoGrupo = false;
      })
    );
  }

  private fillSecondStep(): void {
    this.envioService.setFornecedoresLoading(true);
    this.envioService
      .getFornecedoresWithContatos(this.idOrcamento, this.grupo, this.idFornecedorAtual, this.isControleCompras)
      .pipe(
        tap(fornecedores => {
          this.formSteps.get('secondStep').setValue(fornecedores ?? []);
        }),
        finalize(() => {
          this.envioService.setFornecedoresLoading(false);
        })
      )
      .subscribe();
  }

  private fillFourthStep(): void {
    this.envioService.getPropostasDetalhadas(this.idOrcamento, this.grupo.idGrupo).subscribe(propostaDetalhada => {
      this.propostaDetalhada = {
        ...propostaDetalhada,
        ...this.propostaDetalhada,
        geral: { ...propostaDetalhada.geral, ...this.propostaDetalhada?.geral },
      };
      const {
        local,
        faturamento: { tipoFaturamento },
      } = propostaDetalhada;
      let visita: Visita;

      if (local.visita) {
        visita = local.visita;
      } else {
        visita = {
          contatoVisita: this.grupo.contatoVisita,
          necessariaVisita: this.grupo.necessariaVisita,
          telefoneVisita: this.grupo.telefoneVisita,
        } as Visita;
      }

      const { contatoVisita, necessariaVisita, telefoneVisita } = visita;
      const { grupoRestricaoObra } = local;

      this.formSteps.get('fourthStep').setValue({
        contatoVisita,
        necessariaVisita: necessariaVisita ?? false,
        telefoneVisita,
        grupoRestricaoObra,
        tipoFaturamento,
      });
    });
  }

  onContatoSelected($event: ResponsavelAlt): void {
    this.propostaDetalhada = {
      ...this.propostaDetalhada,
      geral: { ...this.propostaDetalhada?.geral, responsavel: $event.nomeFantasia },
    };
  }

  ngOnInit(): void {
    this.orcamentoService
      .updateMatriz({
        idProjeto: this.idProjeto,
        idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
        idGrupo: this.grupo.idGrupo,
        idOrcamento: this.idOrcamento,
      })
      .subscribe();
    this.setUpForm();
    this.fillValidacaoGrupoItemStep();
    this.contatos$ = this.orcamentoGrupoResponsavelService
      .get(this.idOrcamento, this.grupo.idGrupo, this.isControleCompras)
      .pipe(
        tap(contatos => {
          const firstStepControl = this.formSteps.get('firstStep');
          let { idFuncionarioContato, ...firstStepControlValue } = firstStepControl.value;
          const contatoSelecinado = contatos.find(_contato => _contato.selecionado);
          if (contatoSelecinado) {
            firstStepControl.setValue({
              ...firstStepControlValue,
              idFuncionarioContato: contatoSelecinado.idFuncionario,
            });
            this.onContatoSelected(contatoSelecinado);
            return;
          }
          const idContatoGrupoNotExists = !contatos.some(_contato => _contato.idFuncionario === idFuncionarioContato);
          if (!idFuncionarioContato || idContatoGrupoNotExists) {
            idFuncionarioContato = idContatoGrupoNotExists
              ? contatos[0].idFuncionario
              : this.grupo.idFuncionarioContato ?? contatos[0].idFuncionario;
            firstStepControl.setValue({ ...firstStepControlValue, idFuncionarioContato });
          }
          const contato = contatos.find(_contato => _contato.idFuncionario === idFuncionarioContato);
          if (contato) {
            this.onContatoSelected(contato);
          }
        })
      );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
