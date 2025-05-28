import {Directive, ElementRef, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[resizableColumn]',
  standalone: true
})
export class ResizableColumnDirective implements OnInit {
  private table: HTMLTableElement | null = null;
  private isResizing = false;
  private startX: number = 0;
  private startWidth: number = 0;
  private columnIndex: number = -1;
  private resizer: HTMLElement | null = null;
  private columnWidths: number[] = [];
  private tableWidth: number = 0;
  private maxColumnWidth: number = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit() {
    this.table = this.el.nativeElement.closest('table');
    this.createResizer();
  }

  private createResizer() {
    this.resizer = this.renderer.createElement('div');
    this.renderer.addClass(this.resizer, 'resizer');
    this.renderer.appendChild(this.el.nativeElement, this.resizer);

    if (this.resizer) {
      this.resizer.addEventListener('mousedown', this.onResizerMouseDown.bind(this));
    }
  }

  private onResizerMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.table) return;

    this.isResizing = true;
    this.startX = event.pageX;
    this.startWidth = this.el.nativeElement.offsetWidth;
    this.columnIndex = Array.from(this.el.nativeElement.parentElement.children).indexOf(this.el.nativeElement);

    this.tableWidth = this.table.offsetWidth;
    this.maxColumnWidth = this.tableWidth * 0.75;

    const headerRow = this.table.querySelector('tr');
    if (headerRow) {
      const columns = headerRow.querySelectorAll('th');
      this.columnWidths = Array.from(columns).map(col => col.offsetWidth);
    }

    this.renderer.addClass(document.body, 'resizing');

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isResizing || !this.table) return;

    const diffX = event.pageX - this.startX;

    let newWidth = Math.min(
      this.maxColumnWidth,
      Math.max(50, this.startWidth + diffX)
    );

    if (newWidth <= this.startWidth) {
      this.applyColumnWidth(this.columnIndex, newWidth);
      return;
    }

    const widthIncrease = newWidth - this.columnWidths[this.columnIndex];
    if (widthIncrease <= 0) return;

    this.applyProportionalResize(newWidth, widthIncrease);
  }

  private applyProportionalResize(newCurrentColumnWidth: number, widthIncrease: number) {
    if (!this.table) return;

    const headerRow = this.table.querySelector('tr');
    if (!headerRow) return;

    const columns = headerRow.querySelectorAll('th');
    if (columns.length <= 1) return;

    const totalOtherWidth = this.columnWidths.reduce((sum, width, idx) =>
      idx !== this.columnIndex ? sum + width : sum, 0);

    columns.forEach((col, idx) => {
      if (idx === this.columnIndex) {
        this.applyColumnWidth(idx, newCurrentColumnWidth);
      } else {
        const proportion = this.columnWidths[idx] / totalOtherWidth;
        const reduction = widthIncrease * proportion;
        const adjustedWidth = Math.max(50, this.columnWidths[idx] - reduction);
        this.applyColumnWidth(idx, adjustedWidth);
      }
    });
  }

  private applyColumnWidth(colIndex: number, width: number) {
    if (!this.table) return;

    const rows = this.table.rows;
    for (let i = 0; i < rows.length; i++) {
      if (colIndex < rows[i].cells.length) {
        const cell = rows[i].cells[colIndex];
        this.renderer.setStyle(cell, 'width', `${width}px`);
      }
    }
  }

  private onMouseUp = () => {
    this.isResizing = false;
    this.renderer.removeClass(document.body, 'resizing');
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }
}
