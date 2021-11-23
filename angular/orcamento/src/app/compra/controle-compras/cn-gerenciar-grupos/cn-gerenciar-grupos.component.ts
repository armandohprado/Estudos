import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CcGrupoService } from '../state/grupos/cc-grupo.service';
import { CnGerenciarGrupo, trackByCnGerenciarGrupo } from '../../models/cn-gerenciar-grupo';
import { debounceTime, finalize } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-cn-gerenciar-grupos',
  templateUrl: './cn-gerenciar-grupos.component.html',
  styleUrls: ['./cn-gerenciar-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnGerenciarGruposComponent implements OnInit {
  constructor(
    private bsModalRef: BsModalRef,
    private changeDetectorRef: ChangeDetectorRef,
    private ccGrupoService: CcGrupoService
  ) {}

  @Input() idOrcamentoCenario: number;
  @Input() idCompraNegociacao: number;

  loading = true;
  saving = false;
  grupos: CnGerenciarGrupo[] = [];

  readonly termControl = new FormControl('');
  readonly term$ = this.termControl.valueChanges.pipe(debounceTime(350));

  readonly trackBy = trackByCnGerenciarGrupo;

  toggleGrupo(idCompraNegociacaoGrupo: number, $event: boolean): void {
    this.grupos = this.grupos.map(grupo =>
      grupo.idCompraNegociacaoGrupo === idCompraNegociacaoGrupo ? { ...grupo, ativo: $event } : grupo
    );
    this.changeDetectorRef.markForCheck();
  }

  close(): void {
    this.bsModalRef.hide();
  }

  salvar(): void {
    this.saving = true;
    this.ccGrupoService
      .ativarGrupos(this.idOrcamentoCenario, this.idCompraNegociacao, this.grupos)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(() => {
        this.close();
      });
  }

  ngOnInit(): void {
    this.ccGrupoService
      .getGerenciarGrupos(this.idCompraNegociacao)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(grupos => {
        this.grupos = grupos;
      });
  }
}
