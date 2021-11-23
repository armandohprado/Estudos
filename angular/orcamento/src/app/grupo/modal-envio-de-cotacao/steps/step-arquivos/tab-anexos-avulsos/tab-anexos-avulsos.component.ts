import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { BehaviorSubject, MonoTypeOperatorFunction, Subject } from 'rxjs';
import { auditTime, finalize, map, takeUntil, tap } from 'rxjs/operators';
import { AnexoAvulso, GrupoAlt } from '../../../../../models';
import { GerenciadorArquivosService } from '../../../../../orcamento/gerenciador-arquivos/gerenciador-arquivos.service';
import { GaAnexoAvulso } from '../../../../../orcamento/gerenciador-arquivos/model/anexo-avulso';
import { GaAnexoAvulsoQuery } from '../../../../../orcamento/gerenciador-arquivos/state/anexo-avulso/ga-anexo-avulso.query';
import { downloadBase64 } from '@aw-utils/util';
import { EnvioDeCotacaoService } from '@aw-services/cotacao/envio-de-cotacao.service';

@Component({
  selector: 'app-tab-anexos-avulsos',
  templateUrl: './tab-anexos-avulsos.component.html',
  styleUrls: ['./tab-anexos-avulsos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabAnexosAvulsosComponent implements OnInit, OnDestroy {
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private gerenciadorArquivosService: GerenciadorArquivosService,
    private gaAnexoAvulsoQuery: GaAnexoAvulsoQuery,
    private envioDeCotacaoService: EnvioDeCotacaoService
  ) {}

  private _destroy$ = new Subject<void>();

  loading$ = new BehaviorSubject<boolean>(false);
  loadingAll$ = new BehaviorSubject<boolean>(false);
  anexos$ = this.gaAnexoAvulsoQuery.all$;
  showOnlySelected = false;

  @Input() grupo: GrupoAlt;
  @Input() idProjeto: number;
  @Output() fileCounter = new EventEmitter<AnexoAvulso[]>();

  onDownload(anexo: GaAnexoAvulso): void {
    const { idOrcamento, idOrcamentoGrupo } = this.grupo;
    this.gerenciadorArquivosService.getFileBase64(idOrcamento, idOrcamentoGrupo, anexo).subscribe(base64 => {
      downloadBase64(anexo.nomeOriginalArquivo, base64);
    });
  }

  onAnexoToggle([$event, anexo]: [boolean, GaAnexoAvulso]): void {
    this.gerenciadorArquivosService.toggleAnexo(anexo, $event).pipe(this.refreshEtapas()).subscribe();
  }

  onAllToggle([$event, anexos]: [boolean, GaAnexoAvulso[]]): void {
    this.loadingAll$.next(true);
    this.gerenciadorArquivosService
      .toggleMultipleAnexo(anexos, $event)
      .pipe(
        this.refreshEtapas(),
        finalize(() => {
          this.loadingAll$.next(false);
        })
      )
      .subscribe();
  }

  setShowOnlySelected(): void {
    this.showOnlySelected = !this.showOnlySelected;
    this.changeDetectorRef.markForCheck();
  }

  private refreshEtapas<T>(): MonoTypeOperatorFunction<T> {
    return tap(() => {
      this.envioDeCotacaoService.retrieveStagesAction$.next({
        idProjeto: this.idProjeto,
        idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
      });
    });
  }

  ngOnInit(): void {
    this.loading$.next(true);
    this.gerenciadorArquivosService
      .getAnexosAvulsos(this.grupo.idOrcamentoGrupo)
      .pipe(
        finalize(() => {
          this.loading$.next(false);
        })
      )
      .subscribe();
    this.anexos$
      .pipe(
        takeUntil(this._destroy$),
        auditTime(100),
        map(anexos => anexos.filter(anexo => anexo.ativo))
      )
      .subscribe(anexos => {
        this.fileCounter.emit(anexos);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
