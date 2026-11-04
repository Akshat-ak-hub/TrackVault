import multer from 'multer'

const allowedExtensions = new Set([
  '.pdf',
  '.docx',
  '.xlsx',
  '.png',
  '.jpg',
  '.jpeg',
])

export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const extension = file.originalname.match(/\.[^.]+$/)?.[0].toLowerCase()
    if (!extension || !allowedExtensions.has(extension)) {
      callback(new Error('Choose a PDF, DOCX, XLSX, PNG, or JPG file'))
      return
    }
    callback(null, true)
  },
})
