import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Product} from '../interfaces/product.interface';
import {map, Observable} from 'rxjs';
import {environment} from '../enviroments/enviroment';
import {CategoryService} from './category.service';
import {UnitService} from './unit.service';
import {PaginationResult} from '../interfaces/pagination-result.interface';
import {NotificationService} from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(
    private http: HttpClient,
    private categoryService: CategoryService,
    private unitService: UnitService,
    private notificationService: NotificationService
  ) {
  }

  getAll(
    page: number,
    limit: number
  ): Observable<PaginationResult<Product>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    return this.http.get<{
      items: any[];
      total: number;
      page: number;
      limit: number
    }>(`${environment.apiUrl}/products`, {params})
      .pipe(
        map((response) => {
          return {
            items: this.filter(response.items),
            total: response.total,
            page: response.page,
            limit: response.limit,
          };
        })
      );
  }

  findAllValidBarcodes(page: number, limit: number): Observable<{ items: Product[]; total: number }> {
    return this.http
      .get<{ items: any[]; total: number }>(`${environment.apiUrl}/products/find-barcodes`, {
        params: new HttpParams().set('page', page.toString()).set('limit', limit.toString())
      })
      .pipe(
        map(response => {
          return {
            items: this.filter(response.items),
            total: response.total
          }
        })
      );
  }

  filter(response: any) {
    const items = response.map((dto: any) => this.toProduct(dto)
    );
    return items.filter((item: any) => item !== null);
  }


  getByName(
    searchTerm: string,
    page: number,
    limit: number
  ): Observable<PaginationResult<Product>> {
    let params = new HttpParams()
      .set('name', searchTerm.trim())
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http
      .get<{ items: any[]; total: number; page: number; limit: number }>(
        `${environment.apiUrl}/products/search`,
        {params}
      )
      .pipe(
        map((response) => {
          return {
            items: this.filter(response.items),
            total: response.total,
            page: response.page,
            limit: response.limit,
          };
        })
      );
  }

  getOne(id: number): Observable<Product> {
    return this.http.get<any>(`${environment.apiUrl}/products/${id}`).pipe(
      map(dto => this.filter([dto]))
    );
  }

  create(product: Product): Observable<Product> {
    const productData = {
      id: product.id,
      name: product.name,
      stock: product.stock,
      categoryId: product.category.id,
      unitId: product.unit.id,
      images: product.images,
      description: product.description,
    };

    return this.http.post<any>(`${environment.apiUrl}/products`, productData).pipe(
      map(response => this.filter([response]))
    );
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    const updateData: any = {};

    if (product.id !== undefined) {
      updateData.id = product.id;
    }
    if (product.name !== undefined) {
      updateData.name = product.name;
    }
    if (product.stock !== undefined) {
      updateData.stock = product.stock;
    }
    if (product.category !== undefined) {
      updateData.categoryId = product.category.id;
    }
    if (product.unit !== undefined) {
      updateData.unitId = product.unit.id;
    }
    if (product.images !== undefined) {
      updateData.images = product.images;
    }
    if (product.description !== undefined) {
      updateData.description = product.description;
    }
    if (product.barcode !== undefined) {
      updateData.barcode = product.barcode;
    }
    return this.http.put<any>(`${environment.apiUrl}/products/${id}`, updateData).pipe(
      map(dto => this.filter([dto]))
    );
  }


  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`);
  }

  addBarcodeToProduct(id: number, barcodeId: string): Observable<Product> {
    return this.http.put<any>(`${environment.apiUrl}/products/${id}/barcode`, {barcodeId}).pipe(
      map(dto => this.filter([dto]))
    );
  }

  getByBarcode(barcodeId: string): Observable<Product> {
    return this.http.get<any>(`${environment.apiUrl}/products/by-barcode/${barcodeId}`).pipe(
      map(dto => this.filter([dto]))
    );
  }

  toProduct(dto: any): Product | null {
    try {
      const {id, name, stock, unitId, categoryId, images, description, barcode} = dto;

      const category = this.categoryService.getCategoryById(categoryId)

      const unit = this.unitService.getUnitById(unitId)

      return {id, name, stock, category, unit, images, description, barcode};
    } catch (error: any) {
      this.notificationService.showNotification(error, 'error');
      return null;
    }

  }
}
