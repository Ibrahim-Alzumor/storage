import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ClearanceLevelService} from '../../services/clearance-level.service';
import {ClearanceLevel, FunctionPermission} from '../../interfaces/clearance-level.interface';
import {map, Observable} from 'rxjs';

@Component({
  selector: 'app-clearance-level',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clearance-level.component.html',
  styleUrl: './clearance-level.component.css'
})
export class ClearanceLevelComponent implements OnInit {
  clearanceLevels$: Observable<ClearanceLevel[]>;
  functions$: Observable<FunctionPermission[]>;
  creatingNewLevel = false;

  clearanceLevelForm: FormGroup;
  selectedLevel: ClearanceLevel | null = null;

  constructor(
    private clearanceLevelService: ClearanceLevelService,
    private fb: FormBuilder
  ) {
    this.clearanceLevels$ = this.clearanceLevelService.clearanceLevels$;
    this.functions$ = this.clearanceLevelService.functions$;

    this.clearanceLevelForm = this.fb.group({
      level: ['', [Validators.required, Validators.min(0)]],
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.clearanceLevelService.getClearanceLevels().subscribe();
    this.clearanceLevelService.getFunctions().subscribe();

    this.clearanceLevels$ = this.clearanceLevelService.clearanceLevels$.pipe(
      map(levels => [...levels].sort((a, b) => b.level - a.level))
    );
  }

  selectLevel(level: ClearanceLevel): void {
    this.selectedLevel = level;
    this.clearanceLevelForm.patchValue({
      level: level.level,
      name: level.name,
      description: level.description || ''
    });
  }

  cancelEdit(): void {
    this.selectedLevel = null;
    this.creatingNewLevel = false;
    this.clearanceLevelForm.reset();
  }

  createNewLevel(): void {
    this.creatingNewLevel = true;
    this.selectedLevel = null;
    this.clearanceLevelForm.reset({
      level: '',
      name: '',
      description: ''
    });
  }

  saveLevel(): void {
    if (this.clearanceLevelForm.invalid) {
      return;
    }

    const formValue = this.clearanceLevelForm.value;
    const clearanceLevel: ClearanceLevel = {
      level: formValue.level,
      name: formValue.name,
      description: formValue.description,
      allowedFunctions: this.selectedLevel ? [...this.selectedLevel.allowedFunctions] : []
    };

    if (this.selectedLevel) {
      this.clearanceLevelService.updateClearanceLevel(this.selectedLevel.level, clearanceLevel)
        .subscribe({
          next: () => {
            this.selectedLevel = null;
            this.clearanceLevelForm.reset();
            this.creatingNewLevel = false;
          },
          error: (error) => console.error('Error updating clearance level', error)
        });
    } else {
      this.clearanceLevelService.createClearanceLevel(clearanceLevel)
        .subscribe({
          next: () => {
            this.clearanceLevelForm.reset();
          },
          error: (error) => console.error('Error creating clearance level', error)
        });
    }
  }

  deleteLevel(level: number): void {
    if (confirm(`Are you sure you want to delete clearance level ${level}?`)) {
      this.clearanceLevelService.deleteClearanceLevel(level)
        .subscribe({
          error: (error) => console.error('Error deleting clearance level', error)
        });
    }
  }

  toggleFunction(level: ClearanceLevel, functionId: string, isChecked: boolean): void {
    if (isChecked) {
      this.clearanceLevelService.addFunctionToClearanceLevel(level.level, functionId)
        .subscribe({
          error: (error) => console.error('Error adding function to clearance level', error)
        });
    } else {
      this.clearanceLevelService.removeFunctionFromClearanceLevel(level.level, functionId)
        .subscribe({
          error: (error) => console.error('Error removing function from clearance level', error)
        });
    }
  }

  isFunctionAllowed(level: ClearanceLevel, functionId: string): boolean {
    return level.allowedFunctions.includes(functionId);
  }

  groupFunctionsByCategory(functions: FunctionPermission[] | null): (FunctionPermission & {
    isFirstInCategory: boolean
  })[] {
    if (!functions) return [];

    const sortedFunctions = [...functions].sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return 0;
    });

    let lastCategory: string | null = null;

    return sortedFunctions.map(func => {
      const isFirstInCategory = func.category !== lastCategory;
      lastCategory = func.category;
      return {
        ...func,
        isFirstInCategory
      };
    });
  }
}
