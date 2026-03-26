document.addEventListener("DOMContentLoaded", () => {
    // الاتصال بالسيرفر الجديد بدلاً من localForage
    const API_URL = "http://localhost:3000/api/books";

    const adminForm = document.getElementById("adminForm");
    const bookTitleInput = document.getElementById("bookTitle");
    const bookAuthorInput = document.getElementById("bookAuthor");
    const bookCategoryInput = document.getElementById("bookCategory");
    const bookRatingInput = document.getElementById("bookRating");
    const bookPdfInput = document.getElementById("bookPdf");
    const adminBooksList = document.getElementById("adminBooksList");
    const totalBooksCount = document.getElementById("totalBooksCount");

    // 1. جلب الكتب من السيرفر وعرضها
    async function loadBooks() {
        if (!adminBooksList) return;
        adminBooksList.innerHTML = "<tr><td colspan='6' style='text-align:center;'>جاري تحميل البيانات من الخادم... 🌐</td></tr>";

        try {
            const res = await fetch(API_URL);
            const books = await res.json();
            
            if (totalBooksCount) totalBooksCount.innerText = books.length;

            if (books.length === 0) {
                adminBooksList.innerHTML = "<tr><td colspan='6' style='text-align:center;'>لا يوجد أي كتب مرفوعة على السيرفر حالياً.</td></tr>";
                return;
            }

            adminBooksList.innerHTML = "";
            books.forEach((book, index) => {
                adminBooksList.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td style="font-weight:bold; color: var(--primary-color);">${book.title}</td>
                        <td>${book.author}</td>
                        <td><span class="badge" style="background:var(--secondary-color); padding:4px 8px; border-radius:4px; font-size:0.8rem; color:white;">${book.category}</span></td>
                        <td>⭐ ${book.rating}</td>
                        <td>
                            <button class="btn-primary" style="background:#ef4444; border:none; padding:6px 12px; border-radius:4px; font-size:0.85rem; cursor:pointer; font-weight:bold; transition:all 0.3s;" onclick="deleteBook('${book.id}')">حذف نهائي</button>
                        </td>
                    </tr>
                `;
            });
        } catch (error) {
            console.error(error);
            adminBooksList.innerHTML = "<tr><td colspan='6' style='text-align:center; color:red; font-weight:bold;'>فشل الاتصال بالخادم. يرجى التأكد من تشغيل الباك إند! 🔴</td></tr>";
        }
    }

    // 2. رفع كتاب جديد
    if (adminForm) {
        adminForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = bookTitleInput.value.trim();
            const author = bookAuthorInput.value.trim();
            const category = bookCategoryInput.value;
            const rating = bookRatingInput.value;
            const pdfFile = bookPdfInput.files[0];

            if (!pdfFile) {
                alert("يرجى اختيار ملف PDF للكتاب!");
                return;
            }

            const formData = new FormData();
            formData.append("title", title);
            formData.append("author", author);
            formData.append("category", category);
            formData.append("rating", rating);
            formData.append("pdf", pdfFile); // ملف الـ PDF الحقيقي

            const submitBtn = adminForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "جاري الرفع والحفظ في الخادم... ⏳";
            submitBtn.disabled = true;

            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    body: formData
                });
                
                if (res.ok) {
                    alert("✅ تم رفع الكتاب وحفظه بنجاح على الخادم المخصص!");
                    adminForm.reset();
                    loadBooks(); // تحديث القائمة
                } else {
                    const data = await res.json();
                    alert("خطأ أثناء الرفع: " + data.error);
                }
            } catch (error) {
                console.error(error);
                alert("تعذر الاتصال بالخادم، هل قمت بتشغيله؟");
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // 3. مسح كتاب من السيرفر نهائياً
    window.deleteBook = async (id) => {
        if (!confirm("تحذير: هل أنت متأكد من مسح هذا الكتاب وملفه نهائياً من سيرفرات KetabZone؟")) return;

        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("🗑️ تم الحذف والإزالة العميقة بنجاح!");
                loadBooks();
            } else {
                alert("حدث خطأ أثناء محاولة الحذف من السيرفر.");
            }
        } catch (error) {
            alert("فشل الاتصال بالخادم!");
        }
    };

    // تشغيل الدالة في البداية لجلب الكتب
    loadBooks();
});
