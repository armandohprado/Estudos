import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import {
  Projeto,
  Questionario,
  QuestionarioImplantacaoByStep,
  QuestionarioModelo,
  QuestionarioUploadType,
} from '../../../models';
import { QuestionarioService } from '../../../services/projeto/questionario.service';

@Component({
  selector: 'app-tab-implantacao',
  templateUrl: './tab-implantacao.component.html',
  styleUrls: ['./tab-implantacao.component.scss'],
})
export class TabImplantacaoComponent implements OnInit {
  constructor(private fb: FormBuilder, private questionarioService: QuestionarioService) {
    this.implantacaoSteps = this.fb.group({});
  }

  implantacaoSteps: FormGroup;
  questionarioModelo = QuestionarioModelo;
  questionarioUploadType = QuestionarioUploadType;
  questionario: QuestionarioImplantacaoByStep;

  @ViewChild('tabsetImplantacao') tabsetImplantacao: TabsetComponent;
  @Input() projeto: Projeto;
  @Input() tabsetElement: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.questionarioService
      .getQuestionario(this.projeto.idProjeto, this.questionarioModelo.IMPLANTACAO)
      .subscribe((data: Questionario) => {
        this.questionario = this.questionarioService.stripFieldsImplantacao(data);
      });
  }

  onSelectTab(tab: number): void {
    this.tabsetImplantacao.tabs[tab - 1].active = true;
    this.tabsetElement?.nativeElement?.scrollIntoView(true);
  }
}
