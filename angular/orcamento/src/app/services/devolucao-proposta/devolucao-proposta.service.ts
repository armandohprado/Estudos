import { PavimentoGeneric } from '@aw-models/devolucao-proposta/pavimento-dp-generic';
import { SubFornecedor } from '@aw-models/devolucao-proposta/subfornecedor';
import { BehaviorSubject, map, Observable, pluck } from 'rxjs';
import { Site } from '@aw-models/devolucao-proposta/site-dp';
import { Edificio } from '@aw-models/devolucao-proposta/edificio-dp';
import { Andar } from '@aw-models/devolucao-proposta/andar-dp';
import { Injectable } from '@angular/core';
import { sumBy } from 'lodash-es';
import { CabecalhoDevolucaoProposta } from '@aw-models/devolucao-proposta/cabecalho-devolucao-proposta';
import { Pavimento } from '@aw-models/devolucao-proposta/pavimento-dp';
import { Item } from '@aw-models/devolucao-proposta/item';

@Injectable({ providedIn: 'root' })
export class DevolucaoPropostaService {
  cabecalhoProposta: CabecalhoDevolucaoProposta;
  cabecalhoPropostaSub$ = new BehaviorSubject<CabecalhoDevolucaoProposta>({});
  cabecalhoProposta$ = this.cabecalhoPropostaSub$.asObservable();
  proposta: Pavimento;
  propostaSub$ = new BehaviorSubject<Pavimento>({
    andares: [],
    sites: [],
    edificios: [],
  });

  mostrarTutorial = false;

  proposta$ = this.propostaSub$.asObservable();

  loaderSteps = false;

  edificioSelecionado: number;
  andaresFiltrados: Andar[] = [];
  itensFiltrados: Item[] = [];
  classificacao: number;

  edificios$: Observable<Edificio[]> = this.proposta$.pipe(pluck('edificios'));

  subfornecedores: SubFornecedor[];
  subfornecedoresSub$ = new BehaviorSubject<SubFornecedor[]>([]);
  subfornecedores$ = this.subfornecedoresSub$.asObservable();

  total$ = (pavimento: PavimentoGeneric) =>
    this.proposta$.pipe(
      map(j => {
        const tipo = pegarTipo(pavimento);
        const pavimentos = j[tipo];
        const pavimentoAtual = pavimentos?.find(
          p => p.idProjetoEdificioPavimento === pavimento.idProjetoEdificioPavimento
        );
        return sumBy([...pavimentoAtual.itens, ...pavimentoAtual.omissos], 'valorTotal');
      })
    );

  atualizarItem(pavimento: Andar | Edificio | Site, rcItem: Item, item: Partial<Item>): void {
    let { tipo, clone } = this.getPavimentoTipo(pavimento);
    const property = rcItem.omisso ? 'omissos' : 'itens';
    clone = {
      ...clone,
      [tipo]: clone[tipo].map(dp => {
        if (pavimento.idProjetoEdificioPavimento === dp.idProjetoEdificioPavimento) {
          dp = {
            ...dp,
            [property]: dp[property].map(oldItem => {
              if (oldItem.idPropostaItem === rcItem.idPropostaItem) {
                oldItem = { ...oldItem, ...item };
              }
              return oldItem;
            }),
          };
        }
        return dp;
      }),
    };
    this.propostaSub$.next(clone);
  }

  compartilharCabecalho(cabecalho: CabecalhoDevolucaoProposta): void {
    this.cabecalhoProposta = cabecalho;
    this.classificacao = this.cabecalhoProposta?.classificacao ?? null;
    this.cabecalhoPropostaSub$.next(this.cabecalhoProposta);
  }

  compartilharProposta(pavimento: Pavimento): void {
    this.proposta = pavimento;
    this.propostaSub$.next(this.proposta);
  }

  compartilharFornecedores(subFornecedor): void {
    this.subfornecedores = subFornecedor;
    this.subfornecedoresSub$.next(this.subfornecedores);
  }

  getPavimentoTipo(pavimento: Andar | Edificio | Site): { tipo: TipoPavimentoProperty; clone: Pavimento } {
    const clone = { ...this.propostaSub$.value };
    const tipo = pegarTipo(pavimento);
    return { tipo, clone };
  }
}

export function pegarTipo(pavimento: PavimentoGeneric): TipoPavimentoProperty {
  let tipo: TipoPavimentoProperty;
  if (pavimento.tipo === 'Andar') {
    tipo = 'andares';
  } else if (pavimento.tipo === 'Site') {
    tipo = 'sites';
  } else {
    tipo = 'edificios';
  }
  return tipo;
}

type TipoPavimentoProperty = keyof Pick<Pavimento, 'andares' | 'sites' | 'edificios'>;
