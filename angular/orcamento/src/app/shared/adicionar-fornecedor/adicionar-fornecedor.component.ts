import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdicionarFornecedorResumo } from './adicionar-fornecedor-resumo/adicionar-fornecedor-resumo.component';
import { ProjetoAlt } from '@aw-models/index';
import { GerenciadorArquivosMinIOService } from '@aw-services/gerenciador-arquivos-minio/gerenciador-arquivos-min-io.service';
import { Observable, of, Subject } from 'rxjs';
import { finalize, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { CnCausa } from '../../compra/models/cn-causa';
import { CnArea } from '../../compra/models/cn-area';
import { AwAlertComponent } from '@aw-components/aw-alert/aw-alert.component';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { catchAndThrow } from '@aw-utils/rxjs/operators';
import { UploadFile } from '@aw-models/gerenciador-arquivos-minio/upload-file';
import { environment } from '../../../environments/environment';
import { FornecedorService } from '@aw-services/orcamento/fornecedor.service';

export enum AdicionarFornecedorTipoEnum {
  naoHomologado = 4,
  suspenso = 5,
}

export enum AdicionarFornecedorMode {
  form,
  resumo,
}

export const nomePastaAdicionarFornecedor = 'adicionar-fornecedor';

@Component({
  selector: 'app-adicionar-fornecedor',
  templateUrl: './adicionar-fornecedor.component.html',
  styleUrls: ['./adicionar-fornecedor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdicionarFornecedorComponent implements OnInit, OnDestroy {
  constructor(
    private gerenciadorArquivosMinIOService: GerenciadorArquivosMinIOService,
    private awDialogService: AwDialogService,
    private changeDetectorRef: ChangeDetectorRef,
    private fornecedorService: FornecedorService
  ) {}

  private readonly _destroy$ = new Subject<void>();

  mode = AdicionarFornecedorMode.form;
  readonly adicionarFornecedorMode = AdicionarFornecedorMode;
  loadingFornecedores = false;

  @ViewChild('alert') readonly alertRef: AwAlertComponent;

  @Input() codigoGrupo: string;
  @Input() nomeGrupo: string;
  @Input() loading: boolean;
  @Input() listaCausa: CnCausa[];
  @Input() listaArea: CnArea[];
  @Input() projeto: ProjetoAlt;

  @Output() voltar = new EventEmitter();
  @Output() submeterAprovacao = new EventEmitter<AdicionarFornecedorResumo>();

  readonly search$ = new Subject<string>();
  readonly fornecedores$ = this.search$.asObservable().pipe(
    switchMap(busca => {
      this.loadingFornecedores = true;
      const tipo = /^-?\d*\.?\d+$/.test(busca) ? 'cnpj' : 'nome';
      return this.fornecedorService.getFornecedoresByTerm2(tipo, busca).pipe(
        finalize(() => {
          this.loadingFornecedores = false;
          this.changeDetectorRef.markForCheck();
        })
      );
    }),
    shareReplay()
  );

  uploadingFiles = false;

  readonly form = new FormGroup({
    fornecedor: new FormControl(null, [Validators.required]),
    detalhe: new FormControl(null, [Validators.required]),
    tipo: new FormControl(AdicionarFornecedorTipoEnum.naoHomologado),
    motivo: new FormControl(null, [Validators.required]),
    area: new FormControl(),
    arquivos: new FormControl(),
    files: new FormControl([]),
  });

  readonly urlNovoCadastro = `${environment.centralizacao}Projetos/Web/fornecedores/ProntuarioCadastroFornecedorInterno.aspx`;

  private _submeterAprovacao(): void {
    this.submeterAprovacao.emit(this.form.value);
  }

  submeterOrNext(): void {
    if (this.mode === AdicionarFornecedorMode.form) {
      this.uploadingFiles = true;
      const fileList: FileList = this.form.get('files').value;
      let http$: Observable<UploadFile[] | null> = of(null);
      if (fileList?.length) {
        http$ = this.gerenciadorArquivosMinIOService.uploadArquivos(nomePastaAdicionarFornecedor, fileList);
      }
      http$
        .pipe(
          finalize(() => {
            this.uploadingFiles = false;
            this.changeDetectorRef.markForCheck();
          }),
          catchAndThrow(() => {
            this.awDialogService.error('Erro ao tentar fazer upload dos arquivos', 'Favor tentar novamente');
          })
        )
        .subscribe(files => {
          this.alertRef.close();
          this.form.get('arquivos').setValue(files ?? []);
          const { idFichaArea }: CnCausa = this.form.get('motivo').value;
          this.form.get('area').setValue(this.listaArea.find(area => area.idFichaArea === idFichaArea));
          this.mode = AdicionarFornecedorMode.resumo;
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this._submeterAprovacao();
    }
  }

  voltarPageOrStep(): void {
    if (this.mode === AdicionarFornecedorMode.form) {
      this.voltar.emit();
    } else {
      this.mode = AdicionarFornecedorMode.form;
      this.changeDetectorRef.markForCheck();
    }
  }

  ngOnInit(): void {
    this.form
      .get('tipo')
      .valueChanges.pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.form.get('motivo').setValue(null);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
