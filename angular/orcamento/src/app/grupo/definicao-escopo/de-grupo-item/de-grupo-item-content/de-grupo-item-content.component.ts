import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GrupoItemDE, GrupoItemTab } from '../../model/grupo-item';
import { DefinicaoEscopoService } from '../../definicao-escopo.service';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { DefinicaoEscopoState } from '../../state/definicao-escopo.state';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { GrupoItemAtributo } from '../../model/grupo-item-atributo';
import { trackByFactory } from '@aw-utils/track-by';

@Component({
  selector: 'app-de-grupo-item-content',
  templateUrl: './de-grupo-item-content.component.html',
  styleUrls: ['./de-grupo-item-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeGrupoItemContentComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    public definicaoEscopoService: DefinicaoEscopoService,
    private store: Store,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private _destroy$ = new Subject<void>();

  @Input() grupoItem: GrupoItemDE;

  @ViewChild('tabset') tabset: TabsetComponent;

  complementoControl: FormControl;

  trackByAtributo = trackByFactory<GrupoItemAtributo>('ordem');

  setActiveTab(tab: string | number | GrupoItemTab): void {
    this.definicaoEscopoService.setGrupoItemActiveTab(this.grupoItem.idOrcamentoGrupoItem, tab);
  }

  tentarNovamente = (call: (...args: any[]) => any, args: any[]) => call(...args);

  refreshQuantitativo(): void {
    if (this.grupoItem.quantitativo) {
      this.definicaoEscopoService.setGrupoItemQuantitativoApi(this.grupoItem.idOrcamentoGrupoItem, true);
    }
  }

  ngOnInit(): void {
    this.complementoControl = this.formBuilder.control(this.grupoItem.complemento);
    this.complementoControl.valueChanges
      .pipe(takeUntil(this._destroy$), debounceTime(750), distinctUntilChanged())
      .subscribe(value => {
        this.definicaoEscopoService.updateGrupoItemComplementoApi(this.grupoItem.idOrcamentoGrupoItem, value);
      });
  }

  ngAfterViewInit(): void {
    this.store
      .select(DefinicaoEscopoState.getGrupoItemActiveTab(this.grupoItem.idOrcamentoGrupoItem))
      .pipe(takeUntil(this._destroy$))
      .subscribe(activeTab => {
        const index = this.tabset ? this.tabset.tabs.findIndex(tab => tab.id === activeTab) : -1;
        if (index > -1) {
          this.tabset.tabs[index].active = true;
        }
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
