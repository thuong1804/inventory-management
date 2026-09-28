# Frontend Update — Sales Buyer Information

## 1. Database structure change

The `public.sales` table now has 3 additional nullable text fields:

```sql
buyer_name text,
buyer_phone text,
buyer_address text
```

These fields belong to a **SALE TRANSACTION**, not to a product.

Important:
- Do NOT add these fields to `products`.
- Do NOT add these fields to `imports`.
- They belong only to `sales`.
- All 3 fields are optional.
- No validation, UNIQUE constraint, or NOT NULL constraint is required.
- They can contain plain text.

Current `sales` structure:

```text
sales
├── id
├── import_id
├── user_id
├── quantity
├── selling_price
├── buyer_name       ← NEW
├── buyer_phone      ← NEW
├── buyer_address    ← NEW
├── sold_at
├── created_at
└── updated_at
```

---

## 2. `create_sale()` RPC has changed

The Supabase RPC function `public.create_sale()` now accepts:

```text
create_sale(
  p_import_id,
  p_quantity,
  p_selling_price,
  p_sold_at,
  p_buyer_name,
  p_buyer_phone,
  p_buyer_address
)
```

The new parameters are:

```text
p_buyer_name
p_buyer_phone
p_buyer_address
```

All three are optional and default to `NULL`.

Frontend must NOT insert directly into `sales` when creating a sale.

Use:

```ts
const { data, error } = await supabase.rpc('create_sale', {
  p_import_id: importId,
  p_quantity: quantity,
  p_selling_price: sellingPrice,
  p_buyer_name: buyerName || null,
  p_buyer_phone: buyerPhone || null,
  p_buyer_address: buyerAddress || null,
});
```

The RPC remains responsible for:
- authentication check
- checking import ownership
- checking remaining quantity
- preventing sale quantity from exceeding available stock
- inserting the sale

Do not move these validations to frontend as the source of truth.

---

## 3. `sales_detail` view has changed

The `public.sales_detail` view now exposes:

```text
buyer_name
buyer_phone
buyer_address
```

The frontend type should include:

```ts
type SalesDetail = {
  id: string;
  import_id: string;
  user_id: string;

  quantity: number;
  selling_price: number;

  buyer_name: string | null;
  buyer_phone: string | null;
  buyer_address: string | null;

  sold_at: string;
  created_at: string;
  updated_at: string;

  product_id: string;
  product_name: string;
  sku: string;

  cost_price: number;
  revenue: number;
  cost: number;
  profit: number;
};
```

Important:
- Buyer fields are nullable.
- The user may create a sale without entering buyer information.
- If a field is `NULL`, the frontend should handle it safely.

---

## 4. Sale form UI

Update the existing Sale form to include these optional fields:

```text
Buyer name
[________________________]

Buyer phone
[________________________]

Buyer address
[________________________]
```

Recommended form values:

```ts
buyerName: string;
buyerPhone: string;
buyerAddress: string;
```

When submitting:

```ts
buyerName: buyerName || null,
buyerPhone: buyerPhone || null,
buyerAddress: buyerAddress || null,
```

No frontend validation is required for these 3 fields.

---

## 5. Sale list / history

When displaying sales from `sales_detail`, the frontend can show:

```text
Product
Quantity
Selling price
Buyer name
Buyer phone
Buyer address
Sold at
Revenue
Cost
Profit
```

If a buyer field is `NULL`, display `-` or an empty value.

Do not assume the buyer fields always have values.

---

## 6. Existing product/import logic

Do NOT modify the following because of this buyer-information change:

```text
products
imports
product_inventory
inventory calculation
dashboard calculation
```

Buyer information is only related to sales.

Inventory calculation remains:

```text
total imported - total sold = remaining quantity
```

---

## 7. Architecture / data flow

### Create sale

```text
Frontend Sale Form
        ↓
Sale Service
        ↓
Supabase RPC: create_sale()
        ↓
sales table
```

### Read sales

```text
sales table
        ↓
sales_detail view
        ↓
Sale Service
        ↓
Frontend Sale List
```

---

## 8. Important architecture rules

### Rule 1 — Do not directly insert sales from frontend

Do NOT do:

```ts
supabase
  .from('sales')
  .insert(...)
```

For creating a sale, always use:

```ts
supabase.rpc('create_sale', ...)
```

### Rule 2 — Do not calculate remaining stock as the source of truth in frontend

The frontend may display remaining stock, but the authoritative check is inside `create_sale()`.

The RPC prevents:

```text
requested quantity > remaining quantity
```

### Rule 3 — Do not add buyer fields to Product

Incorrect:

```ts
Product {
  buyerName
  buyerPhone
  buyerAddress
}
```

Correct:

```ts
Sale {
  buyerName
  buyerPhone
  buyerAddress
}
```

### Rule 4 — Keep existing UI architecture

Update the existing frontend without unnecessarily rewriting the application structure or existing UI.

The current mock-data replacement architecture should remain.

---

## 9. Summary of required frontend changes

Implement these changes in order:

### Step 1 — Types

Update the sale / `SalesDetail` TypeScript type:

```ts
buyer_name: string | null;
buyer_phone: string | null;
buyer_address: string | null;
```

If the project uses camelCase frontend models, map them consistently:

```ts
buyerName
buyerPhone
buyerAddress
```

while keeping the Supabase column names:

```text
buyer_name
buyer_phone
buyer_address
```

### Step 2 — Sale service

Update the sale creation method to call:

```ts
supabase.rpc('create_sale', {
  p_import_id: importId,
  p_quantity: quantity,
  p_selling_price: sellingPrice,
  p_buyer_name: buyerName || null,
  p_buyer_phone: buyerPhone || null,
  p_buyer_address: buyerAddress || null,
});
```

### Step 3 — Sale form

Add optional inputs:

```text
Buyer name
Buyer phone
Buyer address
```

### Step 4 — Sale list/history

Read the 3 new fields from `sales_detail` and display them where appropriate.

### Step 5 — Test

Test the following cases:

1. Create sale without buyer information.
2. Create sale with buyer name only.
3. Create sale with name + phone + address.
4. Verify the sale appears in `sales_detail`.
5. Verify buyer information is displayed correctly.
6. Verify remaining inventory still works.
7. Verify selling more than remaining quantity is rejected by `create_sale()`.

---

## 10. Final expected result

A sale should now contain:

```text
Product
Quantity
Selling price
Buyer name       (optional)
Buyer phone      (optional)
Buyer address    (optional)
Sold at
```

The database remains the source of truth for sales and inventory validation.
