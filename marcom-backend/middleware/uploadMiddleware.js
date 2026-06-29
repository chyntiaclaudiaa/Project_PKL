const multer = require('multer');
const path = require('path');

// 1. Atur lokasi dan nama file yang disimpan
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const originalName = path.basename(file.originalname, ext);

        cb(null, `${originalName}-${uniqueSuffix}${ext}`);
    }
});

// 2. Batasi format file yang boleh diupload
// - PDF/DOC/DOCX dipakai untuk support_file
// - JPG/PNG/WEBP dipakai untuk foto hasil konten
// - MP4/MOV/WEBM/AVI dipakai untuk video hasil konten
const allowedTypes = [
    // Dokumen
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    // Gambar
    'image/jpeg',
    'image/png',
    'image/webp',

    // Video
    'video/mp4',
    'video/quicktime',   // .mov (iPhone)
    'video/webm',
    'video/x-msvideo',   // .avi
    'video/3gpp'         // .3gp (rekaman HP lama/android)
];

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, PNG, WEBP, MP4, MOV, WEBM, atau AVI.'), false);
    }
};

// 3. Konfigurasi upload
// Limit dinaikkan ke 200MB supaya video pendek hasil rekam HP tetap muat.
// Kalau mau dokumen tetap dibatasi kecil dan video boleh besar, pisahkan
// jadi dua instance multer berbeda (lihat catatan di bawah file ini).
const upload = multer({
    storage,
    limits: {
        fileSize: 200 * 1024 * 1024 // 200MB
    },
    fileFilter
});

module.exports = upload;

/*
 * CATATAN (opsional):
 * Saat ini satu konfigurasi "upload" dipakai untuk support_file (dokumen)
 * DAN result_file (foto/video), jadi limit 200MB berlaku untuk keduanya.
 * Kalau mau dokumen tetap dibatasi kecil (misal 10MB) sementara video
 * boleh sampai 200MB, ganti jadi dua export:
 *
 *   const uploadDocument = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: documentFilter });
 *   const uploadMedia    = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 }, fileFilter: mediaFilter });
 *   module.exports = { uploadDocument, uploadMedia };
 *
 * lalu di requestRoutes.js:
 *   upload.single('support_file')        -> uploadDocument.single('support_file')
 *   upload.array('result_file', 10)      -> uploadMedia.array('result_file', 10)
 *
 * Bilang aja kalau mau aku buatkan versi terpisah ini.
 */