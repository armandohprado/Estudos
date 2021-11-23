import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { finalize, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Desconto } from '@aw-models/devolucao-proposta/desconto';
import { DevolucaoPropostaService } from '@aw-services/devolucao-proposta/devolucao-proposta.service';
import { DataDevolucaoPropostaService } from '@aw-services/devolucao-proposta/data-devolucao-proposta.service';
import { catchAndThrow, refresh } from '@aw-utils/rxjs/operators';
import { transformPercentInReal, transformRealInPercentual } from '@aw-utils/util';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { AwDialogOptions } from '@aw-components/aw-dialog/aw-dialog-types';

export interface PrimeiraLinha {
  somaProdutos: number;
  somaServicos: number;
  somaTotal: number;
}

export interface SegundaLinha {
  percentualSomaProduto: number;
  percentualSomaServico: number;
  valorSomaRealProduto: number;
  valorSomaRealServico: number;
}

export interface TerceiraLinha {
  geralDesconto: number;
  geralValor: number;
}

export interface UltimaColuna {
  primeiraLinha: PrimeiraLinha;
  segundaLinha: SegundaLinha;
  terceiraLinha: TerceiraLinha;
}

@Component({
  selector: 'app-table-valores',
  templateUrl: './table-valores.component.html',
  styleUrls: ['./table-valores.component.scss'],
})
export class TableValoresComponent implements OnInit {
  constructor(
    private dataDevolucaoProposta: DataDevolucaoPropostaService,
    public devolucaoProposta: DevolucaoPropostaService,
    private formBuilder: FormBuilder,
    private awDialogService: AwDialogService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  @Input() disabled = false;
  @Input() supply: boolean;
  @Input() interno: boolean;

  tabelaDescontos$: BehaviorSubject<Desconto[]> = new BehaviorSubject<Desconto[]>([]);
  formArr: FormGroup[] = [];
  controle: string;
  somaValoresColumn: UltimaColuna = {
    primeiraLinha: {
      somaProdutos: 0,
      somaServicos: 0,
      somaTotal: 0,
    },
    segundaLinha: {
      percentualSomaProduto: 0,
      percentualSomaServico: 0,
      valorSomaRealProduto: 0,
      valorSomaRealServico: 0,
    },
    terceiraLinha: {
      geralDesconto: 0,
      geralValor: 0,
    },
  };
  salvando = false;
  limpandoDescontos = false;

  setUltimaColuna(response: Desconto[]): void {
    const reduceUltimaColuna = response.reduce(
      (acc, i) => {
        return {
          primeiraLinha: {
            somaProdutos: acc.primeiraLinha.somaProdutos + i.valorTotalProdutoSemDesconto,
            somaServicos: acc.primeiraLinha.somaServicos + i.valorTotalServicoSemDesconto,
            somaTotal: acc.primeiraLinha.somaTotal + i.valorTotalProdutoSemDesconto + i.valorTotalServicoSemDesconto,
          },
          segundaLinha: {
            ...acc.segundaLinha,
            valorSomaRealProduto:
              acc.segundaLinha.valorSomaRealProduto +
              transformPercentInReal(i.valorTotalProdutoSemDesconto, i.descontoProduto),
            valorSomaRealServico:
              acc.segundaLinha.valorSomaRealServico +
              transformPercentInReal(i.valorTotalServicoSemDesconto, i.descontoServico),
          },
          terceiraLinha: {
            geralDesconto: acc.terceiraLinha.geralDesconto + i.valorTotal,
            geralValor:
              acc.terceiraLinha.geralValor +
              i.valorTotalProdutoSemDesconto -
              i.valorTotalProduto +
              (i.valorTotalServicoSemDesconto - i.valorTotalServico),
          },
        };
      },
      {
        primeiraLinha: {
          somaProdutos: 0,
          somaServicos: 0,
          somaTotal: 0,
        },
        segundaLinha: {
          percentualSomaProduto: 0,
          percentualSomaServico: 0,
          valorSomaRealProduto: 0,
          valorSomaRealServico: 0,
        },
        terceiraLinha: {
          geralDesconto: 0,
          geralValor: 0,
        },
      } as UltimaColuna
    );
    this.somaValoresColumn = {
      ...reduceUltimaColuna,
      segundaLinha: {
        ...reduceUltimaColuna.segundaLinha,
        percentualSomaProduto: transformRealInPercentual(
          reduceUltimaColuna.primeiraLinha.somaProdutos,
          reduceUltimaColuna.segundaLinha.valorSomaRealProduto
        ),
        percentualSomaServico: transformRealInPercentual(
          reduceUltimaColuna.primeiraLinha.somaServicos,
          reduceUltimaColuna.segundaLinha.valorSomaRealServico
        ),
      },
    };
  }

  salvar(): void {
    this.salvando = true;
    const obj = this.formArr.map(arr => {
      return {
        ...arr.value,
        descontoServico: +(arr.value.descontoServico ?? 0),
        descontoProduto: +(arr.value.descontoProduto ?? 0),
      };
    });
    const requests: Observable<any>[] = [
      this.dataDevolucaoProposta.atualizarDescontos(obj, this.devolucaoProposta.cabecalhoProposta.idProposta).pipe(
        catchAndThrow(() => {
          this.awDialogService.error('Erro ao tentar salvar os descontos!', 'Favor tentar novamente mais tarde');
        }),
        tap(() => {
          const awDialogOptions: Partial<AwDialogOptions> = { title: 'Descontos salvos com sucesso!' };
          if (this.interno) {
            awDialogOptions.primaryBtn = null;
            awDialogOptions.secondaryBtn = {
              title: 'Voltar',
              action: bsModalRef => {
                bsModalRef.hide();
                this.router
                  .navigate(['../../../'], { relativeTo: this.activatedRoute, queryParamsHandling: 'merge' })
                  .then();
              },
            };
            awDialogOptions.bsModalOptions = { ignoreBackdropClick: true };
          }
          this.awDialogService.success(awDialogOptions);
        }),
        refresh(this.dataDevolucaoProposta.preencherProposta(this.devolucaoProposta.cabecalhoProposta.idProposta))
      ),
    ];
    if (this.supply) {
      requests.push(this.salvarSupply());
    }
    forkJoin(requests)
      .pipe(
        finalize(() => {
          this.salvando = false;
        })
      )
      .subscribe();
  }

  salvarSupply(): Observable<[boolean, boolean] | null> {
    if (this.supply) {
      const { idProposta } = this.devolucaoProposta.cabecalhoProposta;
      const idCompraNegociacaoGrupoMapaFornecedor =
        this.devolucaoProposta.cabecalhoProposta.idCompraNegociacaoGrupoMapaFornecedor ??
        +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idCompraNegociacaoGrupoMapaFornecedor);
      return this.dataDevolucaoProposta.salvarSupply(idProposta, idCompraNegociacaoGrupoMapaFornecedor);
    } else {
      return of(null);
    }
  }

