# Documentation of APIs

## 1) نظرة عامة على المشروع

هذا المستند مخصص للفرونت-end حتى يبدأ في الربط مع الـ API الخاص بـ Tarek Helal Backend.

### معلومات أساسية
- اسم المشروع: Tarek Helal Backend
- الإطار: Django + Django REST Framework
- نظام المصادقة: JWT باستخدام Simple JWT
- نوع البيانات: JSON في الغالب
- رفع الصور: يتم عبر multipart/form-data

### قاعدة الرابط الأساسية
في البيئة المحلية غالبًا ستكون الروابط على الشكل التالي:

- Base URL: http://127.0.0.1:8000
- API Base: http://127.0.0.1:8000/api

> لو كان الفرونت-end يستخدم متغير بيئة مثل NEXT_PUBLIC_API_URL، فسيكون القيمة المناسبة غالبًا: http://127.0.0.1:8000/api

---

## 2) طريقة المصادقة

النظام يستخدم JWT:
- access token: يُستخدم في الطلبات المحمية
- refresh token: يُستخدم لتجديد access token أو تسجيل الخروج

### الهيدر required في كل طلب محمي
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### لو كان الطلب يحتوي صورًا
```http
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

---

## 3) Authentication APIs

### 3.1 تسجيل مستخدم جديد
Endpoint:
```http
POST /api/auth/register/
```

Body:
```json
{
  "first_name": "Ahmed",
  "last_name": "Ali",
  "phone": "01023456789",
  "password": "secret123"
}
```

Response:
```json
{
  "id": 1,
  "first_name": "Ahmed",
  "last_name": "Ali",
  "phone": "01023456789",
  "role": "CUSTOMER"
}
```

---

### 3.2 تسجيل الدخول
Endpoint:
```http
POST /api/auth/login/
```

Body:
```json
{
  "phone": "01023456789",
  "password": "secret123"
}
```

Response:
```json
{
  "access": "<access_token>",
  "refresh": "<refresh_token>"
}
```

### ملاحظات للفرونت-end
- بعد تسجيل الدخول، خزّن access و refresh داخل storage أو cookies.
- استخدم access token في كل طلب يحتاج مصادقة.

---

### 3.3 معرفة بيانات المستخدم الحالي
Endpoint:
```http
GET /api/auth/me/
```

Headers:
```http
Authorization: Bearer <access_token>
```

Response:
```json
{
  "id": 1,
  "first_name": "Ahmed",
  "last_name": "Ali",
  "phone": "01023456789",
  "role": "CUSTOMER"
}
```

---

### 3.4 تسجيل الخروج
Endpoint:
```http
POST /api/auth/logout/
```

Headers:
```http
Authorization: Bearer <access_token>
```

Body:
```json
{
  "refresh": "<refresh_token>"
}
```

Response:
```http
204 No Content
```

---

### 3.5 تجديد التوكن
Endpoint:
```http
POST /api/auth/refresh/
```

Body:
```json
{
  "refresh": "<refresh_token>"
}
```

Response:
```json
{
  "access": "<new_access_token>"
}
```

---

## 4) User & Address APIs

هذه الواجهات مخصصة للمستخدمين لتعديل بياناتهم والعناوين.

### 4.1 إضافة عنوان جديد
Endpoint:
```http
POST /api/users/add_address/
```

Headers:
```http
Authorization: Bearer <access_token>
```

Body:
```json
{
  "title": "Home",
  "country": "Egypt",
  "city": "Cairo",
  "street": "Main Street",
  "is_default": true
}
```

Response:
```json
{
  "message": "Address added successfully.",
  "data": {
    "id": 1,
    "title": "Home",
    "country": "Egypt",
    "city": "Cairo",
    "street": "Main Street",
    "is_default": true
  }
}
```

---

### 4.2 عرض كل العناوين
Endpoint:
```http
GET /api/users/get_addresses/
```

Headers:
```http
Authorization: Bearer <access_token>
```

Response:
```json
{
  "message": "Addresses retrieved successfully.",
  "data": [
    {
      "id": 1,
      "title": "Home",
      "country": "Egypt",
      "city": "Cairo",
      "street": "Main Street",
      "is_default": true
    }
  ]
}
```

---

### 4.3 حذف عنوان
Endpoint:
```http
DELETE /api/users/delete_address/<address_id>/
```

Headers:
```http
Authorization: Bearer <access_token>
```

Response:
```json
{
  "message": "Address deleted successfully."
}
```

---

### 4.4 اختيار عنوان افتراضي
Endpoint:
```http
PUT /api/users/set_default_address/<address_id>/
```

Headers:
```http
Authorization: Bearer <access_token>
```

Response:
```json
{
  "message": "Default address updated successfully.",
  "data": {
    "id": 1,
    "title": "Home",
    "country": "Egypt",
    "city": "Cairo",
    "street": "Main Street",
    "is_default": true
  }
}
```

---

### 4.5 تحديث عنوان
Endpoint:
```http
PUT /api/users/update_address/<address_id>/
```

Headers:
```http
Authorization: Bearer <access_token>
```

Body:
```json
{
  "title": "Office",
  "country": "Egypt",
  "city": "Giza",
  "street": "New Street"
}
```

Response:
```json
{
  "message": "Address updated successfully.",
  "data": {
    "id": 1,
    "title": "Office",
    "country": "Egypt",
    "city": "Giza",
    "street": "New Street",
    "is_default": false
  }
}
```

---

### 4.6 الحصول على عنوان واحد
Endpoint:
```http
GET /api/users/get_address_by_id/<address_id>/
```

Headers:
```http
Authorization: Bearer <access_token>
```

Response:
```json
{
  "message": "Address retrieved successfully.",
  "data": {
    "id": 1,
    "title": "Office",
    "country": "Egypt",
    "city": "Giza",
    "street": "New Street",
    "is_default": false
  }
}
```

---

### 4.7 تحديث الملف الشخصي
Endpoint:
```http
PUT /api/users/update_profile/
```

Headers:
```http
Authorization: Bearer <access_token>
```

Body:
```json
{
  "first_name": "Mohamed",
  "last_name": "Mostafa"
}
```

Response:
```json
{
  "message": "Profile updated successfully.",
  "data": {
    "first_name": "Mohamed",
    "last_name": "Mostafa"
  }
}
```

---

### 4.8 حذف الملف الشخصي
Endpoint:
```http
DELETE /api/users/delete_profile/
```

Headers:
```http
Authorization: Bearer <access_token>
```

Response:
```json
{
  "message": "Profile deleted successfully."
}
```

---

## 5) Categories APIs

الـ categories موجودة في [categories/urls.py](categories/urls.py) و [categories/views.py](categories/views.py).

### 5.1 عرض كل الأقسام
Endpoint:
```http
GET /api/categories/
```

Response:
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "image": null,
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  }
]
```

