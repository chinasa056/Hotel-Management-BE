import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';

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

// Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    status: false,
    error: err.name,
    message: err.message,
    data: {}
  });
});

export default app;
