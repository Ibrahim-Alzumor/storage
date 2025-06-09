import {Component, OnInit} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {ProductService} from '../../../services/product.service';
import {Router} from '@angular/router';
import {Product} from '../../../interfaces/product.interface';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '../../../services/auth.service';
import {NotificationService} from '../../../services/notification.service';
import {MatIcon} from '@angular/material/icon';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {Unit} from '../../../interfaces/unit.interface';
import {Category} from '../../../interfaces/category.interface';
import {UnitService} from '../../../services/unit.service';
import {CategoryService} from '../../../services/category.service';
import {ScrollingModule} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-product-add',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatIcon,
    MatSelect,
    MatOption,
    MatSelectModule,
    ScrollingModule
  ],
  templateUrl: './product-add.component.html',
  styleUrl: './product-add.component.css'
})
export class ProductAddComponent implements OnInit {
  productForm: FormGroup;
  productId: number | null = null;
  availableUnits: Unit[] = [];
  availableCategories: Category[] = [];
  newUnit: string = '';
  newCategory: string = '';
  unitDialogOpen = false;
  categoryDialogOpen = false;
  editUnitDialogOpen = false;
  editCategoryDialogOpen = false;
  selectedUnitForEdit: Unit | null = null;
  selectedCategoryForEdit: Category | null = null;
  updatedUnitName: string = '';
  updatedCategoryName: string = '';
  imageControls: FormControl[] = [];


  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private notificationService: NotificationService,
    private unitService: UnitService,
    private categoryService: CategoryService
  ) {
    this.imageControls = [new FormControl('')];
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      unitId: ['', Validators.required],
      categoryId: ['', Validators.required],
      images: this.fb.array([this.imageControls[0]]),
      description: ['', Validators.required],
    })
  }

  get imagesFormArray(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  ngOnInit() {
    this.loadAvailableOptions();
    this.authService.isLoggedIn();
  }

  trackById = (_: number, item: { id: string | number }) => item.id

  loadAvailableOptions() {
    this.availableCategories = this.categoryService.categories
    this.availableUnits = this.unitService.units;
  }

  addImageField(): void {
    if (this.imageControls.length >= 5) {
      this.notificationService.showNotification('Maximum 5 images allowed', 'warning');
      return;
    }

    const newControl = new FormControl('');
    this.imageControls.push(newControl);
    this.imagesFormArray.push(newControl);
  }

  removeImageField(index: number): void {
    if (index <= 0 || index >= this.imageControls.length) return;

    this.imageControls.splice(index, 1);
    this.imagesFormArray.removeAt(index);
  }

  onSubmit(): void {
    if (!this.productForm.valid) {
      this.notificationService.showNotification('Not valid product form', 'error');
      return;
    }

    const imageUrls = this.imageControls
      .map(control => control.value)
      .filter(url => url && url.trim() !== '');

    const formValue = this.productForm.value;

    const selectedCategory = this.availableCategories.find(c => c.id === formValue.categoryId) ||
      {id: formValue.categoryId, name: 'Unknown Category'};

    const selectedUnit = this.availableUnits.find(u => u.id === formValue.unitId) ||
      {id: formValue.unitId, name: 'Unknown Unit'};

    const product: Product = {
      id: this.productId || 0,
      name: formValue.name,
      stock: formValue.stock,
      unit: selectedUnit,
      category: selectedCategory,
      description: formValue.description,
      images: imageUrls,
      barcode: ''
    };

    this.productService.create(product).subscribe({
      next: () => {
        this.notificationService.showNotification('Product Added!', 'success');
        this.router.navigate(['/']);
      },
      error: err => this.notificationService.showNotification(err.error?.message || 'Error adding product', 'error'),
    });
  }


  addNewUnit(): void {
    if (!this.newUnit || this.newUnit.trim() === '') {
      this.notificationService.showNotification('Unit name cannot be empty', 'error');
      return;
    }

    if (this.availableUnits.some(unit => unit.name === this.newUnit)) {
      this.notificationService.showNotification('Unit already exists', 'warning');
      return;
    }

    this.unitService.addUnit(this.newUnit).subscribe({
      next: (response) => {
        this.availableUnits.push(response);
        this.productForm.get('unitId')?.setValue(response.id);
        this.newUnit = '';
        this.notificationService.showNotification('New unit added', 'success');
      },
      error: (error) => {
        console.error('Error adding unit:', error);
        this.notificationService.showNotification(`Failed to add new unit: ${error.message || 'Unknown error'}`, 'error');
      }
    });
  }

  addNewCategory(): void {
    if (!this.newCategory || this.newCategory.trim() === '') {
      this.notificationService.showNotification('Category name cannot be empty', 'error');
      return;
    }

    if (this.availableCategories.some(category => category.name === this.newCategory)) {
      this.notificationService.showNotification('Category already exists', 'warning');
      return;
    }

    this.categoryService.addCategory(this.newCategory).subscribe({
      next: (response) => {
        this.availableCategories.push(response);
        this.productForm.get('categoryId')?.setValue(response.id);
        this.newCategory = '';
        this.notificationService.showNotification('New category added', 'success');
      },
      error: (error) => {
        console.error('Error adding category:', error);
        this.notificationService.showNotification(`Failed to add new category: ${error.message || 'Unknown error'}`, 'error');
      }
    });
  }

  openEditUnitDialog(unit: Unit, event: Event): void {
    event.stopPropagation();
    this.selectedUnitForEdit = unit;
    this.updatedUnitName = unit.name;
    this.editUnitDialogOpen = true;
  }

  openEditCategoryDialog(category: Category, event: Event): void {
    event.stopPropagation();
    this.selectedCategoryForEdit = category;
    this.updatedCategoryName = category.name;
    this.editCategoryDialogOpen = true;
  }

  updateUnit(): void {
    if (!this.selectedUnitForEdit) return;
    if (!this.updatedUnitName || this.updatedUnitName.trim() === '') {
      this.notificationService.showNotification('Unit name cannot be empty', 'error');
      return;
    }

    if (this.availableUnits.some(unit => unit.name === this.updatedUnitName && unit.id !== this.selectedUnitForEdit?.id)) {
      this.notificationService.showNotification('Unit with this name already exists', 'warning');
      return;
    }

    this.unitService.updateUnit(this.selectedUnitForEdit.id, {name: this.updatedUnitName}).subscribe({
      next: (updatedUnit) => {
        const index = this.availableUnits.findIndex(u => u.id === updatedUnit.id);
        if (index !== -1) {
          this.availableUnits[index] = updatedUnit;
        }
        this.editUnitDialogOpen = false;
        this.selectedUnitForEdit = null;
        this.notificationService.showNotification('Unit updated successfully', 'success');
      },
      error: (error) => {
        console.error('Error updating unit:', error);
        this.notificationService.showNotification(`Failed to update unit: ${error.message || 'Unknown error'}`, 'error');
      }
    });
  }

  updateCategory(): void {
    if (!this.selectedCategoryForEdit) return;
    if (!this.updatedCategoryName || this.updatedCategoryName.trim() === '') {
      this.notificationService.showNotification('Category name cannot be empty', 'error');
      return;
    }

    if (this.availableCategories.some(category =>
      category.name === this.updatedCategoryName &&
      category.id !== this.selectedCategoryForEdit?.id)) {
      this.notificationService.showNotification('Category with this name already exists', 'warning');
      return;
    }

    this.categoryService.updateCategory(this.selectedCategoryForEdit.id, {name: this.updatedCategoryName}).subscribe({
      next: (updatedCategory) => {
        const index = this.availableCategories.findIndex(c => c.id === updatedCategory.id);
        if (index !== -1) {
          this.availableCategories[index] = updatedCategory;
        }
        this.editCategoryDialogOpen = false;
        this.selectedCategoryForEdit = null;
        this.notificationService.showNotification('Category updated successfully', 'success');
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.notificationService.showNotification(`Failed to update category: ${error.message || 'Unknown error'}`, 'error');
      }
    });
  }

  deleteUnit(unitId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      this.unitService.deleteUnit(unitId).subscribe({
        next: () => {
          this.availableUnits = this.availableUnits.filter(unit => unit.id !== unitId);
          if (this.productForm.get('unitId')?.value === unitId) {
            this.productForm.get('unitId')?.setValue('');
          }
          this.notificationService.showNotification('Unit deleted successfully', 'success');
        },
        error: (error) => {
          console.error('Error deleting unit:', error);
          this.notificationService.showNotification(`Failed to delete unit: ${error.message || 'Unknown error'}`, 'error');
        }
      });
    }
  }

  deleteCategory(categoryId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          this.availableCategories = this.availableCategories.filter(category => category.id !== categoryId);
          if (this.productForm.get('categoryId')?.value === categoryId) {
            this.productForm.get('categoryId')?.setValue('');
          }
          this.notificationService.showNotification('Category deleted successfully', 'success');
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.notificationService.showNotification(`Failed to delete category: ${error.message || 'Unknown error'}`, 'error');
        }
      });
    }
  }

  getUnitNameById(unitId: string): string {
    if (!unitId) return '';
    const unit = this.availableUnits.find(u => u.id === unitId);
    return unit ? unit.name : '';
  }

  getCategoryNameById(categoryId: string): string {
    if (!categoryId) return '';
    const category = this.availableCategories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }
}
