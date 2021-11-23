import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Projeto, QuestionarioByStep, QuestionarioStep4 } from '../../../../../models';
import { QuestionarioService } from '../../../../../services/projeto/questionario.service';

@Component({
  selector: 'app-step4-faturamento',
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.scss'],
})
export class Step4Component implements OnInit {
  projeto: Projeto = this.route.snapshot.data.projeto;

  @ViewChild('quantitativo1') quantitativo1: ElementRef;
  @ViewChild('quantitativo2') quantitativo2: ElementRef;
  @ViewChild('quantitativo3') quantitativo3: ElementRef;
  @ViewChild('quantitativo4') quantitativo4: ElementRef;
  @ViewChild('quantitativo5') quantitativo5: ElementRef;
  @ViewChild('quantitativo6') quantitativo6: ElementRef;
  @ViewChild('quantitativo7') quantitativo7: ElementRef;
  @ViewChild('quantitativo8') quantitativo8: ElementRef;
  @ViewChild('quantitativo9') quantitativo9: ElementRef;
  @ViewChild('quantitativo10') quantitativo10: ElementRef;
  @ViewChild('quantitativo11') quantitativo11: ElementRef;
  @ViewChild('quantitativo12') quantitativo12: ElementRef;
  @ViewChild('quantitativo13') quantitativo13: ElementRef;
  @ViewChild('quantitativo14') quantitativo14: ElementRef;
  @ViewChild('quantitativo15') quantitativo15: ElementRef;
  @ViewChild('quantitativo16') quantitativo16: ElementRef;
  @ViewChild('quantitativo17') quantitativo17: ElementRef;

  form: FormGroup;
  questionarioEnum = QuestionarioStep4;
  questionario: QuestionarioByStep;

  @Input() formParent: QuestionarioByStep;

  constructor(
    private fb: FormBuilder,
    private questionarioService: QuestionarioService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({});
    this.setUpForm();
  }

  setUpForm(): void {
    for (const key of Object.keys(this.questionarioEnum)) {
      this.form.addControl(
        this.questionarioEnum[key],
        this.fb.control(
          this.formParent.passos.passo4[this.questionarioEnum[key]] &&
            this.formParent.passos.passo4[this.questionarioEnum[key]] !== 'false'
            ? this.formParent.passos.passo4[this.questionarioEnum[key]]
            : ''
        )
      );
    }
  }

  sendForm(): void {
    const payload = {
      idQuestionario: this.formParent.idQuestionario,
      idProjeto: this.projeto.idProjeto,
      idQuestionarioModelo: 1,
      questionarioRespostas: [],
    };

    if (this.quantitativo1.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_CONDICAO_MEDICAO)
      );
    }
    if (this.quantitativo2.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_CONDICAO_INSS)
      );
    }
    if (this.quantitativo3.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_MEDICAO_ALOCADO)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_MEDICAO_APROVACAO)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_MEDICAO_DIAS)
      );
    }
    if (this.quantitativo4.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_PRAZO_FATURAMENTO)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_PRAZO_FATURAMENTO_DIAS_TIPO)
      );
    }
    if (this.quantitativo5.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_PRAZO_FORMADEPAGAMENTO)
      );
    }
    if (this.quantitativo6.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_CONTRATACAOAW_PRAZO)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_CONTRATACAOAW_DIAS_TIPO)
      );
    }
    if (this.quantitativo7.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_CONTRATACAOAW_PREFERENCIA)
      );
    }
    if (this.quantitativo8.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_CONTRATACAOAW_OBSERVACAO)
      );
    }
    if (this.quantitativo9.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DATADECORTE)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DATADECORTE_NF_SERVICO_CLIENTE)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DATADECORTE_NF_PRODUTO_CLIENTE)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DATADECORTE_NF_SERVICO_GRUPO)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DATADECORTE_NF_PRODUTO_GRUPO)
      );
    }
    if (this.quantitativo10.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DATADECORTE_PO)
      );
    }
    if (this.quantitativo11.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DATADECORTE_ESPELHO)
      );
    }
    if (this.quantitativo12.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DATADECORTE_PO_FATURA)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DATADECORTE_PO_FATURA_OBS)
      );
    }
    if (this.quantitativo13.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_TIPO)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_XML)
      );
    }
    if (this.quantitativo14.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_NOME)
      );
    }
    if (this.quantitativo15.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_CONTATOFINANCEIRO_EMAIL)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_CONTATOFINANCEIRO_TELEFONE)
      );
    }
    if (this.quantitativo16.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_NF_VALORTOTAL)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_NF_VALORSINAL)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_RECIBO)
      );
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_OUTRO)
      );
    }
    if (this.quantitativo17.nativeElement.checked) {
      payload.questionarioRespostas.push(
        this.addFieldToPayload(this.questionarioEnum.QUESTIONARIO_PAGAMENTO_CONSIDERACOES_FINAIS)
      );
    }
    this.questionarioService.sendQuestionarioStep(4, payload).subscribe();
  }

  addFieldToPayload(chave): any {
    return {
      nomechave: chave,
      valorchave: this.form.get(chave).value,
    };
  }

  backTabQuestionario(): void {
    this.questionarioService.setActiveStep(this.questionarioService.activeTab$.value - 1);
  }
}
