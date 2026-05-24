import express from 'express';
import { router } from './routes';
import cors from 'cors'

const app = express();
const port: number = 4001;

app.use(cors());
app.use(express.json());
app.use('/mathly', router);

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
