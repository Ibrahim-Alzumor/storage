import {Directive, ElementRef, HostListener, Input, NgZone, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[draggableColumn]',
  standalone: true
})
export class DraggableColumnDirective implements OnInit {
  @Input() draggableColumn: string = '';

  private draggedColumn: HTMLElement | null = null;
  private table: HTMLTableElement | null = null;
  private isDragging = false;
  private placeholder: HTMLElement | null = null;
  private columnIndex = -1;
  private initialX = 0;
  private targetIndex = -1;
  private headers: HTMLElement[] = [];
  private dragThreshold = 5;
  private hasMovedEnough = false;
  private lastSwapTime = 0;
  private swapDelay = 200;
  private columnRects: DOMRect[] = [];
  private horizontalBuffer = 20;

  constructor(private el: ElementRef, private renderer: Renderer2, private ngZone: NgZone) {
  }

  ngOnInit() {
    this.table = this.el.nativeElement.closest('table') as HTMLTableElement;
    const parentRow = this.el.nativeElement.parentElement;
    const parentSection = parentRow?.parentElement;

    if (!this.table || parentSection?.tagName !== 'THEAD') {
      console.error('Directive must be applied to a table header cell. (th) element');
      return;
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (
      event.button !== 0 ||
      document.body.classList.contains('resizing') ||
      (event.target as HTMLElement).classList.contains('resizer')
    ) {
      return;
    }

    const parentRow = this.el.nativeElement.parentElement;
    const parentSection = parentRow?.parentElement;
    if (parentSection?.tagName !== 'THEAD') return;

    this.draggedColumn = this.el.nativeElement;

    if (!this.draggedColumn || !this.draggedColumn.parentElement) return;

    this.columnIndex = Array.from(this.draggedColumn.parentElement.children).indexOf(this.draggedColumn);
    this.targetIndex = this.columnIndex;
    this.initialX = event.clientX;
    this.hasMovedEnough = false;

    this.headers = Array.from(this.draggedColumn.parentElement.children) as HTMLElement[];

    this.ngZone.runOutsideAngular(() => {
      const mouseMoveListener = this.renderer.listen('document', 'mousemove', (e) => this.onMouseMove(e));
      const mouseUpListener = this.renderer.listen('document', 'mouseup', () => {
        this.cleanup();
        mouseMoveListener();
        mouseUpListener();
      });
    });

    event.preventDefault();
  }

  private onMouseMove = (event: MouseEvent) => {
    if (!this.draggedColumn) return;

    const deltaX = event.clientX - this.initialX;

    if (!this.hasMovedEnough) {
      if (Math.abs(deltaX) < this.dragThreshold) return;
      this.hasMovedEnough = true;
      this.startDragging();
    }

    if (!this.isDragging || !this.placeholder) return;

    const left = this.draggedColumn.getBoundingClientRect().left + deltaX;
    this.renderer.setStyle(this.placeholder, 'left', `${left}px`);

    const newTargetIndex = this.getTargetColumnIndex(event);

    const now = Date.now();
    if (
      newTargetIndex !== -1 &&
      newTargetIndex !== this.targetIndex &&
      newTargetIndex !== this.columnIndex &&
      now - this.lastSwapTime > this.swapDelay
    ) {
      this.targetIndex = newTargetIndex;
      this.swapColumns(this.columnIndex, this.targetIndex);
      this.columnIndex = this.targetIndex;
      this.initialX = event.clientX;
      this.lastSwapTime = now;
      this.updateColumnRects();
    }
  };

  private getTargetColumnIndex(event: MouseEvent): number {
    if (this.columnRects.length === 0) {
      this.updateColumnRects();
    }

    for (let i = 0; i < this.headers.length; i++) {
      if (i === this.columnIndex) continue;

      const rect = this.columnRects[i];
      const centerX = rect.left + rect.width / 2;
      const leftBound = rect.left + this.horizontalBuffer;
      const rightBound = rect.right - this.horizontalBuffer;

      if (event.clientX >= leftBound && event.clientX <= rightBound) {
        return event.clientX < centerX ? i : (i + 1 > this.headers.length - 1 ? i : i + 1);
      }
    }

    return -1;
  }

  private updateColumnRects() {
    this.columnRects = this.headers.map(header => header.getBoundingClientRect());
  }

  private startDragging() {
    this.isDragging = true;
    this.renderer.addClass(document.body, 'dragging');
    this.lastSwapTime = Date.now();

    this.placeholder = this.renderer.createElement('div');
    this.renderer.addClass(this.placeholder, 'column-placeholder');

    this.renderer.setStyle(this.placeholder, 'position', 'absolute');
    this.renderer.setStyle(this.placeholder, 'pointer-events', 'none');
    this.renderer.setStyle(this.placeholder, 'z-index', '1000');

    const rect = this.draggedColumn!.getBoundingClientRect();
    this.renderer.setStyle(this.placeholder, 'width', `${rect.width}px`);
    this.renderer.setStyle(this.placeholder, 'height', `${rect.height}px`);
    this.renderer.setStyle(this.placeholder, 'top', `${rect.top}px`);
    this.renderer.setStyle(this.placeholder, 'left', `${rect.left}px`);

    if (this.placeholder) {
      document.body.appendChild(this.placeholder);
    }

    this.updateColumnRects();
  }

  private cleanup() {
    this.isDragging = false;
    this.renderer.removeClass(document.body, 'dragging');

    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.removeChild(this.placeholder);
    }

    this.placeholder = null;
    this.draggedColumn = null;
    this.targetIndex = -1;
    this.columnRects = [];
  }

  private swapColumns(fromIndex: number, toIndex: number) {
    if (!this.table) return;
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;

    const rows = Array.from(this.table.rows);

    window.requestAnimationFrame(() => {
      rows.forEach(row => {
        if (fromIndex < row.cells.length && toIndex < row.cells.length) {
          if (fromIndex < toIndex) {
            row.insertBefore(row.cells[fromIndex], row.cells[toIndex].nextSibling);
          } else {
            row.insertBefore(row.cells[fromIndex], row.cells[toIndex]);
          }
        }
      });
    });
  }
}
