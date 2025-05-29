import {Directive, ElementRef, OnDestroy, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[resizableColumn]',
  standalone: true
})
export class ResizableColumnDirective implements OnInit, OnDestroy {
  private table: HTMLTableElement | null = null;
  private isResizing = false;
  private startX: number = 0;
  private startWidth: number = 0;
  private columnIndex: number = -1;
  private resizer: HTMLElement | null = null;
  private columnWidths: number[] = [];
  private tableWidth: number = 0;
  private maxColumnWidth: number = 0;
  private resizerListener: (() => void) | undefined;
  private mouseMoveUnlisten?: () => void;
  private mouseUpUnlisten?: () => void;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit() {
    this.table = this.el.nativeElement.closest('table');
    this.createResizer();
  }

  ngOnDestroy() {
    if (this.resizerListener) {
      this.resizerListener();
    }
    if (this.mouseMoveUnlisten) {
      this.mouseMoveUnlisten();
    }
    if (this.mouseUpUnlisten) {
      this.mouseUpUnlisten();
    }
  }

  private createResizer() {
    this.resizer = this.renderer.createElement('div');
    this.renderer.addClass(this.resizer, 'resizer');
    this.renderer.appendChild(this.el.nativeElement, this.resizer);

    if (this.resizer) {
      this.resizerListener = this.renderer.listen(
        this.resizer,
        'mousedown',
        this.onResizerMouseDown.bind(this)
      );
    }
  }

  private onResizerMouseDown(event: MouseEvent) {
    try {
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

      this.mouseMoveUnlisten = this.renderer.listen('document', 'mousemove', this.onMouseMove);
      this.mouseUpUnlisten = this.renderer.listen('document', 'mouseup', this.onMouseUp);
    } catch (error) {
      console.error('Error in onResizerMouseDown:', error);
      this.cleanupResizing();
    }
  }


  private onMouseMove = (event: MouseEvent) => {
    try {
      if (!this.isResizing || !this.table) return;

      const diffX = event.pageX - this.startX;

      const {availableSpace, resizableColumns} = this.calculateAvailableSpaceAndColumns();

      if (diffX > 0 && resizableColumns.length === 0) {
        return;
      }

      const calculatedMaxWidth = this.columnWidths[this.columnIndex] + availableSpace;
      const effectiveMaxWidth = Math.min(this.maxColumnWidth, calculatedMaxWidth);

      let newWidth = Math.min(
        effectiveMaxWidth,
        Math.max(120, this.startWidth + diffX)
      );

      if (newWidth <= this.startWidth) {
        this.applyColumnWidth(this.columnIndex, newWidth);
        return;
      }

      const widthIncrease = newWidth - this.columnWidths[this.columnIndex];
      if (widthIncrease <= 0) return;

      this.applyProportionalResize(newWidth, widthIncrease, resizableColumns);
    } catch (error) {
      console.error('Error in onMouseMove:', error);
      this.cleanupResizing();
    }
  }


  private calculateAvailableSpaceAndColumns(): { availableSpace: number, resizableColumns: number[] } {
    if (!this.table) return {availableSpace: 0, resizableColumns: []};

    const headerRow = this.table.querySelector('tr');
    if (!headerRow) return {availableSpace: 0, resizableColumns: []};

    const columns = headerRow.querySelectorAll('th');
    const resizableColumns: number[] = [];
    let totalMinWidth = 0;
    let totalCurrentWidth = 0;

    columns.forEach((col, idx) => {
      const currentWidth = this.columnWidths[idx];

      if (idx !== this.columnIndex) {
        if (currentWidth > 120) {
          resizableColumns.push(idx);
        }
        totalMinWidth += 120;
      } else {
        totalMinWidth += 120;
      }

      totalCurrentWidth += currentWidth;
    });

    const availableSpace = totalCurrentWidth - totalMinWidth;

    return {availableSpace, resizableColumns};
  }

  private applyProportionalResize(newCurrentColumnWidth: number, widthIncrease: number, resizableColumns: number[]) {
    if (!this.table) return;

    const headerRow = this.table.querySelector('tr');
    if (!headerRow) return;

    const columns = headerRow.querySelectorAll('th');
    if (columns.length <= 1) return;

    this.applyColumnWidth(this.columnIndex, newCurrentColumnWidth);

    if (resizableColumns.length === 0) return;

    let totalResizableWidth = 0;
    resizableColumns.forEach(idx => {
      totalResizableWidth += this.columnWidths[idx];
    });

    if (totalResizableWidth === 0) return;

    resizableColumns.forEach(idx => {
      const proportion = this.columnWidths[idx] / totalResizableWidth;
      const reduction = widthIncrease * proportion;
      const currentWidth = this.columnWidths[idx];

      const newWidth = Math.max(120, currentWidth - reduction);

      this.applyColumnWidth(idx, newWidth);
    });
  }

  private applyColumnWidth(colIndex: number, width: number) {
    if (!this.table) return;

    const rows = this.table.rows;
    for (let i = 0; i < rows.length; i++) {
      if (colIndex < rows[i].cells.length) {
        const cell = rows[i].cells[colIndex];
        this.renderer.setStyle(cell, 'width', `${width}px`);
        this.renderer.setStyle(cell, 'white-space', 'normal');
        this.renderer.setStyle(cell, 'word-wrap', 'break-word');
        this.renderer.setStyle(cell, 'overflow-wrap', 'break-word');
      }
    }
  }

  private onMouseUp = () => {
    try {
      this.cleanupResizing();

      if (this.table) {
        const headerRow = this.table.querySelector('tr');
        if (headerRow) {
          const columns = headerRow.querySelectorAll('th');
          this.columnWidths = Array.from(columns).map(col => col.offsetWidth);
        }
      }
    } catch (error) {
      console.error('Error in onMouseUp:', error);
      this.cleanupResizing();
    }
  }

  private cleanupResizing() {
    this.isResizing = false;
    this.renderer.removeClass(document.body, 'resizing');

    if (this.mouseMoveUnlisten) {
      this.mouseMoveUnlisten();
      this.mouseMoveUnlisten = undefined;
    }

    if (this.mouseUpUnlisten) {
      this.mouseUpUnlisten();
      this.mouseUpUnlisten = undefined;
    }
  }

}
