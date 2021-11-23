import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Projeto } from '../../models';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-questionario',
  templateUrl: './questionario.component.html',
  styleUrls: ['./questionario.component.scss'],
})
export class QuestionarioComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute) {}

  @ViewChild('staticTabs', { read: ElementRef, static: true }) tabsetElement: ElementRef<HTMLDivElement>;

  projeto: Projeto = this.activatedRoute.snapshot.data.projeto;

  ngOnInit(): void {}
}
