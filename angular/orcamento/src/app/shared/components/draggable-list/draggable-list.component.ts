import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  TemplateRef,
  TrackByFunction,
} from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SafeHtml } from '@angular/platform-browser';

// TODO transformar esse componente num ValueControlAcessor

@Component({
  selector: 'app-draggable-list',
  templateUrl: './draggable-list.component.html',
  styleUrls: ['./draggable-list.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraggableListComponent implements OnInit {
  constructor() {}

  @Input() allListLabel = 'Disponíveis:';
  @Input() selectedListLabel = 'Selecionados:';
  @Input() fieldValue = 'id';
  @Input() customTemplate: TemplateRef<any>;
  @Input() fieldLabel = 'nome';
  @Input() emptyMessage: any | SafeHtml = `Não há edifícios cadastrados`;
  @Input() fornecedores = false;
  @Input() grupo: any = {};

  @Output() selectedData = new EventEmitter<any[]>();
  @HostBinding('class.row') row = true;

  listaFornecedores;

  @Input()
  set selectedList(list: any[]) {
    this._selectedList = list.slice(0);
    this._list = this.distinctValues(this._list, this._selectedList);
  }
  get selectedList(): any[] {
    return this._selectedList;
  }
  private _selectedList: any[] = [];

  @Input('list')
  set list(data: any[]) {
    this._list = this.distinctValues(data, this.selectedList);
  }
  get list(): any[] {
    return this._list;
  }
  private _list: any[];

  trackByFn: TrackByFunction<any> = (_, item) => item[this.fieldLabel];

  distinctValues(list: any[], selectedList: any[]): any[] {
    return (list ?? []).filter(
      item => !selectedList.some(selectedItem => selectedItem[this.fieldValue] === item[this.fieldValue])
    );
  }

  ngOnInit(): void {
    if (this.fornecedores) {
      this.selectedList.forEach(fornecedor => {
        const propostas = this.grupo.propostas.filter(proposta => proposta.idFornecedor === fornecedor.idFornecedor);

        if (propostas.length > 0) {
          fornecedor.isDisabled = true;
        }
      });
      this.listaFornecedores = [...(this.selectedList ?? [])];
    }
  }

  drop(event: CdkDragDrop<any[], any>, type?: string, fornecedor?: boolean): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      if (fornecedor) {
        const item = event.container.data[event.currentIndex];
        if (type === 'remover') {
          this.listaFornecedores.forEach(f => {
            if (f.idFornecedor === item.idFornecedor) {
              f.acaoFornecedor = type;
            }
          });
        }

        if (type === 'adicionar') {
          item.acaoFornecedor = type;
          this.listaFornecedores.push(item);
        }
      }
    }

    let returnList;

    if (fornecedor) {
      returnList = this.listaFornecedores;
    } else {
      returnList = this.selectedList;
    }
    this.selectedData.emit(returnList);
  }
}
