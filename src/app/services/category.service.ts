import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of} from 'rxjs';
import {environment} from '../enviroments/enviroment';
import {catchError} from 'rxjs/operators';
import {Category} from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  public categories: Category[] = [];

  constructor(private http: HttpClient) {
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`).pipe(
      map(categories => {
        this.categories = categories;
        return categories;
      })
    );
  }

  addCategory(categoryName: string): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/categories`, {name: categoryName})
      .pipe(
        catchError(error => {
          if (error.status === 201) {
            return of({id: '', name: categoryName} as Category);
          }
          throw error;
        }),
        map(category => {
          this.categories.push(category);
          return category;
        })
      );
  }

  updateCategory(id: string, dto: { name: string }): Observable<Category> {
    return this.http.patch<Category>(`${environment.apiUrl}/categories/${id}`, dto).pipe(
      map(category => {
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          this.categories[index] = category;
        }
        return category;
      })
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${id}`).pipe(
      map(response => {
        this.categories = this.categories.filter(c => c.id !== id);
        return response;
      })
    );
  }

  getCategoryById(id: string): Category {
    const res = this.categories.find(c => c.id === id);
    if (res) {
      return res;
    }

    throw new Error('Category not found');
  }
}
