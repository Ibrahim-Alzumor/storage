import {Injectable} from '@angular/core';
import {ClearanceLevelService} from './clearance-level.service';
import {FunctionPermission} from '../interfaces/clearance-level.interface';
import {ALL_FUNCTIONS} from '../constants/function-permissions';

@Injectable({
  providedIn: 'root'
})
export class FunctionInitializerService {
  constructor(private clearanceLevelService: ClearanceLevelService) {
  }

  initializeFunctions(): void {
    const functionPermissions: FunctionPermission[] = ALL_FUNCTIONS.map(functionId => {
      const parts = functionId.split(':');
      const category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const action = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);

      return {
        id: functionId,
        name: `${action} ${category}`,
        description: `Permission to ${parts[1]} ${parts[0]}s`,
        category: category
      };
    });

    this.clearanceLevelService.createFunctionsIfNotExist(functionPermissions).subscribe();
  }
}
