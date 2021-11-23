import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { GaAtividadeQuery } from '../../state/atividade/ga-atividade.query';
import { Observable, of, Subject } from 'rxjs';
import { GaArquivo, GaArquivoGrupo, GaAtividade } from '../../model/atividade';
import { finalize, map, pluck, switchMap, take } from 'rxjs/operators';
import { GaFamilia, GaGrupao } from '../../model/familia';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { isFunction } from 'lodash-es';
import { GerenciadorArquivosService } from '../../gerenciador-arquivos.service';
import { reduceToGrupos } from './ga-grupos-selecionados.pipe';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-ga-add-grupos',
  templateUrl: './ga-add-grupos.component.html',
  styleUrls: ['./ga-add-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation()],
})
export class GaAddGruposComponent implements OnInit, OnDestroy {
  constructor(
    private gaAtividadeQuery: GaAtividadeQuery,
    public bsModalRef: BsModalRef,
    private gerenciadorArquivosService: GerenciadorArquivosService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private _destroy$ = new Subject<void>();

  idAtividade: string;
  idArquivo: number;
  idOrcamentoGrupo: number;

  atividade$: Observable<GaAtividade>;
  arquivo$: Observable<GaArquivo>;
  familias$: Observable<GaFamilia[]>;

  grupos: GaArquivoGrupo[] = [];

  pluralGrupo = { '=0': 'Nenhum grupo selecionado', '=1': '# grupo selecionado', other: '# grupos selecionados' };

  loading = false;
  saving = false;

  trackByFamilia = trackByFactory<GaFamilia>('nome');
  trackByGrupao = trackByFactory<GaGrupao>('nome');
  trackByGrupo = trackByFactory<GaArquivoGrupo>('id');

  updateFamilia(nome: string, partial: Partial<GaFamilia> | ((familia: GaFamilia) => GaFamilia)): void {
    const callback = isFunction(partial) ? partial : familia => ({ ...familia, ...partial });
    this.gerenciadorArquivosService.updateArquivo(this.idAtividade, this.idArquivo, arquivo => ({
      ...arquivo,
      familias: (arquivo.familias ?? []).map(familia => {
        if (familia.nome === nome) {
          familia = callback(familia);
        }
        return familia;
      }),
    }));
  }

  updateGrupao(
    nomeFamilia: string,
    nomeGrupao: string,
    partial: Partial<GaGrupao> | ((grupao: GaGrupao) => GaGrupao)
  ): void {
    const callback = isFunction(partial) ? partial : grupao => ({ ...grupao, ...partial });
    this.updateFamilia(nomeFamilia, familia => ({
      ...familia,
      grupoes: (familia.grupoes ?? []).map(grupao => {
        if (grupao.nome === nomeGrupao) {
          grupao = callback(grupao);
        }
        return grupao;
      }),
    }));
  }

  updateGrupo(
    nomeFamilia: string,
    nomeGrupao: string,
    idOrcamentoGrupo: number,
    partial: Partial<GaArquivoGrupo>
  ): void {
    this.updateGrupao(nomeFamilia, nomeGrupao, grupao => ({
      ...grupao,
      grupos: (grupao.grupos ?? []).map(grupo => {
        if (idOrcamentoGrupo === grupo.id) {
          grupo = { ...grupo, ...partial };
        }
        return grupo;
      }),
    }));
  }

  ngOnInit(): void {
    this.atividade$ = this.gaAtividadeQuery.selectEntity(this.idAtividade);
    this.arquivo$ = this.atividade$.pipe(
      map(atividade => atividade.arquivos.find(arquivo => arquivo.id === this.idArquivo))
    );
    this.familias$ = this.arquivo$.pipe(pluck('familias'));
    this.loading = true;
    this.gerenciadorArquivosService
      .getFamilias(this.idAtividade, this.gerenciadorArquivosService.idOrcamentoCenario, this.idArquivo)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  salvar(): void {
    this.saving = true;
    this.arquivo$
      .pipe(
        take(1),
        switchMap(arquivo => {
          const grupos = arquivo.familias.reduce(
            (acc: GaArquivoGrupo[], item) => [...acc, ...reduceToGrupos(item)],
            []
          );
          const http$ = grupos.length
            ? this.gerenciadorArquivosService.addGrupos(
                arquivo,
                grupos.map(grupo => grupo.id)
              )
            : of(null);
          return http$.pipe(
            finalize(() => {
              this.saving = false;
              this.changeDetectorRef.markForCheck();
              this.bsModalRef.hide();
            })
          );
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.gerenciadorArquivosService.updateArquivo(this.idAtividade, this.idArquivo, { familias: [] });
  }
}
