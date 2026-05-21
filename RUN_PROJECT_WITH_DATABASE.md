# طريقة تشغيل مشروع نقشة مع قاعدة البيانات

هذا الملف يشرح تشغيل مشروع **Naqsha / نقشة** محليًا مع قاعدة البيانات على XAMPP و MySQL / MariaDB.

---

## 1. المتطلبات

قبل البدء تأكد من تثبيت البرامج التالية:

- XAMPP
- Node.js
- Visual Studio Code
- إضافة Live Server داخل VS Code
- متصفح Google Chrome أو أي متصفح حديث

---

## 2. تشغيل XAMPP

افتح XAMPP Control Panel ثم شغّل:

Apache
MySQL

بعد تشغيل MySQL افتح phpMyAdmin من الرابط:

http://localhost/phpmyadmin

---

## 3. إنشاء قاعدة البيانات

من phpMyAdmin:

1. اضغط على **New**.
2. اكتب اسم قاعدة البيانات:

naqsha

3. اختر الترميز:

utf8mb4_unicode_ci

4. اضغط **Create**.

## 4. استيراد ملف قاعدة البيانات SQL

بعد إنشاء قاعدة البيانات:

1. افتح قاعدة البيانات `naqsha`.
2. اضغط على تبويب **Import**.
3. اختر ملف SQL الخاص بالمشروع، مثل:

naqsha.sql

4. اضغط **Import**.

إذا ظهر خطأ أن الجداول موجودة مسبقًا، احذف قاعدة البيانات وأنشئها من جديد، أو احذف الجداول القديمة ثم أعد الاستيراد.

---

## 6. تثبيت حزم الباك إند

افتح Terminal داخل مجلد:

cd backEnd

npm install

بعد انتهاء التثبيت شغّل السيرفر:

npm run dev

إذا لم يعمل الأمر السابق، جرّب:

---

## 8. تشغيل الفرونت إند

افتح المشروع في VS Code.

اذهب إلى:

```txt
frontEnd/pages
```

افتح ملف:

```txt
login.html
```

ثم اضغط بزر الفأرة اليمين واختر:

```txt
Open with Live Server
```

سيتم فتح الموقع غالبًا على رابط مثل:

```txt
http://127.0.0.1:5500/frontEnd/pages/login.html
```

## 9. بيانات تسجيل الدخول للادمن

ibrahim@example.com
123123123
