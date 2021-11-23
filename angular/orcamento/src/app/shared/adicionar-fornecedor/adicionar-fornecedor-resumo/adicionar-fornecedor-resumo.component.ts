import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AdicionarFornecedorTipoEnum } from '../adicionar-fornecedor.component';
import { CnCausa } from '../../../compra/models/cn-causa';
import { CnArea } from '../../../compra/models/cn-area';
import { Fornecedor } from '@aw-models/index';
import { UploadFile } from '@aw-models/gerenciador-arquivos-minio/upload-file';

export interface AdicionarFornecedorResumo {
  fornecedor: Fornecedor;
  detalhe: string;
  tipo: AdicionarFornecedorTipoEnum;
  motivo: CnCausa;
  area: CnArea;
  arquivos: UploadFile[];
  files: FileList;
}

@Component({
  selector: 'app-adicionar-fornecedor-resumo',
  templateUrl: './adicionar-fornecedor-resumo.component.html',
  styleUrls: ['./adicionar-fornecedor-resumo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdicionarFornecedorResumoComponent {
  @Input() resumo: AdicionarFornecedorResumo;
}
