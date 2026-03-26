const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

/**
 * KetabZone Dedicated Backend Engine v2.0
 * Developed for Faris Hassan
 */

const app = express();
const PORT = 3000;

// مجلدات النظام المخصصة
const UPLOADS_DIR = path.join(__dirname, 'data/uploads');
const DB_FILE = path.join(__dirname, 'data/books.json');
const LOG_FILE = path.join(__dirname, 'data/server.log');

// تجهيز هيكل البيانات المخصص (Data Structure)
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// نظام تسجيل العمليات (Custom Logger)
const logger = (msg) => {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, logMsg);
    console.log(logMsg.trim());
};

// إعداد التخزين المخصص
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueName = `BZ-${Date.now()}-${Math.round(Math.random() * 1E5)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // حد أقصى 100 ميجا للملف الواحد
});

// --- API Endpoints المخصصة لـ KetabZone ---

// 1. جلب الكتب بفلترة ذكية
app.get('/api/books', (req, res) => {
    const books = JSON.parse(fs.readFileSync(DB_FILE));
    logger(`جلب قائمة الكتب (${books.length} كتب)`);
    res.json(books);
});

// 2. الرفع المخصص (Dedicated Upload)
app.post('/api/books', upload.single('pdf'), (req, res) => {
    try {
        const { title, author, category, rating } = req.body;
        const file = req.file;

        if (!title || !file) {
            return res.status(400).json({ error: 'بيانات غير مكتملة' });
        }

        const newBook = {
            id: `KB-${Date.now()}`,
            title,
            author: author || 'كاتب مجهول',
            category: category || 'عام',
            rating: rating || '5.0',
            pdfUrl: `/uploads/${file.filename}`,
            fileSize: file.size,
            uploadDate: new Date().toISOString()
        };

        const books = JSON.parse(fs.readFileSync(DB_FILE));
        books.push(newBook);
        fs.writeFileSync(DB_FILE, JSON.stringify(books, null, 2));

        logger(`تم رفع كتاب جديد: ${title}`);
        res.status(201).json(newBook);
    } catch (err) {
        logger(`خطأ في الرفع: ${err.message}`);
        res.status(500).json({ error: 'فشل السيرفر في معالجة الملف' });
    }
});

// 3. الحذف العميق (Deep Delete)
app.delete('/api/books/:id', (req, res) => {
    let books = JSON.parse(fs.readFileSync(DB_FILE));
    const book = books.find(b => b.id === req.params.id);

    if (book) {
        const filePath = path.join(UPLOADS_DIR, path.basename(book.pdfUrl));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        
        books = books.filter(b => b.id !== req.params.id);
        fs.writeFileSync(DB_FILE, JSON.stringify(books, null, 2));
        
        logger(`تم حذف الكتاب: ${book.title}`);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'لم يتم العثور على الكتاب' });
    }
});

app.listen(PORT, () => {
    logger(`بدء عمل باك إند KetabZone المخصص على البورت ${PORT}`);
});
