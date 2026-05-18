import express from 'express';
import { router } from './routes';
import cors from 'cors'

const app = express();
const port: number = 4000;

app.use(cors());
app.use(express.json());
app.use('/math-edu', router);

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
