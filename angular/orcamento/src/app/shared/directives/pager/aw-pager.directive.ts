import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  Renderer2,
} from '@angular/core';
import { PagerComponent } from 'ngx-bootstrap/pagination';

@Directive({
  selector: 'pager[awPager]',
})
export class AwPagerDirective implements AfterViewInit {
  constructor(
    private elementRef: ElementRef,
    private renderer2: Renderer2,
    private pagerRef: PagerComponent
  ) {}

  @Input() nextIcon = 'icon-right-arrow';
  @Input() previousIcon = 'icon-left-arrow';

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.pagerRef.previousText = ' ';
      this.pagerRef.nextText = ' ';
      this.pagerRef.firstText = ' ';
      this.pagerRef.lastText = ' ';
      const right = this.renderer2.createElement('span');
      const left = this.renderer2.createElement('span');
      this.renderer2.addClass(right, 'icon');
      this.renderer2.addClass(left, 'icon');
      this.renderer2.addClass(right, this.nextIcon);
      this.renderer2.addClass(left, this.previousIcon);
      const leftAppend = this.elementRef.nativeElement.querySelector(
        'li:first-child > a'
      );
      this.renderer2.removeAttribute(leftAppend, 'href');
      const rightAppend = this.elementRef.nativeElement.querySelector(
        'li:last-child > a'
      );
      this.renderer2.removeAttribute(rightAppend, 'href');
      this.renderer2.appendChild(leftAppend, left);
      this.renderer2.appendChild(rightAppend, right);
    });
  }
}
