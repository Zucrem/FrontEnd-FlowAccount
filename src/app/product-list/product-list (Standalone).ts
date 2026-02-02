import { Component, signal, computed, ChangeDetectorRef, Signal } from '@angular/core';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

import { Product } from '../model/product.model';

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
  productList = signal<Product[]>([
    {
      id : 1,
      sku: "FOOD001",
      name: "ข้าวผัดหมู",
      category: "อาหาร",
      price: 45,
      stock: 20,
      createdAt: new Date(),
    },
    {
      id : 2,
      sku: "FOOD002",
      name: "ข้าวผัดไก่",
      category: "อาหาร",
      price: 45,
      stock: 20,
      createdAt: new Date(),
    },
    {
      id : 3,
      sku: "CLOTH001",
      name: "เสื้อ",
      category: "เสื้อผ้า",
      price: 45,
      stock: 20,
      createdAt: new Date(),
    },
    {
      id : 4,
      sku: "CLOTH002",
      name: "กางเกง",
      category: "เสื้อผ้า",
      price: 45,
      stock: 20,
      createdAt: new Date(),
    },
    {
      id : 5,
      sku: "ITEM001",
      name: "แก้วน้ำ",
      category: "ของใช้",
      price: 45,
      stock: 20,
      createdAt: new Date(),
    },
    {
      id : 6,
      sku: "ITEM002",
      name: "ปากกา",
      category: "ของใช้",
      price: 45,
      stock: 20,
      createdAt: new Date(),
    },
    {
      id : 7,
      sku: "DRINK001",
      name: "น้ำเปล่า",
      category: "เครื่องดื่ม",
      price: 45,
      stock: 20,
      createdAt: new Date(),
    },
    {
      id : 8,
      sku: "DRINK002",
      name: "โซดา",
      category: "เครื่องดื่ม",
      price: 45,
      stock: 20,
      createdAt: new Date(),
    }
  ]);

  
  
  selectedCategory = signal<string>('All');
  selectedProduct !: Product;
  statusTitle = '';
  statusMessage = '';
  statusClass = '';
  statusBtnClass = '';

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      id: [{value:'', disabled:true}],
      sku: ['', [Validators.required, this.duplicateSkuValidator()]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(1)]]
    });
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


  sell(sku:string){
    this.productList.update(list => 
      list.map(e => 
        e.sku == sku && e.stock > 0 ? {...e, stock:e.stock - 1} : e
      ))
      
      const toastEl = document.getElementById('sellToast');
        new bootstrap.Toast(toastEl).show();
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

    this.productList.update(list =>
      list = [...list,prod]
    )

    // close form modal
    const formModalEl = document.getElementById('productFormModal');
    bootstrap.Modal.getInstance(formModalEl)?.hide();
    // open success modal
    this.openStatusModal(true, "เพิ่มสินค้าสำเร็จ")
  }

  duplicateSkuValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const exists = this.productList().some(p => p.sku === value);
      return exists ? { duplicateSku: true } : null;
    };
  }
}
