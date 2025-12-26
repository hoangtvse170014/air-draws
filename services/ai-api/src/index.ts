import express from 'express';
import cors from 'cors';
import generateRouter from './routes/generate';

const app = express();

app.use(
  cors({
    origin: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use('/api/generate', generateRouter);

const port = Number(process.env.PORT ?? 4000);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`[ai-api] ready on http://localhost:${port}`);
  });
}

export default app;