### 5.2 إضافة قسم
Endpoint:
```http
POST /api/categories/
```

Body:
```json
{
  "name": "Home Appliances"
}
```

### 5.3 تحديث قسم
Endpoint:
```http
PUT /api/categories/<id>/
```

### 5.4 حذف قسم
Endpoint:
```http
DELETE /api/categories/<id>/
```

> ملاحظة: هذا القسم يحتاج صلاحيات مناسبة (Admin أو Moderator أو ReadOnly وفق منطق الـ permission).

---

## 6) Products APIs

المنتجات محددة في [products/urls.py](products/urls.py) و [products/views.py](products/views.py).

### مهم جدًا
الـ routes الخاصة بالمنتجات موجودة في الكود لكن غير مربوطة حاليًا من ملف [config/urls.py](config/urls.py). لذلك قبل الربط من الفرونت-end يجب التأكد من ربطها من الجذر.

### المسار المتوقع حسب الكود الحالي
لو تم ربطها من الجذر، فالمسارات ستكون تقريبًا على الشكل التالي:

```http
GET /api/products/products/
POST /api/products/products/
GET /api/products/products/<id>/
PUT /api/products/products/<id>/
DELETE /api/products/products/<id>/
```

و لـ صور المنتج:
```http
POST /api/products/product-images/
```

---

### 6.1 عرض كل المنتجات
Endpoint:
```http
GET /api/products/products/
```

Response example:
```json
[
  {
    "id": 1,
    "name": "Modern Chair",
    "description": "Comfortable chair",
    "category": 2,
    "images": [
      {
        "id": 1,
        "image": "/media/products/chair.jpg",
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": 1,
        "price": "125.00",
        "image": null,
        "attributes": [
          {
            "id": 1,
            "attribute_type": "Color",
            "value": "Red"
          }
        ]
      }
    ],
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  }
]
```

---

### 6.2 إضافة منتج جديد
Endpoint:
```http
POST /api/products/products/
```

Because the backend uses image fields and nested variants, the best approach is to send FormData.

Example FormData fields:
- name
- description
- category
- variants (JSON array as string if needed)
- images (if uploaded separately)

Example payload as JSON (if the frontend uses a custom adapter):
```json
{
  "name": "Modern Chair",
  "description": "Comfortable chair",
  "category": 2,
  "variants": [
    {
      "price": "125.00",
      "attributes": [
        {
          "attribute_type": "Color",
          "value": "Red"
        }
      ]
    }
  ]
}
```

If you upload images directly, use:
```http
Content-Type: multipart/form-data
```

