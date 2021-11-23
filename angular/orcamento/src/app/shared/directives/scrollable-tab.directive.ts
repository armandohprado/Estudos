import {
  AfterViewChecked,
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: 'tabset[appScrollableTab]',
})
export class ScrollableTabDirective
  implements AfterViewInit, AfterViewChecked, OnDestroy {
  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  private listWidth: number;
  private averageItemsWidth: number;
  private changes: MutationObserver;

  get widthOfList(): number {
    let itemsWidth = 0;
    this.elementRef.nativeElement.firstChild.childNodes.forEach(
      (node: HTMLElement) => {
        if (node.offsetWidth) {
          const itemWidth = node.offsetWidth;
          itemsWidth += itemWidth;
        }
      }
    );
    this.averageItemsWidth = Math.round(
      (itemsWidth /
        this.elementRef.nativeElement.firstChild.childNodes.length) *
        3
    );
    return itemsWidth;
  }

  get leftPosition(): number {
    return (this.elementRef.nativeElement.firstChild as HTMLElement).offsetLeft;
  }

  ngAfterViewInit(): void {
    this.setStylesClasses();
    this.addScrollerButtons();
    setTimeout(() => this.reAdjust());
    this.changes = new MutationObserver(mutations => {
      const navTabs = this.elementRef.nativeElement.querySelector('.nav-tabs');
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.target === navTabs) {
          this.reAdjust();
        }
      });
    });
    this.changes.observe(
      this.elementRef.nativeElement.querySelector('.nav-tabs'),
      { attributes: true, childList: true }
    );
  }

  ngAfterViewChecked(): void {
    // Necessário para o primeiro reajuste dos tamanhos da lista
    // O Ngx bootstrap inicializa a lista de tabs sem o width e height enquanto os elementos não estiverem na view
    if (!this.listWidth) {
      this.reAdjust();
    }
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

  reAdjust(): void {
    this.listWidth = this.widthOfList;
    if (this.elementRef.nativeElement?.parentNode?.firstChild) {
      if (this.leftPosition < 0) {
        this.renderer.addClass(
          this.elementRef.nativeElement.parentNode.firstChild,
          'show'
        );
      } else {
        this.renderer.removeClass(
          this.elementRef.nativeElement.parentNode.firstChild,
          'show'
        );
      }
    }

    if (
      (this.elementRef.nativeElement as HTMLElement).offsetWidth <
      this.listWidth
    ) {
      this.renderer.addClass(this.elementRef.nativeElement.nextSibling, 'show');
    } else {
      this.elementRef.nativeElement.firstChild.style.left = `${this.elementRef
        .nativeElement.firstChild.offsetLeft - this.leftPosition}px`;
      this.renderer.removeClass(
        this.elementRef.nativeElement.nextSibling,
        'show'
      );
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.reAdjust();
  }

  private btnLeftClickCallback(): void {
    const {
      firstChild,
      parentNode,
      nextSibling,
    } = this.elementRef.nativeElement;

    this.renderer.addClass(nextSibling, 'show');
    firstChild.scrollBy({
      left: 0 - this.averageItemsWidth,
      behavior: 'smooth',
    });

    if (firstChild.scrollLeft <= 0) {
      this.renderer.removeClass(parentNode.firstChild, 'show');
    }
  }

  private btnRightClickCallback(): void {
    const {
      scrollLeft,
      offsetWidth,
      scrollWidth,
    } = this.elementRef.nativeElement.firstChild;

    this.renderer.addClass(
      this.elementRef.nativeElement.parentNode.firstChild,
      'show'
    );
    this.elementRef.nativeElement.firstChild.scrollBy({
      left: scrollLeft + this.averageItemsWidth,
      behavior: 'smooth',
    });
    if (scrollLeft >= scrollWidth - offsetWidth) {
      this.renderer.removeClass(
        this.elementRef.nativeElement.nextSibling,
        'show'
      );
    }
  }

  private setStylesClasses(): void {
    this.renderer.addClass(
      this.elementRef.nativeElement.parentNode,
      'tabs-scroller-container'
    );
  }

  private addScrollerButtons(): void {
    const { nativeElement }: { nativeElement: HTMLElement } = this.elementRef;
    const button: HTMLButtonElement = this.renderer.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'scroller', 'btn-icon');
    const buttonR = button.cloneNode(true) as HTMLElement;
    button.classList.add('left');
    buttonR.classList.add('right');

    button.innerHTML = `<i class="icon icon-left-arrow"></i>`;
    buttonR.innerHTML = `<i class="icon icon-right-arrow"></i>`;

    const { parentNode, nextSibling } = nativeElement;

    button.addEventListener('click', this.btnLeftClickCallback.bind(this));
    buttonR.addEventListener('click', this.btnRightClickCallback.bind(this));

    this.renderer.insertBefore(parentNode, button, nativeElement);
    this.renderer.insertBefore(parentNode, buttonR, nextSibling);
  }
}
