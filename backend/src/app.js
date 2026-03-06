import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/index.js';
import errorMiddleware from './middlewares/error.middleware.js';
import AppError from './utils/AppError.js';

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

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (config.isDev) {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
