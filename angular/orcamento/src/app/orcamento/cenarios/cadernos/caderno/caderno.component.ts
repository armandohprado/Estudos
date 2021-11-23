import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { debounceTime, filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { noSpacesValidator } from '@aw-shared/validators/no-spaces';
import { RouteParamEnum } from '@aw-models/route-param.enum';
import { Planilha } from '@aw-models/planilha';
import { CadernosService } from '@aw-services/orcamento/cadernos.service';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { collapseAnimation } from '@aw-shared/animations/collapse';
import { ProjetoService } from '@aw-services/orcamento/projeto.service';

@Component({
  selector: 'app-caderno',
  templateUrl: './caderno.component.html',
  styleUrls: ['./caderno.component.scss'],
  animations: [collapseAnimation()],
})
export class CadernoComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private cadernosService: CadernosService,
    private projetoService: ProjetoService
  ) {}

  private _destroy$ = new Subject<void>();

  get logoStatusLineMessage(): string {
    if (this.hasGetImageFailed) {
      return 'Falha ao buscar o logo';
    }

    if (this.invalidType) {
      return 'arquivo inválido';
    }

    if (this.isSent) {
      return 'enviado';
    } else {
      return 'a enviar';
    }
  }

  isActive: boolean;

  readonly projeto$ = this.projetoService.projeto$;

  // Routes
  idOrcamentoCenario = this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idOrcamentoCenario);
  idCaderno = this.activatedRoute.snapshot.paramMap.get(RouteParamEnum.idCaderno);

  // Caderno
  caderno$ = this.cadernosService.caderno$;
  planilhas: Planilha[];
  nomeCadernoControl: FormControl;

  successFeedback: boolean;

  // Upload Logo
  selectedImage = null;
  hasGetImageFailed = false;
  isSent: boolean;
  invalidType: boolean;
  stagedLogo: any;

  isLoading: { loadingId: any; status: boolean } = {
    loadingId: '',
    status: false,
  };

  collapseModelo = true;
  collapseOrcamentoFiltro = false;
  collapseOrcamento = true;
  collapseCondicoes = true;

  collapseMod(collapse: boolean): void {
    this.collapseModelo = collapse;
  }

  collapseOrcFiltro(collapse: boolean): void {
    this.collapseOrcamentoFiltro = collapse;
  }

  collapseOrc(collapse: boolean): void {
    this.collapseOrcamento = collapse;
  }

  showPreview(file?: any): void {
    if (file) {
      const type = file.type.split('/')[0];
      const size = file.size;
      if (type === 'image' && size <= 10000000) {
        // 10mb
        this.stagedLogo = file;
        this.invalidType = false;
        this.isSent = false;
        const blobImage = new Blob([file], { type: file.type });
        const reader = new FileReader();
        reader.readAsDataURL(blobImage);
        reader.addEventListener('load', (e: any) => {
          this.selectedImage = e.target.result; // event
        });
      } else {
        this.stagedLogo = null;
        this.selectedImage = null;
        this.invalidType = true;
      }
    }
  }

  sendCadernoLogo(loadingId: string): void {
    if (this.stagedLogo) {
      this.isLoading = { loadingId, status: true };
      this.cadernosService.uploadCadernoLogo(this.idOrcamentoCenario, this.idCaderno, this.stagedLogo).subscribe(() => {
        this.isLoading = { loadingId: '', status: false };
        this.isSent = true;
      });
    }
  }

  getLogo(loadingId: string): void {
    if (!this.selectedImage) {
      this.isLoading = { loadingId, status: true };
      this.cadernosService
        .getCadernoLogo(this.idOrcamentoCenario, this.idCaderno)
        .pipe(
          finalize(() => {
            this.isLoading = { loadingId: '', status: false };
          }),
          catchAndThrow(() => {
            this.hasGetImageFailed = true;
            this.isLoading = { loadingId: '', status: false };
          })
        )
        .subscribe(value => {
          if (value) {
            this.selectedImage = `data:image/jpeg;base64,${value.data}`;
            this.isSent = true;
            this.hasGetImageFailed = false;
            this.isLoading = { loadingId, status: true };
          }
        });
    }
  }

  resetInputFile(): void {
    this.hasGetImageFailed = false;
    this.invalidType = false;
  }

  ngOnInit(): void {
    this.caderno$.pipe(takeUntil(this._destroy$)).subscribe(caderno => {
      this.planilhas = caderno.cadernoPlanilha;
    });
    this.cadernosService.feedBackController$.pipe(takeUntil(this._destroy$)).subscribe(status => {
      this.successFeedback = status;
    });
    this.nomeCadernoControl = new FormControl(this.caderno$.value.nomeCaderno, [
      Validators.required,
      noSpacesValidator,
    ]);
    this.nomeCadernoControl.valueChanges
      .pipe(
        debounceTime(500),
        filter(() => this.nomeCadernoControl.valid),
        switchMap(nomeCaderno =>
          this.cadernosService.updateCaderno(this.idOrcamentoCenario, +this.idCaderno, {
            ...this.caderno$.value,
            nomeCaderno,
          })
        ),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
