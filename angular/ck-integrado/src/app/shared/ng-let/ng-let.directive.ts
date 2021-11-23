import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

class NgLetContext<T> {
  $implicit: T | null = null;
  ngLet: T | null = null;

  setData(value: T): void {
    this.$implicit = value;
    this.ngLet = value;
  }
}

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[ngLet]' })
export class NgLetDirective<T = unknown> implements OnInit {
  constructor(private _viewContainer: ViewContainerRef, private templateRef: TemplateRef<NgLetContext<T>>) {}

  private _context = new NgLetContext<T>();

  @Input()
  set ngLet(value: T) {
    this._context.setData(value);
  }

  ngOnInit(): void {
    this._viewContainer.clear();
    this._viewContainer.createEmbeddedView(this.templateRef, this._context);
  }

  static ngTemplateContextGuard<C>(dir: NgLetDirective<C>, ctx: any): ctx is NgLetContext<NonNullable<C>> {
    return true;
  }
}
