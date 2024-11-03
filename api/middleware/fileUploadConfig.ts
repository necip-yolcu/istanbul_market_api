import multer, { StorageEngine } from 'multer';
import { existsSync, mkdirSync } from 'fs';

// Generic multer configuration function
function configureMulterUpload(directory: string) {
  // Ensure the directory exists
  if (!existsSync(directory)) {
    mkdirSync(directory);
  }

  const storage: StorageEngine = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, directory);
    },
    filename(req, file, callback) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
    },
  });

  return multer({ storage });
}

// Exports for use in different routes
export const itemUpload = configureMulterUpload('./images'); // For item images
export const logoUpload = configureMulterUpload('./logos');  // For company logos
