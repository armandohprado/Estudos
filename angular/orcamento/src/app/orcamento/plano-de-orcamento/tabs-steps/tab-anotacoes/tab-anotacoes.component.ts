import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { Familia, Grupo } from '../../../../models';
import { combineLatest, Observable, Subject } from 'rxjs';
import { fadeInOutAnimation } from '@aw-shared/animations/fadeOut';
import { map, take } from 'rxjs/operators';
import { ToPayload } from './helpers';
import { Entity } from '@aw-utils/types/entity';
import { trackByFactory } from '@aw-utils/track-by';
import { catchAndThrow, reduceToFunc } from '@aw-utils/rxjs/operators';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { orderByCodigo } from '@aw-utils/grupo-item/sort-by-numeracao';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';

type FamiliaGruposOmitted = Omit<Familia, 'grupoes'>;

interface FamiliaGrupo extends FamiliaGruposOmitted {
  grupos: Grupo[];
}

@Component({
  selector: 'app-tab-anotacoes',
  templateUrl: './tab-anotacoes.component.html',
  styleUrls: ['./tab-anotacoes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOutAnimation()],
})
export class TabAnotacoesComponent implements OnInit, OnDestroy {
  constructor(
    private route: Router,
    private orcamentoService: OrcamentoService,
    private awDialogService: AwDialogService,
    private activatedRoute: ActivatedRoute
  ) {}

  private _destroy$ = new Subject<void>();

  @HostBinding('class.tab-pane') tab = true;

  orcamento = this.orcamentoService.orcamento$.value;

  collapses: Entity<boolean> = {
    isOpen_0: true,
  };

  familias$: Observable<FamiliaGrupo[]> = this.orcamentoService.mappedFamilies$.pipe(
    map(familias =>
      familias.map(familia => {
        const { grupoes, ...familiaGrupo } = familia;
        return {
          ...familiaGrupo,
          grupos: orderBy(
            grupoes.reduce((acc, item) => [...acc, ...item.grupos], []),
            orderByCodigo<Grupo>('codigoGrupo')
          ),
        };
      })
    )
  );

  get idOrcamento(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamento);
  }

  get idOrcamentoCenario(): number {
    return +this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  }

  @HostBinding('class.active') get url(): boolean {
    return this.route.url.includes('valores');
  }

  trackByFnFamilia = trackByFactory<FamiliaGrupo>('idOrcamentoFamilia', 'idFamilia', 'idFamiliaCustomizada');
  trackByFn = trackByFactory<Grupo>('idOrcamentoGrupo', 'idGrupo');

  updateGrupo(idOrcamentoGrupo: number, grupo: Partial<Grupo>): void {
    this.orcamentoService.updateGrupo(idOrcamentoGrupo, grupo);
  }

  saveValues(destroy?: boolean): void {
    this.orcamentoService
      .saveGruposValores(
        ToPayload(this.orcamentoService.orcamento$.value.grupoes),
        this.idOrcamento,
        this.idOrcamentoCenario
      )
      .pipe(
        take(1),
        catchAndThrow(response => {
          this.awDialogService.error(
            'Erro ao tentar salvar',
            response?.error?.mensagem ?? 'Favor tentar novamente mais tarde'
          );
        })
      )
      .subscribe(() => {
        if (!destroy) {
          this.awDialogService.success({
            title: 'Orçamento salvo!',
            secondaryBtn: {
              title: 'Voltar para Controle de Orçamento',
              action: bsModalRef => {
                this.route.navigateByUrl(`/projetos/${this.orcamento.idProjeto}/orcamentos/configuracoes`).then();
                bsModalRef.hide();
              },
            },
          });
        }
      });
  }

  ngOnInit(): void {
    this.familias$ = combineLatest([this.familias$, this.orcamentoService.visualizarGruposEmLista$]).pipe(
      map(([familias, flag]) => {
        this.collapses = {
          isOpen_0: true,
        };
        if (!flag) {
          const grupos = reduceToFunc(familias, 'grupos');
          return [
            {
              descricaoFamilia: 'Padrão',
              idOrcamentoCenario: this.idOrcamentoCenario,
              grupos: grupos.filter(grupao => grupao.idFamilia),
              numeroFamilia: 1,
              ordemFamilia: 0,
              idOrcamentoFamilia: 0,
            },
            ...familias.filter(familia => familia.idFamiliaCustomizada),
          ].map(familia => {
            return { ...familia, grupos: orderBy(familia.grupos, orderByCodigo<Grupo>('codigoGrupo')) };
          });
        } else {
          return familias;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.saveValues(true);
    this._destroy$.next();
    this._destroy$.complete();
  }
}
