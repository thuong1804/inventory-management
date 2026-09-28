# Frontend ↔ Supabase Integration Plan

## 1. Mục tiêu

Kết nối frontend Next.js hiện tại với Supabase PostgreSQL/Auth, thay thế mock data bằng dữ liệu thật.

### Database đã có

Tables:

- `categories`
- `products`
- `imports`
- `sales`
- `expenses`

Views:

- `product_inventory`
- `sales_detail`
- `dashboard_summary`

RPC:

- `create_sale(p_import_id, p_quantity, p_selling_price, p_sold_at)`

Security:

- Supabase Auth
- RLS theo `user_id`

### Nguyên tắc

- Không tạo lại database schema nếu không cần.
- Không thêm `stock_quantity` vào `products`.
- Không lưu các field tính toán như `revenue`, `profit`, `remaining_quantity` vào table gốc.
- Dùng Views cho dữ liệu đọc tổng hợp.
- Dùng RPC `create_sale()` khi tạo sale.
- Không bypass RLS từ frontend.
- Không đưa Supabase service-role key vào browser.
- Giữ UI/component hiện tại càng ít thay đổi càng tốt.
- Ưu tiên thay mock service bằng Supabase service, không viết lại toàn bộ UI.

---

# 2. Cài package

Trong project frontend:

```bash
yarn add @supabase/supabase-js @supabase/ssr
```

Nếu project dùng npm:

```bash
npm install @supabase/supabase-js @supabase/ssr
```
Đã cài rồi thì không cần cài lại
---

# 3. Environment variables

Tạo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Lấy values từ:

Supabase Dashboard → Project Settings → API

Không commit `.env.local`.

`.gitignore` phải có:

```gitignore
.env.local
.env*.local
```

### Không dùng trong frontend

Không đưa key dạng service role vào client:

```env
SUPABASE_SERVICE_ROLE_KEY=...
```

Frontend chỉ dùng publishable/anon key và để RLS bảo vệ dữ liệu.

---

# 4. Supabase browser client

Tạo:

```text
src/lib/supabase/client.ts
```

Nội dung:

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

Client này dùng cho Client Components.

Ví dụ:

```ts
'use client';

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const { data, error } = await supabase
  .from('product_inventory')
  .select('*');
```

---

# 5. Supabase server client

Tạo:

```text
src/lib/supabase/server.ts
```

Nội dung:

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write cookies.
            // Session refresh is handled by the request middleware/proxy.
          }
        },
      },
    }
  );
}
```

Server Components, Server Actions và server-side code nên dùng client này.

---

# 6. Auth session middleware

Mục tiêu:

- refresh Supabase Auth session khi cần;
- giữ cookie session;
- bảo vệ các route private.

Tạo:

```text
src/lib/supabase/proxy.ts
```

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register');

  const isPublicPage =
    pathname === '/' ||
    isAuthPage;

  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';

    return NextResponse.redirect(url);
  }

  return response;
}
```

---

# 7. Next.js middleware

Nếu project đang dùng Next.js 15, tạo:

```text
src/middleware.ts
```

```ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

Nếu project đã có `middleware.ts`, không tạo file thứ hai. Merge logic vào file hiện tại.

> Nếu project đã nâng lên Next.js 16 và đang dùng `proxy.ts` thay cho `middleware.ts`, giữ convention hiện tại của project và đổi tên entry file tương ứng.

---

# 8. Type definitions

Tạo:

```text
src/types/database.ts
```

Có thể bắt đầu với application types:

```ts
export type Category = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type Import = {
  id: string;
  product_id: string;
  quantity: number;
  cost_price: number;
  imported_at: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type Sale = {
  id: string;
  import_id: string;
  quantity: number;
  selling_price: number;
  sold_at: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type Expense = {
  id: string;
  name: string;
  category: string;
  amount: number;
  expense_date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type ProductInventory = {
  id: string;
  sku: string;
  name: string;
  category_name: string;
  total_imported: number;
  total_sold: number;
  remaining_quantity: number;
};

export type SalesDetail = {
  id: string;
  import_id: string;
  product_id: string;
  sku: string;
  product_name: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  total_cost: number;
  revenue: number;
  gross_profit: number;
  sold_at: string;
};

export type DashboardSummary = {
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  total_expenses: number;
  net_profit: number;
  total_products: number;
  total_imported: number;
  total_sold: number;
  remaining_stock: number;
};
```

---

# 9. Service layer

Giữ database logic tách khỏi UI.

Tạo:

```text
src/services/
├── category.service.ts
├── product.service.ts
├── import.service.ts
├── sale.service.ts
├── expense.service.ts
└── dashboard.service.ts
```

Nếu project đã có service architecture, giữ convention hiện tại.

---

# 10. Product service

`src/services/product.service.ts`

```ts
import { createClient } from '@/lib/supabase/client';
import type { ProductInventory } from '@/types/database';

export async function getProducts(): Promise<ProductInventory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('product_inventory')
    .select('*')
    .order('sku');

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
```

Frontend Products page có thể thay mock:

```ts
const products = await getProducts();
```

---

# 11. Category service

`src/services/category.service.ts`

```ts
import { createClient } from '@/lib/supabase/client';

export async function getCategories() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createCategory(name: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

RLS vẫn là lớp bảo vệ chính. `user_id` được lấy từ authenticated user, không lấy từ input của form.

---

# 12. Product CRUD

Khi tạo product:

```ts
export async function createProduct(input: {
  name: string;
  sku: string;
  categoryId: string;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      sku: input.sku,
      category_id: input.categoryId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

Update:

```ts
export async function updateProduct(
  id: string,
  input: {
    name: string;
    sku: string;
    categoryId: string;
  }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .update({
      name: input.name,
      sku: input.sku,
      category_id: input.categoryId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

Delete:

```ts
export async function deleteProduct(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
```

RLS đảm bảo user chỉ thao tác trên record của chính mình.

---

# 13. Import service

`src/services/import.service.ts`

```ts
import { createClient } from '@/lib/supabase/client';

export async function getImports() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('imports')
    .select(`
      *,
      products (
        id,
        name,
        sku
      )
    `)
    .order('imported_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createImport(input: {
  productId: string;
  quantity: number;
  costPrice: number;
  importedAt?: string;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('imports')
    .insert({
      product_id: input.productId,
      quantity: input.quantity,
      cost_price: input.costPrice,
      imported_at: input.importedAt ?? new Date().toISOString(),
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

---

# 14. Sale service

Không insert trực tiếp vào `sales`.

Phải dùng RPC:

```ts
import { createClient } from '@/lib/supabase/client';

export async function createSale(input: {
  importId: string;
  quantity: number;
  sellingPrice: number;
  soldAt?: string;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('create_sale', {
    p_import_id: input.importId,
    p_quantity: input.quantity,
    p_selling_price: input.sellingPrice,
    p_sold_at: input.soldAt ?? new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

Lý do:

```text
UI
 ↓
createSale()
 ↓
RPC create_sale()
 ↓
check user
 ↓
lock import
 ↓
check remaining
 ↓
insert sale
```

Không tự tính remaining rồi insert ở frontend.

---

# 15. Sales list

```ts
export async function getSales() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('sales_detail')
    .select('*')
    .order('sold_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
```

Frontend nhận trực tiếp:

```ts
{
  product_name,
  quantity,
  cost_price,
  selling_price,
  total_cost,
  revenue,
  gross_profit,
  sold_at
}
```

Không cần tự tính lại.

---

# 16. Expense service

```ts
import { createClient } from '@/lib/supabase/client';

export async function getExpenses() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createExpense(input: {
  name: string;
  category: string;
  amount: number;
  expenseDate?: string;
  description?: string;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      name: input.name,
      category: input.category,
      amount: input.amount,
      expense_date: input.expenseDate ?? new Date().toISOString(),
      description: input.description ?? null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

---

# 17. Dashboard service

`src/services/dashboard.service.ts`

```ts
import { createClient } from '@/lib/supabase/client';
import type { DashboardSummary } from '@/types/database';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('dashboard_summary')
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

Dashboard không cần tự query:

```text
products
imports
sales
expenses
```

Chỉ cần:

```text
dashboard_summary
```

---

# 18. Auth service

Tạo:

```text
src/services/auth.service.ts
```

```ts
import { createClient } from '@/lib/supabase/client';

export async function signIn(
  email: string,
  password: string
) {
  const supabase = createClient();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
```

---

# 19. Login page

Login form hiện tại của frontend nên gọi:

```ts
await signIn(email, password);
```

Sau khi thành công:

```ts
router.push('/dashboard');
router.refresh();
```

Không tự lưu access token vào:

```text
localStorage
sessionStorage
```

Supabase SSR sẽ quản lý session bằng cookie.

---

# 20. Logout

```ts
await signOut();

router.push('/login');
router.refresh();
```

---

# 21. Thay mock data

Không xóa mock data ngay.

Thay từng page theo thứ tự:

### 1. Products

```text
mockProducts
      ↓
getProducts()
      ↓
product_inventory
```

### 2. Categories

```text
mockCategories
      ↓
getCategories()
      ↓
categories
```

### 3. Imports

```text
mockImports
      ↓
getImports()
      ↓
imports
```

### 4. Sales

```text
mockSales
      ↓
getSales()
      ↓
sales_detail
```

### 5. Expenses

```text
mockExpenses
      ↓
getExpenses()
      ↓
expenses
```

### 6. Dashboard

```text
mockDashboard
      ↓
getDashboardSummary()
      ↓
dashboard_summary
```

---

# 22. Data flow sau khi hoàn thành

```text
                    ┌───────────────┐
                    │   Next.js UI  │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │    Services   │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
       Normal CRUD                   RPC create_sale
              │                           │
              ▼                           ▼
       Supabase Client              PostgreSQL
              │                           │
              └─────────────┬─────────────┘
                            │
                           RLS
                            │
                            ▼
                       PostgreSQL
```

---

# 23. Thứ tự implementation trong IDE

Thực hiện chính xác theo thứ tự:

```text
[ ] 1. Install @supabase/supabase-js
[ ] 2. Install @supabase/ssr
[ ] 3. Create .env.local
[ ] 4. Create lib/supabase/client.ts
[ ] 5. Create lib/supabase/server.ts
[ ] 6. Create lib/supabase/proxy.ts
[ ] 7. Add middleware/proxy integration
[ ] 8. Create database types
[ ] 9. Create auth.service.ts
[ ] 10. Implement Login
[ ] 11. Implement Logout
[ ] 12. Test authenticated session
[ ] 13. Create category.service.ts
[ ] 14. Create product.service.ts
[ ] 15. Replace Product mock data
[ ] 16. Create import.service.ts
[ ] 17. Replace Import mock data
[ ] 18. Create sale.service.ts
[ ] 19. Replace Sale mock data
[ ] 20. Create expense.service.ts
[ ] 21. Replace Expense mock data
[ ] 22. Create dashboard.service.ts
[ ] 23. Replace Dashboard mock data
[ ] 24. Test CRUD
[ ] 25. Test RLS with another user
[ ] 26. Test create_sale RPC
[ ] 27. Remove obsolete mock data
```

---

# 24. RLS test bắt buộc

Tạo User A và User B.

User A tạo:

```text
Product A
Import A
Sale A
Expense A
```

User B đăng nhập.

User B phải:

- Không thấy Product A.
- Không thấy Import A.
- Không thấy Sale A.
- Không thấy Expense A.
- Không thấy Product A trong `product_inventory`.
- Không thấy Sale A trong `sales_detail`.
- Không thấy số liệu của User A trong `dashboard_summary`.

Đây là test quan trọng nhất trước khi deploy production.

---

# 25. Không làm ở frontend

Không làm:

```ts
const remaining =
  importedQuantity - soldQuantity;
```

để quyết định việc tạo sale.

Không làm:

```ts
supabase
  .from('sales')
  .insert(...)
```

để tạo sale.

Không truyền:

```ts
user_id: form.userId
```

từ form.

Không dùng:

```ts
SUPABASE_SERVICE_ROLE_KEY
```

trong Client Component.

Không lưu:

```text
access_token → localStorage
```

---

# 26. Sau khi frontend kết nối thành công

Các bước tiếp theo:

1. Pagination / search / filter.
2. Form validation bằng Zod.
3. Loading / error / empty states.
4. Realtime nếu thực sự cần.
5. Dashboard chart queries theo ngày/tháng.
6. Database indexes bổ sung nếu query thực tế cần.
7. Deploy environment variables.
8. Production RLS audit.
9. Backup/database migration strategy.

## Acceptance criteria

Frontend được coi là đã kết nối thành công khi:

- Login bằng Supabase Auth thành công.
- Refresh browser vẫn giữ session.
- Logout hoạt động.
- Products đọc được từ `product_inventory`.
- Imports đọc/ghi được.
- Sales đọc từ `sales_detail`.
- Tạo sale dùng `create_sale` RPC.
- Không thể bán vượt remaining quantity.
- Expenses đọc/ghi được.
- Dashboard đọc từ `dashboard_summary`.
- User A không thể đọc dữ liệu User B.
- Không còn dependency vào mock data trong các page production.
