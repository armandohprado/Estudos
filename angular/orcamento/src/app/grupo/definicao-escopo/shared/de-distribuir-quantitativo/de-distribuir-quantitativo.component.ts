import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Quantitativo } from './model/quantitativo';
import { Fase } from './model/fase';
import {
  getQtdeTotal,
  getTotalPavimento,
  getValorTotalEdificio,
  mapCentroCusto,
  mapFase,
  updateCentroCusto,
} from './util';
import { isNil } from 'lodash-es';
import { AtualizacaoCentroCustoEvent } from './model/atualizacao-centro-custo-event';
import { Pavimento } from './model/pavimento';
import { CentroCusto } from './model/centro-custo';
import { map, scan, startWith } from 'rxjs/operators';
import { Entity } from '@aw-utils/types/entity';
import { trackByFactory } from '@aw-utils/track-by';
import { DeDistribuirQuantitativoService } from './de-distribuir-quantitativo.service';

export interface DistribuirQuantitativoAmbienteEvent {
  fase: Fase;
  pavimento: Pavimento;
  centroCusto: CentroCusto;
}

@Component({
  selector: 'app-de-distribuir-quantitativo',
  templateUrl: './de-distribuir-quantitativo.component.html',
  styleUrls: ['./de-distribuir-quantitativo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeDistribuirQuantitativoComponent implements OnInit {
  constructor(
    private deDistribuirQuantitativoService: DeDistribuirQuantitativoService,
    public changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() set quantitativo(quantitativo: Quantitativo) {
    if (quantitativo && quantitativo.fases) {
      let newFases = quantitativo.fases;
      if (this.mapQuantitativo) {
        newFases = newFases.map(mapFase);
      }
      newFases = newFases.map(fase => {
        return {
          ...fase,
          edificios: fase.edificios.map(edificio => {
            if (this.tipo === 'devolucao-proposta' && fase.andares) {
              edificio = {
                ...edificio,
                andares: fase.andares
                  .filter(andar => andar.idEdificio === edificio.idEdificio)
                  .map(andar => {
                    return {
                      ...andar,
                      centrosDeCusto: andar.centrosDeCusto.map(mapCentroCusto),
                    };
                  }),
              };
              if (edificio.site) {
                edificio = {
                  ...edificio,
                  site: {
                    ...edificio.site,
                    centrosDeCusto: edificio.site.centrosDeCusto.map(mapCentroCusto),
                  },
                };
              }
            }
            return {
              ...edificio,
              centrosDeCusto:
                this.tipo === 'devolucao-proposta'
                  ? edificio.centrosDeCusto.map(mapCentroCusto)
                  : edificio.centrosDeCusto,
            };
          }),
        };
      });
      this._fases$.next(newFases);
      this.qtdeTotal.emit(getQtdeTotal(newFases));
    }
  }

  @Input('tipo') set _tipo(tipo: 'definicao-escopo' | 'devolucao-proposta') {
    this.tipo = tipo;
    if (this.tipo === 'definicao-escopo') {
      this.quantidadeProperty = 'quantidadeReferencia';
    } else {
      this.quantidadeProperty = 'quantidadeOrcada';
    }
  }
  tipo: 'definicao-escopo' | 'devolucao-proposta';
  quantidadeProperty: 'quantidadeReferencia' | 'quantidadeOrcada';
  @Input() startTabs: [number, number];
  @Input() updateInternalBehavior: boolean;
  @Input() mapQuantitativo = true;
  @Input() sugestaoQtdeReferencia: boolean;
  @Input() enableAmbiente = false;
  @Input() canChangeValue = true;
  @Input() planilhaCliente = false;
  @Output() ambiente = new EventEmitter<DistribuirQuantitativoAmbienteEvent>();
  @Output() qtdeTotal = new EventEmitter<number>();
  @Output() qtdePavimento = new EventEmitter<number>();
  @Output() atualizarCentroCusto = new EventEmitter<AtualizacaoCentroCustoEvent>();

  private _fases$ = new BehaviorSubject<Fase[]>([]);
  fases$ = this._fases$.asObservable();
  total$ = this._fases$.pipe(
    map(fases => {
      return fases.reduce((acc: Entity<number>, fase) => {
        const edificioAcc = fase.edificios.reduce((acc1: Entity<number>, edificio) => {
          acc1[edificio.idProjetoEdificioPavimento] = getValorTotalEdificio(edificio, this.quantidadeProperty);
          return acc1;
        }, {});
        return { ...acc, ...edificioAcc };
      }, {});
    })
  );

  faseActive = 0;
  edificioActive = 0;

  loading$: Observable<Entity<boolean>> = this.deDistribuirQuantitativoService.loading.pipe(
    startWith({}),
    scan((acc, value) => ({ ...acc, ...value }))
  );
  sub: Subscription;

  trackByFase = trackByFactory<Fase>('idFase');
  trackByPavimento = trackByFactory<Pavimento>('idProjetoEdificioPavimento');

  atualizaCentroCusto(
    fase: Fase,
    pavimento: Pavimento,
    { newQtde, oldQtde, centroCusto }: AtualizacaoCentroCustoEvent
  ): void {
    this.atualizarCentroCusto.emit({
      fase,
      pavimento,
      centroCusto,
      oldQtde,
      newQtde,
    });
    this.updateQtde(fase, pavimento, centroCusto, newQtde);
  }

  updateQtde(
    { idFase }: Fase,
    pavimento: Pavimento,
    { idProjetoCentroCusto, idOrcamentoGrupoItemQuantitativo }: CentroCusto,
    newValue: number
  ): void {
    let fases = [...this._fases$.value];
    const newCentro: Partial<CentroCusto> = {
      [this.quantidadeProperty]: isNil(newValue) ? 0 : newValue,
      ativo: !isNil(newValue),
      idOrcamentoGrupoItemQuantitativo: !isNil(newValue) ? idOrcamentoGrupoItemQuantitativo : 0,
    };
    fases = fases.map(fase => {
      if (fase.idFase === idFase) {
        fase.edificios = fase.edificios.map(edificio => {
          if (pavimento.idEdificio === edificio.idEdificio) {
            switch (pavimento.tipo) {
              case 'Prédio':
                edificio = updateCentroCusto(edificio, idProjetoCentroCusto, newCentro);
                break;
              case 'Andar': {
                edificio.andares = edificio.andares.map(andar => {
                  if (andar.idPavimento === pavimento.idPavimento) {
                    andar = updateCentroCusto(andar, idProjetoCentroCusto, newCentro);
                  }
                  return andar;
                });
                break;
              }
              case 'Site':
                edificio.site = updateCentroCusto(edificio.site, idProjetoCentroCusto, newCentro);
                break;
            }
          }
          return edificio;
        });
      }

      return fase;
    });
    this.qtdeTotal.emit(getQtdeTotal(fases));
    this.qtdePavimento.emit(getTotalPavimento(fases, idFase, pavimento, this.quantidadeProperty));
    if (this.updateInternalBehavior) {
      this._fases$.next(fases);
    }
  }

  ngOnInit(): void {
    const [fase = 0, edificio = 0] = this.startTabs ?? [];
    this.faseActive = fase;
    this.edificioActive = edificio;
  }
}
