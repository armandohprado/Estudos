import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Fornecedor } from '../../../models';
import { FornecedorService } from '../../../services/orcamento/fornecedor.service';
import { SelectFornecedor } from '../select-fornecedores.component';
import { finalize } from 'rxjs/operators';

const compareFornecedor = (a: SelectFornecedor, b: SelectFornecedor) =>
  a.idOrcamentoGrupoFornecedor
    ? a.idOrcamentoGrupoFornecedor === b.idOrcamentoGrupoFornecedor
    : a.idFornecedor === b.idFornecedor;

@Component({
  selector: 'aw-page-fornecedores',
  templateUrl: './page-fornecedores.component.html',
  styleUrls: ['./page-fornecedores.component.scss'],
})
export class AwPageFornecedoresComponent implements OnInit {
  constructor(private fornecedorService: FornecedorService) {}

  @Input() idGrupo: number;
  @Input() codigoGrupo: string;
  @Input() nomeGrupo: string;
  @Input() idOrcamentoGrupo: number;
  @Input() idOrcamento: number;
  @Input('value')
  set _value(fornecedores: Array<SelectFornecedor>) {
    this.value = fornecedores.slice().map(o => ({ ...o }));
  }
  value: Array<SelectFornecedor> = [];
  @Input() saveOn: 'select' | 'confirm' = 'confirm';
  @Input() compras: boolean;

  @Output() selected = new EventEmitter<SelectFornecedor>();
  @Output() removed = new EventEmitter<SelectFornecedor>();
  @Output() voltar = new EventEmitter<MouseEvent>();
  @Output() confirmar = new EventEmitter<Array<SelectFornecedor>>();

  loading: boolean;
  loadingFornecedor: SelectFornecedor[] = [];

  isFornecedorDisabled = (fornecedor: SelectFornecedor) =>
    this.loadingFornecedor.some(o => compareFornecedor(fornecedor, o));

  removeLoading(fornecedor: SelectFornecedor): void {
    this.loadingFornecedor = this.loadingFornecedor.filter(o => !compareFornecedor(fornecedor, o));
    const originFornecedorDisabled = this.isFornecedorDisabled;
    this.isFornecedorDisabled = () => false;
    setTimeout(() => {
      this.isFornecedorDisabled = originFornecedorDisabled;
    });
  }

  onConfirmar(): void {
    if (this.saveOn === 'confirm') {
      this.loading = true;
      this.fornecedorService
        .addFornecedoresGrupo(
          this.idOrcamento,
          this.idGrupo,
          this.idOrcamentoGrupo,
          this.value
            .filter(o => !o.idOrcamentoGrupoFornecedor)
            .map(o => ({ ...o, acaoFornecedor: 'adicionar' })) as Fornecedor[]
        )
        .pipe(
          finalize(() => {
            this.loading = false;
            this.confirmar.emit(this.value);
          })
        )
        .subscribe();
    } else {
      this.confirmar.emit(this.value);
    }
  }

  onSelect(fornecedor: SelectFornecedor): void {
    if (this.saveOn === 'select') {
      this.loadingFornecedor = [...this.loadingFornecedor, fornecedor];
      this.fornecedorService
        .addFornecedorGrupoCompra(this.idOrcamentoGrupo, fornecedor as Fornecedor)
        .pipe(
          finalize(() => {
            this.removeLoading(fornecedor);
          })
        )
        .subscribe(idOrcamentoGrupoFornecedor => {
          const newFornecedor = { ...fornecedor, idOrcamentoGrupoFornecedor };
          /*this.value = this.value.map(v => {
            if (v.idFornecedor === fornecedor.idFornecedor) {
              v = newFornecedor;
            }
            return v;
          });*/
          this.selected.emit(newFornecedor);
        });
    } else {
      this.selected.emit(fornecedor);
    }
  }

  onRemove(fornecedor: SelectFornecedor): void {
    if (this.saveOn === 'select') {
      this.loadingFornecedor = [...this.loadingFornecedor, fornecedor];
      this.fornecedorService
        .removeFornecedorGrupoCompra(fornecedor.idOrcamentoGrupoFornecedor)
        .pipe(
          finalize(() => {
            this.removeLoading(fornecedor);
          })
        )
        .subscribe(() => {
          this.removed.emit(fornecedor);
        });
    } else {
      this.removed.emit(fornecedor);
    }
  }

  ngOnInit(): void {}
}
