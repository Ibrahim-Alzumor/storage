import {Directive, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {ClearanceLevelService} from '../services/clearance-level.service';
import {AuthService} from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  private functionId: string = '';
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private clearanceLevelService: ClearanceLevelService,
    private authService: AuthService
  ) {
  }

  @Input() set appHasPermission(functionId: string) {
    this.functionId = functionId;
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (!this.functionId) {
      this.viewContainer.clear();
      this.hasView = false;
      return;
    }

    const clearanceLevel = this.authService.clearanceLevel;

    const hasPermission = this.clearanceLevelService.hasPermissionInProject(clearanceLevel, this.functionId)
    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

}
