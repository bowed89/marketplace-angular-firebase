import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Api } from '../config';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private api:string = Api.url;

  constructor(
    private http: HttpClient
  ) { }

  getData() {

    return this.http.get(`${this.api}products.json`);

  }

  getLimitData(startAt:string, limitTofirst:number) {

    return this.http.get(`${this.api}products.json?orderBy="$key"&startAt="${startAt}"&limitToFirst=${limitTofirst}&print=pretty`)

  }

  getFilterData(orderBy:string, equalTo:string) {

    return this.http.get(`${this.api}products.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`);

  }

  getFilterDataWithLimit(orderBy:string, equalTo:string, limitTofirst:number) {

    return this.http.get(`${this.api}products.json?orderBy="${orderBy}"&equalTo="${equalTo}"&limitToFirst=${limitTofirst}&print=pretty`);

  }

  getSearchData(orderBy:string, param:string) {
    
    return this.http.get(`${this.api}products.json?orderBy="${orderBy}"&startAt="${param}"&endAt="${param}\uf8ff"&print=pretty`);

  }

  patchData(id:string, value:object) {

    return this.http.patch(`${this.api}products/${id}.json`, value);

  }

}
