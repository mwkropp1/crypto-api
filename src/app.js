import express from 'express';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(express.json());
app.use('/api/v1', routes);

app.use(errorHandler);

export default app;