  recarregar(init = false): Observable<Desconto[]> {
    return this.dataDevolucaoProposta.pegarDescontos(this.devolucaoProposta.cabecalhoProposta.idProposta).pipe(
      tap(response => {
        this.formArr = response.map(o => {
          return this.formBuilder.group({
            descontoServico: !init ? 0 : o.descontoServico,
            descontoRealServico: !init ? 0 : transformPercentInReal(o.valorTotalServicoSemDesconto, o.descontoServico),
            descontoProduto: !init ? 0 : o.descontoProduto,
            descontoRealProduto: !init ? 0 : transformPercentInReal(o.valorTotalProdutoSemDesconto, o.descontoProduto),
            valorTotalServicoSemDesconto: o.valorTotalServicoSemDesconto,
            valorTotalProdutoSemDesconto: o.valorTotalProdutoSemDesconto,
            idFornecedor: o.idFornecedor,
            principal: o.principal,
            idProposta: this.devolucaoProposta.cabecalhoProposta.idProposta,
          });
        });
        this.setUltimaColuna(response);
      })
    );
  }

  desconto(real?: boolean, limpar = false): void {
    const obj = this.formArr
      .map(r => r.getRawValue())
      .map(arr => {
        if (real) {
          arr = {
            ...arr,
            descontoServico: limpar
              ? 0
              : transformRealInPercentual(arr.valorTotalServicoSemDesconto, arr.descontoRealServico),
            descontoProduto: limpar
              ? 0
              : transformRealInPercentual(arr.valorTotalProdutoSemDesconto, arr.descontoRealProduto),
          };
        }
        return {
          ...arr,
          descontoServico: +(arr.descontoServico ?? 0),
          descontoProduto: +(arr.descontoProduto ?? 0),
        };
      });
    this.atualizarDescontos(obj);
  }

  atualizarDescontos(obj: any[]): void {
    this.devolucaoProposta.loaderSteps = true;
    this.dataDevolucaoProposta
      .atualizarDescontos(obj, this.devolucaoProposta.cabecalhoProposta.idProposta)
      .pipe(refresh(this.dataDevolucaoProposta.preencherCabecalho(this.devolucaoProposta.cabecalhoProposta.idProposta)))
      .subscribe(response => {
        if (!response) {
          this.devolucaoProposta.loaderSteps = false;
          this.awDialogService.error('Erro ao salvar dados!', 'tente novamente.');
        }
        this.recarregar(true).subscribe(resp => {
          this.tabelaDescontos$.next(resp);
          this.devolucaoProposta.loaderSteps = false;
        });
      });
  }

  restaurarTabela(): void {
    this.limpandoDescontos = true;
    this.controle = '';
    this.desconto(true, true);
    let recarregar$ = this.recarregar(false);
    if (this.supply) {
      recarregar$ = recarregar$.pipe(
        refresh(this.dataDevolucaoProposta.preencherProposta(this.devolucaoProposta.cabecalhoProposta.idProposta))
      );
    }
    recarregar$
      .pipe(
        finalize(() => {
          this.limpandoDescontos = false;
        })
      )
      .subscribe();
  }

  fazerDenovo(bsModalRef: BsModalRef): void {
    this.recarregar().subscribe(() => {
      bsModalRef.hide();
    });
  }

  ngOnInit(): void {
    this.recarregar(true)
      .pipe(
        catchAndThrow(() => {
          this.devolucaoProposta.loaderSteps = false;
          this.awDialogService.error('Erro ao buscar dados!', 'Falha na api', {
            primaryBtn: {
              title: 'Tentar Novamente',
              action: this.fazerDenovo.bind(this),
            },
          });
        })
      )
      .subscribe(response => {
        this.tabelaDescontos$.next(response);
        this.devolucaoProposta.loaderSteps = false;
      });
  }
}
