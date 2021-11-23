import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { debounceTime, finalize, map, withLatestFrom } from 'rxjs/operators';
import { refresh } from '@aw-utils/rxjs/operators';
import { trackByFactory } from '@aw-utils/track-by';
import { Familia, Grupao, Grupo } from '../../../../../../models';
import { FormControl } from '@angular/forms';
import { orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { isFunction } from 'lodash-es';
import { upsert } from '@aw-utils/util';

@Component({
  selector: 'app-modal-selecionar-grupos',
  templateUrl: './modal-selecionar-grupos.component.html',
  styleUrls: ['./modal-selecionar-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalSelecionarGruposComponent implements OnInit {
  constructor(
    private bsModalRef: BsModalRef,
    private orcamentoService: OrcamentoService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  showPercentual: boolean;
  idOrcamento: number;
  idFamilia: number;
  idOrcamentoCenario: number;
  customizada = false;
  gerenciadorGrupos = false;
  grupoes: Grupao[];
  observable$: Observable<any> = of(null);
  private _familia$ = new BehaviorSubject<Familia>(null);
  familia$ = this._familia$.asObservable();

  saving = false;
  loading = false;

  searchControl = new FormControl('');
  search$ = this.searchControl.valueChanges.pipe(debounceTime(400));

  trackBy = trackByFactory<Grupao>('idGrupao');

  onSelectGrupo(grupao: Grupao): void {
    this.orcamentoService.selectGroup(grupao);
    const grupo = grupao.grupos[0];
    this.updateGrupo(grupao.idGrupao, grupo.idGrupo, grupo);
  }

  close(): void {
    this.bsModalRef.hide();
  }

  save(): void {
    this.saving = true;
    this.orcamentoService
      .saveGrupos(this.idOrcamento, this.idOrcamentoCenario)
      .pipe(
        refresh(this.orcamentoService.refreshOrcamento(this.idOrcamento, this.idOrcamentoCenario)),
        refresh(this.observable$),
        finalize(() => {
          this.saving = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(() => this.close());
  }

  updateGrupao(idGrupao: number, partial: Partial<Grupao> | ((grupao: Grupao) => Grupao)): void {
    const callback = isFunction(partial) ? partial : (grupao: Grupao) => ({ ...grupao, ...partial });
    const familia = { ...this._familia$.value };
    this._familia$.next({
      ...familia,
      grupoes: familia.grupoes.map(grupao => {
        if (grupao.idGrupao === idGrupao) {
          grupao = callback(grupao);
        }
        return grupao;
      }),
    });
  }

  updateGrupo(idGrupao: number, idGrupo: number, partial: Partial<Grupo>): void {
    this.updateGrupao(idGrupao, grupao => ({
      ...grupao,
      grupos: grupao.grupos.map(grupo => {
        if (grupo.idGrupo === idGrupo) {
          grupo = { ...grupo, ...partial };
        }
        return grupo;
      }),
    }));
  }

  ngOnInit(): void {
    this.loading = true;
    this.orcamentoService
      .getFamilia(this.idOrcamento, this.idFamilia, this.customizada, this.idOrcamentoCenario)
      .pipe(
        withLatestFrom(
          this.gerenciadorGrupos ? this.orcamentoService.familias$ : this.orcamentoService.alterarModoVisualizacao()
        ),
        map(([familia, familias]) => {
          const familiaOrcamento = familias?.find(f =>
            familia.idFamiliaCustomizada
              ? f.idFamiliaCustomizada === familia.idFamiliaCustomizada
              : f.idFamilia === familia.idFamilia
          );
          const grupoes = upsert(
            familia?.grupoes,
            this.grupoes?.length ? this.grupoes : familiaOrcamento?.grupoes,
            'idGrupao',
            (grupaoA, grupaoB) => {
              return {
                ...grupaoA,
                ...grupaoB,
                grupos: upsert(grupaoA?.grupos ?? [], grupaoB?.grupos ?? [], 'idGrupo'),
              };
            }
          );
          return {
            ...familia,
            ...familiaOrcamento,
            grupoes,
          };
        }),
        map(familia => ({ ...familia, grupoes: orderBy(familia.grupoes, 'numeroGrupao') })),
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(familia => {
        this._familia$.next(familia);
      });
  }
}