---

### 6.3 إضافة صورة للمنتج
Endpoint:
```http
POST /api/products/product-images/
```

Body (form-data):
- product_id
- image
- is_primary (true/false)

Example:
```text
product_id: 1
image: [file]
is_primary: true
```

Response:
```json
{
  "id": 1,
  "image": "/media/products/chair.jpg",
  "is_primary": true
}
```

---

### 6.4 تحديث منتج
Endpoint:
```http
PUT /api/products/products/<id>/
```

Body example:
```json
{
  "name": "Updated Chair",
  "description": "Updated description",
  "category": 2,
  "variants": [
    {
      "price": "150.00",
      "attributes": [
        {
          "attribute_type": "Color",
          "value": "Blue"
        }
      ]
    }
  ]
}
```

> مهم جدًا: عند استخدام هذا الـ endpoint، النظام يحذف كل الـ variants القديمة الخاصة بالمنتج ثم ينشئ الجديدة من البيانات المرسلة. لذلك يجب على الفرونت-end أن يرسل كامل قائمة الـ variants في كل تحديث، وليس فقط التغييرات.

---

### 6.5 حذف منتج
Endpoint:
```http
DELETE /api/products/products/<id>/
```

ملاحظة:
- هذا الحذف يكون soft delete، أي لا يتم حذف السجل فعليًا وإنما يتم وضع deleted_at.

### 6.6 حذف نهائي للمنتج
Endpoint:
```http
DELETE /api/products/products/<id>/hard-delete/
```

---

## 7) ملاحظات مهمة للفرونت-end

### 7.1 أنواع الحقول
- id: رقم صحيح (BigAutoField)
- category: رقم صحيح يمثل ID القسم
- price: قيمة نصية أو رقم حسب الـ serializer
- image: مسار ملف أو URL
- is_primary: true/false

### 7.2 شكل الأخطاء
في أغلب الحالات ستأتي الأخطاء بهذا الشكل:
```json
{
  "message": "Failed to add address.",
  "errors": {}
}
```

أو في بعض الحالات:
```json
{
  "error": "Address not found."
}
```

### 7.3 ملاحظات على الصور
- الصور تُرفع باستخدام FormData
- لا تنسَ إرسال الملف مع اسم الحقل image
- استخدم multipart/form-data بدل application/json عند رفع الصور

### 7.4 ملاحظات على الـ variants
المنتج يمكن أن يحتوي على variants متعددة، وكل Variant يمكن أن يحتوي على attributes متعددة، لذلك يجب التعامل مع هذا الهيكل في الواجهة:
```json
{
  "variants": [
    {
      "price": "100.00",
      "attributes": [
        {
          "attribute_type": "Color",
          "value": "Red"
        }
      ]
    }
  ]
}
```

### 7.5 صلاحيات الوصول
- بعض الـ endpoints مفتوحة للقراءة للجميع
- التعديل والحذف يحتاج صلاحيات مناسبة
- لو كان المستخدم ليس Admin أو Moderator، قد لا يستطيع تنفيذ عمليات تعديل أو حذف

---

## 8) مثال سريع لاستخدام axios في الفرونت-end

### تسجيل الدخول
```js
const res = await axios.post("http://127.0.0.1:8000/api/auth/login/", {
  phone: "01023456789",
  password: "secret123"
});

localStorage.setItem("access_token", res.data.access);
localStorage.setItem("refresh_token", res.data.refresh);
```

### جلب المنتجات
```js
const token = localStorage.getItem("access_token");

const res = await axios.get("http://127.0.0.1:8000/api/products/products/", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

### رفع صورة منتج
```js
const formData = new FormData();
formData.append("product_id", "1");
formData.append("image", file);
formData.append("is_primary", "true");

await axios.post("http://127.0.0.1:8000/api/products/product-images/", formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data"
  }
});
```

---

## 9) Checklist قبل البدء في الربط

- [ ] تأكد من أن base URL مضبوط في الفرونت-end
- [ ] خزّن access token بعد تسجيل الدخول
- [ ] أضف الهيدر Authorization لكل الطلبات المحمية
- [ ] استخدم FormData لرفع الصور
- [ ] تعامل مع nested data في المنتجات والـ variants
- [ ] تأكد من ربط product routes في [config/urls.py](config/urls.py)

---

## 10) ملاحظة تقنية مهمة

الـ backend الحالي يحتوي على واجهات جاهزة للـ auth و users و categories، بينما الـ products تحتاج إلى توصيلها فعليًا من خلال [config/urls.py](config/urls.py) حتى تصبح متاحة للفرونت-end.

هذا هو أهم شيء الذي يحتاجه الفرونت-end قبل البدء في ربط صفحة المنتجات.
