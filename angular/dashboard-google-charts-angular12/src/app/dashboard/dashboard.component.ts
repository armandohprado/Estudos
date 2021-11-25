import { Component, OnInit } from '@angular/core';
import { DadosDashBoard, DadosService } from './service/dados.service';
import { tap } from 'rxjs/operators';

declare var google: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  constructor(private dadosService: DadosService) {}
  private dados: DadosDashBoard<string, number>[] = [];
  ngOnInit(): void {
    this.dadosService
      .obterDados()
      .pipe(
        tap((data) => {
          this.dados = data;
          this.init();
        })
      )
      .subscribe();
  }
  private init(): void {
    if (typeof google !== 'undefined') {
      google.charts.load('current', {
        callback: this.init2(),
        packages: ['corechart'],
      });
    }
  }
  private init2(): any {
    setTimeout(() => {
      if (typeof google !== 'undefined') {
        this.exibirGraficos();
      }
    }, 160);
  }

  private exibirGraficos(): any {
    this.exibirPieChart();
    this.exibir3dPieChart();
    this.exibirDonutChart();
    this.exibirBarChart();
    this.exibirColumnChart();
  }

  private exibirPieChart() {
    const el = document.getElementById('pie-chart');
    const chart = new google.visualization.PieChart(el);
    chart.draw(this.obterDataTable(), this.obterOpcoes());
  }
  private exibir3dPieChart() {
    const el = document.getElementById('3d-pie-chart');
    const chart = new google.visualization.PieChart(el);
    const opcoes = this.obterOpcoes({ is3D: true });
    opcoes['is3d'] = true;
    chart.draw(this.obterDataTable(), opcoes);
  }
  private exibirDonutChart() {
    const el = document.getElementById('donut-chart');
    const chart = new google.visualization.PieChart(el);
    const opcoes = this.obterOpcoes({ pieHole: 0.2 });
    chart.draw(this.obterDataTable(), opcoes);
  }
  private exibirBarChart() {
    const el = document.getElementById('bar-chart');
    const chart = new google.visualization.LineChart(el);
    chart.draw(this.obterDataTable(), this.obterOpcoes());
  }
  private exibirColumnChart() {
    const el = document.getElementById('column-chart');
    const chart = new google.visualization.ColumnChart(el);
    chart.draw(this.obterDataTable(), this.obterOpcoes());
  }

  private obterOpcoes<Type>(args?: Type): any {
    return {
      ...args,
      title: 'Quantidade de cadastros primeiro semestre',
      width: 500,
      height: 400,
    };
  }

  private obterDataTable(): any {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Mês');
    data.addColumn('number', 'Quantidade');
    data.addRows(this.dados);
    return data;
  }
}
