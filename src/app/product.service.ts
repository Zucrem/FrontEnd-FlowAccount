import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { Product } from './model/product.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private API_URL !: string ;

  constructor(private http: HttpClient, private appConfig: AppConfigService) {
    this.API_URL = this.appConfig.apiUrl
  }
  
  productList = signal<Product[]>([]);
  
  loadProducts() {
    this.http.get<Product[]>(this.API_URL)
      .subscribe({
        next: res => {
          this.productList.set(res)
        },
        error: err => {
          console.log(err)  
        }
      });
  }

  sellProduct( sku:string, qty: number ) : Observable<any>{
    return this.http.post(`${this.API_URL}/sell`,{
      id: sku,
      qty: qty
    }).pipe(
      tap(() => this.loadProducts())
    )
  }

  addProduct(data:Product) : Observable<Product>{
    return this.http.post<Product>(this.API_URL,{
      name:data.name,
      sku:data.sku,
      price:data.price,
      stock:data.stock,
      category:data.category
    }).pipe(
      tap(() => this.loadProducts())
    )
  }

}

