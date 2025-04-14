import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/ping', (_req, res) => {
	res.json({ message: 'pong 🏓' });
});

app.listen(PORT, () => {
	console.log(`✅ Backend running at http://localhost:${PORT}`);
});
