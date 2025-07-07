import { Router } from 'express';
import PriceComparison from './routes/PriceComparison';
export default () => {
    const app = Router();

    PriceComparison(app);

    return app;
}