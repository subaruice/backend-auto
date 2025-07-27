import cors from 'cors';
import express from 'express';
import productRoutes from './router/products.js'
import categoryRoutes from './router/categories.js'

const app = express();
const PORT = 3306;

app.use(cors({
    origin: '*',
    exposedHeaders: ['x-total-count']
}));
app.use(express.json());

app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
})