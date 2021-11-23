import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Destroyable } from '@aw-shared/components/common/destroyable-component';
import { EpPropostaItemQuery } from './state/item/ep-proposta-item.query';
import { takeUntil } from 'rxjs/operators';
import { epColumnWidth, epFirstColumnWidth } from './constants';

@Directive({ selector: '[epTotalWidth]' })
export class EpTotalWidthDirective extends Destroyable implements OnInit {
  constructor(
    public epPropostaItemQuery: EpPropostaItemQuery,
    private elementRef: ElementRef<HTMLElement>,
    private renderer2: Renderer2
  ) {
    super();
  }

  ngOnInit(): void {
    this.epPropostaItemQuery.totalColumns$.pipe(takeUntil(this.destroy$)).subscribe(totalColumns => {
      this.renderer2.setStyle(
        this.elementRef.nativeElement,
        'width',
        `${epFirstColumnWidth + epColumnWidth * totalColumns}px`
      );
    });
  }
}
