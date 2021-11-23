import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FlagResponsavelEnum, Funcionario, FuncionarioIncluirPayload, Grupo } from '../../../../../models';
import { ResponsavelService } from '@aw-services/orcamento/responsavel.service';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { OrcamentoService } from '@aw-services/orcamento/orcamento.service';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { trackByFactory } from '@aw-utils/track-by';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-lista-responsaveis',
  templateUrl: './lista-responsaveis.component.html',
  styleUrls: ['./lista-responsaveis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaResponsaveisComponent implements OnInit, OnDestroy {
  constructor(
    private bsModalRef: BsModalRef,
    private responsavelService: ResponsavelService,
    private orcamentoService: OrcamentoService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private _destroy$ = new Subject<void>();

  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;

  @Input() grupo: Grupo;
  @Input() flagResponsavel: number;
  @Input() tipoResponsavel: number;
  @Input() idFuncionarioAtual: number;

  selectedResponsavel: Funcionario;
  selectResponsavelToAllGrupos = false;

  showAllControl = new FormControl(false);
  showAll$ = this.showAllControl.valueChanges.pipe(distinctUntilChanged(), shareReplay());
  searchControl = new FormControl(null);
  search$ = this.searchControl.valueChanges.pipe(debounceTime(700), distinctUntilChanged(), shareReplay());
  private _responsaveisPadroes$ = new BehaviorSubject<Funcionario[]>([]);
  private _responsaveis$ = new BehaviorSubject<Funcionario[]>([]);
  responsaveis$ = this._responsaveis$.asObservable();

  fotoUrl = environment.fotoUrl;

  loading$ = new BehaviorSubject<boolean>(false);

  trackByFn = trackByFactory<Funcionario>('idFuncionario');

  close(): void {
    this.bsModalRef.hide();
  }

  select(responsavel: Funcionario): void {
    this.selectedResponsavel = responsavel;
    this.changeDetectorRef.markForCheck();
  }

  getResponsaveis(term: string | null, showAll: boolean): Observable<Funcionario[]> {
    this.loading$.next(true);
    return this.responsavelService
      .getResponsaveis(
        this.grupo.idOrcamento,
        this.grupo.idGrupo,
        term ? term : null,
        !showAll ? this.flagResponsavel : null
      )
      .pipe(
        tap(responsaveis => {
          if (!showAll) {
            this._responsaveisPadroes$.next(responsaveis);
          }
        }),
        finalize(() => {
          this.loading$.next(false);
        })
      );
  }

  submitResponsavel(): void {
    this.loading$.next(true);
    let http$: Observable<Funcionario | void>;
    const payload: FuncionarioIncluirPayload = {
      idFuncionario: this.selectedResponsavel.idFuncionario,
      idTipoResponsavel: this.tipoResponsavel,
      principal:
        FlagResponsavelEnum.Responsavel === this.flagResponsavel ||
        FlagResponsavelEnum.Arquitetura === this.flagResponsavel,
      idOrcamentoGrupo: this.grupo.idOrcamentoGrupo,
      idGrupo: this.grupo.idGrupo,
    };
    if (this.idFuncionarioAtual) {
      http$ = this.responsavelService.alterarResponsavel(
        this.idOrcamento,
        this.idOrcamentoCenario,
        this.idFuncionarioAtual,
        this.selectResponsavelToAllGrupos,
        payload
      );
    } else {
      http$ = this.responsavelService.saveResponsavel(
        this.idOrcamento,
        this.idOrcamentoCenario,
        payload,
        this.selectResponsavelToAllGrupos
      );
    }

    http$
      .pipe(
        finalize(() => {
          this.loading$.next(false);
        })
      )
      .subscribe(() => {
        this.close();
      });
  }

  ngOnInit(): void {
    this.getResponsaveis(null, false).subscribe();
    combineLatest([this.search$.pipe(startWith('')), this.showAll$.pipe(startWith(false))])
      .pipe(
        takeUntil(this._destroy$),
        switchMap(([busca, showAll]) => {
          if (showAll) {
            return this.getResponsaveis(busca, showAll);
          } else {
            return this._responsaveisPadroes$.asObservable();
          }
        })
      )
      .subscribe(responsaveis => {
        this._responsaveis$.next(responsaveis);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
