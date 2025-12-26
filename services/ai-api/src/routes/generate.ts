import { Router } from 'express';
import multer from 'multer';
import { generateFromSketch } from '../controllers/sketchController';

const router = Router();
const upload = multer();

router.post('/', upload.single('sketch'), generateFromSketch);

export default router;

