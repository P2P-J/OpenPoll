import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import errorMiddleware from './middlewares/error.middleware.js';
import AppError from './utils/AppError.js';
import prisma from './config/database.js';
import redis from './config/redis.js';

import authRouter from './modules/auth/auth.route.js';
import userRouter from './modules/user/user.route.js';
import pointRouter from './modules/point/point.route.js';
import partyRouter from './modules/party/party.route.js';
import voteRouter from './modules/vote/vote.route.js';
import dashboardRouter from './modules/dashboard/dashboard.route.js';
import dosRouter from './modules/dos/dos.route.js';
import balanceRouter from './modules/balance/balance.route.js';
import newsRouter from './modules/news/news.route.js';
import contactRouter from './modules/contact/contact.route.js';

const app = express();

// 프록시 뒤에서 동작 시 실제 클라이언트 IP 사용 (rate-limit 등)
app.set('trust proxy', 1);

// 보안 헤더
app.use(helmet());

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 프로덕션: combined, 개발: dev
app.use(morgan(config.isDev ? 'dev' : 'combined'));

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Service unavailable' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/points', pointRouter);
app.use('/api/parties', partyRouter);
app.use('/api/votes', voteRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/dos', dosRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/news', newsRouter);
app.use('/api/contact', contactRouter);

app.all('*', (req, res, next) => {
  next(AppError.notFound(`Cannot find ${req.originalUrl} on this server`));
});

app.use(errorMiddleware);

export default app;
