import { Component, signal, computed, ChangeDetectorRef, Signal } from '@angular/core';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

import { Product } from '../model/product.model';
import { ProductService } from '../product.service';

declare var bootstrap: any;

@Component({
  selector: 'app-product-list',
  imports: [DatePipe, CurrencyPipe, NgClass, ReactiveFormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {

  productForm!: FormGroup;
  private refreshSub?: Subscription;
  productList!: Signal<Product[]>;
  
  selectedCategory = signal<string>('All');
  selectedProduct !: Product;
  statusTitle = '';
  statusMessage = '';
  statusClass = '';
  statusBtnClass = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      id: [{value:'', disabled:true}],
      sku: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(1)]]
    });

    this.productList = this.productService.productList;
  }

  totalProducts = computed(() =>
    this.filteredProducts().length
  );

  totalStock = computed(() => 
    this.filteredProducts().reduce((sum, p) => sum + p.stock, 0)
  );

  totalInventoryValue = computed(() =>
    this.filteredProducts().reduce((sum, p) => sum + (p.price * p.stock), 0)
  );

  outOfStock = computed(() =>
    this.filteredProducts().filter(p => p.stock === 0).length
  );

  categories = computed(() =>
    [...new Set(this.productList().map(p => p.category))]
  );

  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const products = this.productList();

    if (category === 'All') return products;

    // minimal recompute logic
    return products.filter(p => p.category === category);
  })
  
  // productList: Product[] = [
  //   {
  //     id : 1,
  //     sku: "WH-001-BLK",
  //     name: "Wireless Headphones",
  //     category: "Electronics",
  //     price: 9.9,
  //     stock: 245,
  //     createdAt: new Date(),
  //   },
  //   {
  //     id : 2,
  //     sku: "KB-102-RGB",
  //     name: "Mechanical Keyboard",
  //     category: "Electronics",
  //     price: 89.99,
  //     stock: 32,
  //     createdAt: new Date(),
  //   },
  //   {
  //     id : 3,
  //     sku: "MS-203-WHT",
  //     name: "Ergonomic Mouse",
  //     category: "Electronics",
  //     price: 89.99,
  //     stock: 0,
  //     createdAt: new Date(),
  //   },
  //   {
  //     id : 4,
  //     sku: "CH-405-BLK",
  //     name: "Office Chair",
  //     category: "Furniture",
  //     price: 299.99,
  //     stock: 18,
  //     createdAt: new Date(),
  //   }
  // ]

  ngOnInit(){
      this.productService.loadProducts();

      this.refreshSub = interval(10_000).subscribe(() => {
        this.productService.loadProducts();
      });
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  openForm(){
    this.productForm.patchValue({
      id : this.productList().length + 1 
    })

    const modalEl = document.getElementById('productFormModal');
    const modal = new bootstrap.Modal(modalEl);

    modalEl?.addEventListener('hidden.bs.modal', () => {
    this.resetForm();
  });

    modal.show();
  }

  openModal(product: Product) {
    this.selectedProduct = product;

    console.log(this.selectedProduct.createdAt)
    const modalEl = document.getElementById('productModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  openStatusModal(isSuccess: boolean, message: string) {
    this.statusTitle = isSuccess ? 'Success' : 'Error';
    this.statusMessage = message;
    this.statusBtnClass = isSuccess ? 'btn-success' : 'btn-danger';

    const modalEl = document.getElementById('statusModal');
    this.cdr.detectChanges();
    new bootstrap.Modal(modalEl).show();
  }


  sell(product:Product){
    this.productService.sellProduct(product.sku,1)
    .subscribe({
      next: res => {
        const toastEl = document.getElementById('sellToast');
        new bootstrap.Toast(toastEl).show();
      },
      error: err => {
        console.error(err)  
      }
    });
  }

  resetForm() {
    this.productForm.reset({
      id: { value: '', disabled: true },
      category: '',
      price: '',
      stock: '',
    });
  }

  submitForm(){
    const prod: Product = this.productForm.getRawValue();

    this.productService.addProduct(prod)
    .subscribe({
      next: () => {
        // close form modal
        const formModalEl = document.getElementById('productFormModal');
        bootstrap.Modal.getInstance(formModalEl)?.hide();

        // open success modal
        this.openStatusModal(true, "เพิ่มสินค้าสำเร็จ")
      },
      error: err => {
        let errlist:[] = err.error[0].error;
        this.openStatusModal(false, errlist.join(", "))
      }
    });
  }
}
