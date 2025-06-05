import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of} from 'rxjs';
import {environment} from '../enviroments/enviroment';
import {catchError} from 'rxjs/operators';
import {Unit} from '../interfaces/unit.interface';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  public units: Unit[] = [];

  constructor(private http: HttpClient) {
    this.loadUnits();
  }

  getUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${environment.apiUrl}/units`).pipe(
      map(units => {
        this.units = units;
        return units;
      })
    );
  }

  addUnit(unitName: string): Observable<Unit> {
    return this.http.post<Unit>(`${environment.apiUrl}/units`, {name: unitName})
      .pipe(
        catchError(error => {
          if (error.status === 201) {
            return of({id: '', name: unitName} as Unit);
          }
          throw error;
        }),
        map(unit => {
          this.units.push(unit);
          return unit;
        })
      );
  }

  updateUnit(id: string, dto: { name: string }): Observable<Unit> {
    return this.http.patch<Unit>(`${environment.apiUrl}/units/${id}`, dto).pipe(
      map(unit => {
        const index = this.units.findIndex(u => u.id === id);
        if (index !== -1) {
          this.units[index] = unit;
        }
        return unit;
      })
    );
  }

  deleteUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/units/${id}`).pipe(
      map(response => {
        this.units = this.units.filter(u => u.id !== id);
        return response;
      })
    );
  }

  getUnitById(id: string): Unit | undefined {
    return this.units.find(u => u.id === id);
  }

  loadUnits() {
    this.getUnits().subscribe(units => {
      this.units = units;
    });
  }
}
