import { DefinicaoEscopoLojaService } from '../definicao-escopo-loja.service';
import { Directive, Input } from '@angular/core';
import { GrupoAlt, isAwReferencia, OrcamentoCenarioPadrao } from '../../../models';
import { finalize } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { Observable } from 'rxjs';
import { TipoGrupoEnum } from '@aw-models/tipo-grupo.enum';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class DefinicaoEscopoLojaAbstract {
  protected constructor(
    private __definicaoEscopoLojaService: DefinicaoEscopoLojaService,
    private __bsModalRef: BsModalRef,
    private __awDialogService: AwDialogService,
    private __setLoading?: (loading: boolean) => void
  ) {}

  @Input() idProjeto: number;
  @Input() cenarioPadrao: OrcamentoCenarioPadrao;
  @Input() grupo: GrupoAlt;
  @Input() reenvio: boolean;
  @Input() idOrcamentoCenario: number;
  @Input() isControleCompras: boolean;

  private getRequests(enviarCotacao: boolean, bsModalRef: BsModalRef): Observable<void | GrupoAlt> {
    return this.__definicaoEscopoLojaService
      .getRequestsClose(this.idProjeto, this.grupo.idOrcamento, this.grupo, enviarCotacao, this.reenvio)
      .pipe(
        finalize(() => {
          bsModalRef.hide();
          this.__bsModalRef.hide();
          this.__setLoading?.(false);
        })
      );
  }

  close(enviarCotacao = false): void {
    this.__setLoading?.(true);
    if (enviarCotacao && !isAwReferencia(this.grupo.nomeGrupo) && this.grupo.idTipoGrupo !== TipoGrupoEnum.Tecnico) {
      const label = this.reenvio ? 'Ree' : 'E';
      this.__awDialogService.warning({
        title: `${label}nviar a cotação`,
        content: `Deseja fazer o ${label.toLowerCase()}nvio da cotação?`,
        secondaryBtn: {
          title: `Não ${label.toLowerCase()}nviar`,
          action: bsModalRef => this.getRequests(false, bsModalRef),
        },
        primaryBtn: {
          title: `${label}nviar`,
          action: bsModalRef => this.getRequests(true, bsModalRef),
        },
      });
    } else {
      this.getRequests(false, this.__bsModalRef).subscribe();
    }
  }
}
