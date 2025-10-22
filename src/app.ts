import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middleware/handleErrors';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());

// 404 Handler
app.use((req, res, _next): void => {
  res.status(404).send({
    status: false,
    error: 'Not Found',
    message: `Resource ${req.url} not found`,
    data: {}
  });
});

// app.use('/api/v1', paymentRoutes);
// app.use('/api/v1', invoiceRoutes);
// app.use(errorHandler);

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    errorHandler(err, req, res, next);
  } else {
    next();
  }
});

export default app;
