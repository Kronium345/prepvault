// server/index.ts
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import vapiRoutes from './routes/vapi';
import geminiRoutes from './routes/gemini';
const app = express();
const PORT = 8082;

// ✅ Correct CORS setup for credentials + specific origin
app.use(
  cors({
    origin: 'http://localhost:8081', // your frontend origin
    credentials: true, // allow cookies/session
  })
);

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/vapi', vapiRoutes);
app.use('/gemini', geminiRoutes);

app.get('/', (req, res) => {
  res.send('PrepVault server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
