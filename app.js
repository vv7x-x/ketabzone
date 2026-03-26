import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// ====== 🔴 إعدادات Firebase الخاصة بفارس 🔴 ======
const firebaseConfig = {
  apiKey: "AIzaSyCB_-jIsjEETeizf31cPOyWQ8MClVD3qMA",
  authDomain: "ketabzone-7fe6e.firebaseapp.com",
  projectId: "ketabzone-7fe6e",
  storageBucket: "ketabzone-7fe6e.firebasestorage.app",
  messagingSenderId: "617240140579",
  appId: "1:617240140579:web:8394e02ae2089b04290a96",
  measurementId: "G-M8NHKB83H5"
};

let auth;
try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch (error) {
    console.warn("Firebase Not configured yet:", error);
}

document.addEventListener("DOMContentLoaded", () => {
    // Navbar scroll effect
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) navbar.classList.add("scrolled");
        else navbar.classList.remove("scrolled");
    });

    // Modal Display Logic
    const loginBtn = document.getElementById("loginBtn");
    const loginModal = document.getElementById("loginModal");
    const closeLogin = document.getElementById("closeLogin");

    if (loginBtn && loginModal && closeLogin) {
        loginBtn.addEventListener("click", () => loginModal.classList.add("active"));
        closeLogin.addEventListener("click", () => loginModal.classList.remove("active"));
        loginModal.addEventListener("click", (e) => {
            if (e.target === loginModal) loginModal.classList.remove("active");
        });
    }

    // ======= Auth UI Logic (Tabs) =======
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const authTitle = document.getElementById("authTitle");
    const authSubtitle = document.getElementById("authSubtitle");
    const authSubmitBtn = document.getElementById("authSubmitBtn");
    const forgotPasswordContainer = document.getElementById("forgotPasswordContainer");
    
    let isRegisterMode = false;

    if (tabLogin && tabRegister) {
        tabRegister.addEventListener("click", () => {
            isRegisterMode = true;
            tabRegister.style.color = "var(--primary-color)";
            tabRegister.style.borderBottom = "2px solid var(--primary-color)";
            tabLogin.style.color = "var(--text-muted)";
            tabLogin.style.borderBottom = "none";
            
            authTitle.innerText = "إنشاء حساب جديد";
            authSubtitle.innerText = "انضم إلى مجتمع الكتاب المفضل!";
            authSubmitBtn.innerText = "تسجيل حساب جديد";
            forgotPasswordContainer.style.display = "none";
        });

        tabLogin.addEventListener("click", () => {
            isRegisterMode = false;
            tabLogin.style.color = "var(--primary-color)";
            tabLogin.style.borderBottom = "2px solid var(--primary-color)";
            tabRegister.style.color = "var(--text-muted)";
            tabRegister.style.borderBottom = "none";
            
            authTitle.innerText = "تسجيل الدخول";
            authSubtitle.innerText = "مرحباً بك مجدداً في مستودع الكتب";
            authSubmitBtn.innerText = "تسجيل الدخول";
            forgotPasswordContainer.style.display = "block";
        });
    }

    // ======= Firebase Authentication Actions =======
    const authForm = document.getElementById("authForm");
    const googleSignInBtn = document.getElementById("googleSignInBtn");
    const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
    const authEmail = document.getElementById("authEmail");
    const authPassword = document.getElementById("authPassword");

    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if(!auth || firebaseConfig.apiKey.includes('فارس')) { 
                alert("تنبيه: يجب استبدال قيم Firebase بأكواد مشروعك الحقيقي في ملف app.js لكي يعمل التسجيل الفعلي!"); 
                return; 
            }
            
            const email = authEmail.value;
            const password = authPassword.value;

            if (isRegisterMode) {
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        alert("تم إنشاء حسابك بنجاح يابطل! أهلاً بك.");
                        loginModal.classList.remove("active");
                    }).catch((error) => alert("حدث خطأ أثناء الإنشاء: " + error.message));
            } else {
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        alert("تم تسجيل الدخول بنجاح! هلمّ لنقرأ.");
                        loginModal.classList.remove("active");
                    }).catch((error) => alert("بيانات الدخول خاطئة أو غير مسجلة: " + error.message));
            }
        });
    }

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener("click", () => {
            if(!auth || firebaseConfig.apiKey.includes('فارس')) { 
                alert("تنبيه: ضع أكواد الربط بـ Firebase الخاصة بك ليعمل خيار جوجل!"); 
                return; 
            }
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then((result) => {
                    alert('أهلاً بك ' + result.user.displayName + ' تم تسجيل الدخول عبر جوجل بنجاح!');
                    loginModal.classList.remove("active");
                    if(loginBtn) loginBtn.innerText = result.user.displayName;
                }).catch((error) => alert("فشل تسجيل الدخول بجوجل: " + error.message));
        });
    }

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if(!auth || firebaseConfig.apiKey.includes('فارس')) { alert("أضف بيانات Firebase أولاً"); return; }
            
            const email = authEmail.value;
            if (!email) {
                alert("يرجى كتابة بريدك الإلكتروني في الخانة أولاً قبل طلب استعادة كلمة المرور!");
                return;
            }

            sendPasswordResetEmail(auth, email)
                .then(() => alert("رسالة الأمل! تم إرسال رابط إعادة تعيين كلمة المرور إلى " + email + " 📧 (راجع صندوق الوارد أو البريد المزعج)"))
                .catch((error) => alert("حدث خطأ: " + error.message));
        });
    }

    if(auth && !firebaseConfig.apiKey.includes('فارس')) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                if(loginBtn) {
                    loginBtn.innerText = "خروج (" + (user.displayName || user.email.split('@')[0]) + ")";
                    loginBtn.onclick = null;
                    loginBtn.addEventListener("click", (e) => {
                        e.stopImmediatePropagation(); 
                        if(confirm("هل تريد تسجيل الخروج؟")) {
                            signOut(auth).then(() => {
                                window.location.reload();
                            });
                        }
                    }, true);
                }
            }
        });
    }

    // ====== Dynamic Books Logic via Backend API ======
    const dynamicBooksGrid = document.getElementById("dynamicBooksGrid");
    const API_URL = "http://localhost:3000/api/books";
    const BASE_URL = "http://localhost:3000";
    
    // Global filter/search functions so index.html can call them
    let currentFilterCategory = 'all';
    let currentSearchTerm = '';

    window.renderBooksByCategory = (categoryFilter) => {
        currentFilterCategory = categoryFilter || 'all';
        refreshBooksDisplay();
    };

    window.searchBooks = () => {
        const searchInput = document.getElementById("mainSearch");
        currentSearchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        refreshBooksDisplay();
    };

    async function refreshBooksDisplay() {
        if (!dynamicBooksGrid) return;
        
        dynamicBooksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-size:1.2rem; padding: 40px;">جاري جلب الكتب من الخادم... 🌐</p>';
        
        try {
            const res = await fetch(API_URL);
            const books = await res.json();
            
            if (!books || books.length === 0) {
                dynamicBooksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-size:1.2rem; padding: 40px;">المكتبة فارغة حالياً. بانتظار المدير لإضافة كتب عظيمة!</p>';
                return;
            }

            let filteredBooks = books;

            // 1. Filter by category
            if (currentFilterCategory && currentFilterCategory !== 'all') {
                filteredBooks = filteredBooks.filter(b => b.category && b.category.includes(currentFilterCategory));
            }

            // 2. Filter by search term
            if (currentSearchTerm !== '') {
                filteredBooks = filteredBooks.filter(b => 
                    b.title.toLowerCase().includes(currentSearchTerm) || 
                    b.author.toLowerCase().includes(currentSearchTerm) || 
                    (b.category && b.category.toLowerCase().includes(currentSearchTerm))
                );
            }

            if (filteredBooks.length === 0) {
                dynamicBooksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-size:1.2rem; padding: 40px;">لا توجد نتائج بحث تطابق طلبك. جرب تصنيفات أو كلمات أخرى!</p>';
                return;
            }

            dynamicBooksGrid.innerHTML = '';
            filteredBooks.forEach(book => {
                // Book PDF comes from backend API domain
                let pdfUrl = BASE_URL + book.pdfUrl;

                dynamicBooksGrid.innerHTML += `
                    <div class="book-card glass-panel" style="animation: fadeIn 0.5s ease-out;">
                        <div class="book-cover mock-cover-1"></div>
                        <div class="book-info">
                            <h3>${book.title}</h3>
                            <p class="author">${book.author}</p>
                            <div class="book-meta">
                                <span class="rating">⭐ ${book.rating}</span>
                                <span class="book-badge">${book.category}</span>
                            </div>
                            <div style="display: flex; gap: 10px; margin-top: auto;">
                                <a href="${pdfUrl}" target="_blank" class="btn-primary btn-small" style="text-align:center; text-decoration:none; display:block; flex:1;">تصفح حمّل الـ PDF</a>
                            </div>
                        </div>
                    </div>
                `;
            });
        } catch(error) {
            dynamicBooksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: #ef4444; font-size:1.2rem; background:rgba(239, 68, 68, 0.1); padding: 20px; border-radius:10px;">فشل الاتصال بالسيرفر! 🔴 يرجى التأكد من تشغيل (البَاك إند) أولاً.</p>';
        }
    }

    if (dynamicBooksGrid) {
        refreshBooksDisplay();
    }
});
