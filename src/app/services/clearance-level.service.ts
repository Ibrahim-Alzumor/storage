import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../enviroments/enviroment';
import {ClearanceLevel, FunctionPermission} from '../interfaces/clearance-level.interface';

@Injectable({
  providedIn: 'root'
})
export class ClearanceLevelService {
  functions: FunctionPermission[] = [];
  clearanceLevels: ClearanceLevel[] = [];
  private clearanceLevelsKey = 'clearance_levels';
  private clearanceLevelsSubject = new BehaviorSubject<ClearanceLevel[]>([]);
  private functionsSubject = new BehaviorSubject<FunctionPermission[]>([]);

  constructor(private http: HttpClient) {
  }

  get clearanceCache(): ClearanceLevel[] {
    const raw = localStorage.getItem(this.clearanceLevelsKey);
    return raw ? (JSON.parse(raw) as ClearanceLevel[]) : [];
  }

  createClearanceLevel(clearanceLevel: ClearanceLevel): Observable<ClearanceLevel> {
    return this.http.post<ClearanceLevel>(`${environment.apiUrl}/clearance-levels`, clearanceLevel).pipe(
      tap(() => this.loadClearanceLevels())
    );
  }

  updateClearanceLevel(level: number, clearanceLevel: Partial<ClearanceLevel>): Observable<ClearanceLevel> {
    return this.http.put<ClearanceLevel>(`${environment.apiUrl}/clearance-levels/${level}`, clearanceLevel).pipe(
      tap(() => this.loadClearanceLevels())
    );
  }

  deleteClearanceLevel(level: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/clearance-levels/${level}`).pipe(
      tap(() => this.loadClearanceLevels())
    );
  }

  getClearanceLevels(): Observable<ClearanceLevel[]> {
    return this.http
      .get<ClearanceLevel[]>(`${environment.apiUrl}/clearance-levels`)
      .pipe(
        tap(clearanceLevels => {
          this.clearanceLevelsSubject.next(clearanceLevels);
        }),
        map(clearanceLevels =>
          this.clearanceLevels = clearanceLevels,
        ),
        catchError(err => {
          console.error('Error fetching clearance levels:', err);
          return of([]);
        })
      );
  }

  getFunctions(): Observable<FunctionPermission[]> {
    return this.http.get<FunctionPermission[]>(`${environment.apiUrl}/clearance-levels/functions`).pipe(
      tap(functions => this.functionsSubject.next(functions)),
      map(functions =>
        this.functions = functions,
      ),
      catchError(error => {
        console.error('Error fetching functions', error);
        return of([]);
      })
    );
  }

  createFunctionsIfNotExist(functions: FunctionPermission[]): Observable<any> {
    return this.getFunctions().pipe(
      switchMap(existingFunctions => {
        const existingIds = existingFunctions.map(f => f.id);
        const newFunctions = functions.filter(f => !existingIds.includes(f.id));

        if (newFunctions.length === 0) {
          return of([]);
        }

        return this.http.post<FunctionPermission[]>(
          `${environment.apiUrl}/clearance-levels/functions/batch`,
          newFunctions
        ).pipe(
          tap(() => this.loadFunctions())
        );
      }),
      catchError(error => {
        console.error('Error creating functions', error);
        return of([]);
      })
    );
  }

  public getClearanceLevelsValue(): ClearanceLevel[] {
    return this.clearanceLevelsSubject.getValue();
  }

  hasPermissionInProject(userClearanceLevel: number, functionId: string): boolean {
    const clearanceLevels = this.clearanceCache;
    for (const level of clearanceLevels) {
      if (level.level === userClearanceLevel && level.allowedFunctions.includes(functionId)) {
        return true;
      }
    }
    return false;
  }

  addFunctionToClearanceLevel(level: number, functionId: string): Observable<ClearanceLevel> {
    return this.http.post<ClearanceLevel>(
      `${environment.apiUrl}/clearance-levels/${level}/functions/${functionId}`, {}
    ).pipe(
      tap(() => this.loadClearanceLevels())
    );
  }

  removeFunctionFromClearanceLevel(level: number, functionId: string): Observable<ClearanceLevel> {
    return this.http.delete<ClearanceLevel>(
      `${environment.apiUrl}/clearance-levels/${level}/functions/${functionId}`
    ).pipe(
      tap(() => this.loadClearanceLevels())
    );
  }

  loadClearanceLevels(): void {
    this.getClearanceLevels().subscribe();
  }

  private loadFunctions(): void {
    this.getFunctions().subscribe();
  }
}
