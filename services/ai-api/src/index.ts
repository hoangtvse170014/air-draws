import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import generateRouter from './routes/generate';
import testRouter from './routes/test';

const app = express();

app.use(
  cors({
    origin: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api/generate', generateRouter);
app.use('/', testRouter);

const port = Number(process.env.PORT ?? 4000);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`[ai-api] ready on http://localhost:${port}`);
    console.log(`[ai-api] STABILITY_KEY: ${process.env.STABILITY_KEY ? process.env.STABILITY_KEY.substring(0, 10) + '...' : 'NOT SET'}`);
  });
}

export default app;

