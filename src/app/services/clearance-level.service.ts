import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, firstValueFrom, Observable, of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../enviroments/enviroment';
import {ClearanceLevel, FunctionPermission} from '../interfaces/clearance-level.interface';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClearanceLevelService {
  private clearanceLevelsSubject = new BehaviorSubject<ClearanceLevel[]>([]);
  clearanceLevels$ = this.clearanceLevelsSubject.asObservable();
  private functionsSubject = new BehaviorSubject<FunctionPermission[]>([]);
  functions$ = this.functionsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFunctions();
    this.loadClearanceLevels();
  }

  getClearanceLevels(): Observable<ClearanceLevel[]> {
    return this.http
      .get<ClearanceLevel[]>(`${environment.apiUrl}/clearance-levels`)
      .pipe(
        tap(clearanceLevels => this.clearanceLevelsSubject.next(clearanceLevels)),
        catchError(err => {
          console.error('Error fetching clearance levels:', err);
          return of([]);
        })
      );
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

  getFunctions(): Observable<FunctionPermission[]> {
    return this.http.get<FunctionPermission[]>(`${environment.apiUrl}/clearance-levels/functions`).pipe(
      tap(functions => this.functionsSubject.next(functions)),
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


  hasPermissionNavigation(userClearanceLevel: number, functionId: string): Observable<boolean> {
    return this.http.get<ClearanceLevel[]>(`${environment.apiUrl}/clearance-levels`).pipe(
      map(levels => {
        const lvl = levels.find(l => l.level === userClearanceLevel);
        return lvl ? lvl.allowedFunctions.includes(functionId) : false;
      }),
      catchError(err => {
        console.error("Error fetching clearance‐levels:", err);
        return of(false);
      })
    );
  }

  hasPermissionInProject(userClearanceLevel: number, functionId: string): Observable<boolean> {
    return this.clearanceLevels$.pipe(
      map(levels => {
        const level = levels.find(l => l.level === userClearanceLevel);
        return level ? level.allowedFunctions.includes(functionId) : false;
      })
    );
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

  async checkPermission(userClearanceLevel: number, functionId: string): Promise<boolean> {
    return await firstValueFrom(this.hasPermissionNavigation(userClearanceLevel, functionId));
  }

  loadClearanceLevels(): void {
    this.getClearanceLevels().subscribe();
  }

  private loadFunctions(): void {
    this.getFunctions().subscribe();
  }
}
