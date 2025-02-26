import 'dotenv/config.js';
import app from './app.js';

const port = process.env.PORT || '3000';

app.listen(port);
