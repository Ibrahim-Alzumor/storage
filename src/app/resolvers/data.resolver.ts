import {Injectable} from '@angular/core';
import {ClearanceLevelService} from '../services/clearance-level.service';
import {CategoryService} from '../services/category.service';
import {UnitService} from '../services/unit.service';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataResolver implements Resolve<any> {

  constructor(private clearanceLevelService: ClearanceLevelService,
              private categoryService: CategoryService,
              private unitService: UnitService,) {
  }

  async resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<any> {
    await firstValueFrom(this.clearanceLevelService.getFunctions());
    await firstValueFrom(this.categoryService.getCategories());
    await firstValueFrom(this.unitService.getUnits());
    return Promise.resolve(true);
  }
}
