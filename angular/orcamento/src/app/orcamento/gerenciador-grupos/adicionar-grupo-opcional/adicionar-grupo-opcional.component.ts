import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataGerenciadorGruposService } from '../services/data-gerenciador-grupos.service';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { GerenciadorGruposService } from '../state/gerenciador-grupos.service';
import { CenarioGG, FamiliaGrupoOpc, TipoGrupoOpcionalEnum } from '../state/gerenciador-grupo.model';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { filterNilValue } from '@datorama/akita';

@Component({
  selector: 'app-adicionar-grupo-opcional',
  templateUrl: './adicionar-grupo-opcional.component.html',
  styleUrls: ['./adicionar-grupo-opcional.component.scss'],
})
export class AdicionarGrupoOpcionalComponent implements OnInit {
  constructor(
    private dataGerenciadorGrupos: DataGerenciadorGruposService,
    private bsModalRef: BsModalRef,
    private gerenciadorGruposService: GerenciadorGruposService
  ) {}

  cenario: CenarioGG;
  idOrcamentoFamilia: number;
  idOrcamentoGrupo: number;
  gruposLoading = false;
  saving = false;

  familias$: Observable<FamiliaGrupoOpc[]>;
  tipoGrupo = TipoGrupoOpcionalEnum;

  form = new FormGroup({
    familias: new FormControl(null, [Validators.required]),
    grupos: new FormControl(null, [Validators.required]),
    tipoGrupoOpcional: new FormControl(this.tipoGrupo.troca, Validators.required),
  });

  get tipoGrupoOpcional(): FormControl | undefined {
    return this.form?.get('tipoGrupoOpcional') as FormControl;
  }

  grupos$ = this.form.get('familias').valueChanges.pipe(
    filterNilValue(),
    switchMap(idOrcamentoCenarioFamilia => {
      this.gruposLoading = true;
      return this.dataGerenciadorGrupos.buscarGruposOpcionais(idOrcamentoCenarioFamilia).pipe(
        finalize(() => {
          this.gruposLoading = false;
        })
      );
    })
  );

  ngOnInit(): void {
    this.familias$ = this.dataGerenciadorGrupos.buscarFamiliasOpcionais(this.cenario.idOrcamentoCenario).pipe(
      catchAndThrow(() => {
        this.gerenciadorGruposService.editandoCenario(
          this.cenario.idOrcamentoCenario,
          this.idOrcamentoFamilia,
          this.idOrcamentoGrupo,
          { opcional: false }
        );
        this.close();
      })
    );
  }

  close(): void {
    this.gerenciadorGruposService.editandoGrupo(this.idOrcamentoFamilia, this.idOrcamentoGrupo, grupo => {
      return {
        ...grupo,
        opcional: false,
        cenarios: grupo.cenarios.map(cenario => {
          if (cenario?.idOrcamentoCenario === this.cenario.idOrcamentoCenario) {
            cenario = { ...cenario, opcional: false };
          }
          return cenario;
        }),
      };
    });
    this.bsModalRef.hide();
  }

  salvarGrupoOpc(): void {
    this.saving = true;
    this.dataGerenciadorGrupos
      .gravarOpcional(this.cenario.idOrcamentoCenarioGrupo ?? null, {
        tipoGrupoOpcional: +this.form.get('tipoGrupoOpcional').value,
        idOrcamentoCenarioGrupoVinculoOpcional: +this.form.get('grupos').value,
      })
      .pipe(
        tap(retorno => {
          this.gerenciadorGruposService.editandoCenario(
            this.cenario.idOrcamentoCenario,
            this.idOrcamentoFamilia,
            this.idOrcamentoGrupo,
            retorno
          );
          this.gerenciadorGruposService.editandoGrupo(this.idOrcamentoFamilia, this.idOrcamentoGrupo, group => {
            return { ...group, opcional: retorno.opcional };
          });
          this.bsModalRef.hide();
        }),
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe();
  }
}
