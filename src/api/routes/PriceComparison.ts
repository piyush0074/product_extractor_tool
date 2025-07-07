import { Router } from 'express';
import { PriceComparisonController } from '../../controller/PriceComparison';

export default (app: Router) => {
    const controller = new PriceComparisonController();
    
    // Health check endpoint
    app.get('/v1/health', controller.healthCheck.bind(controller));
    
    // Get product price comparison across multiple websites
    app.post('/v1/product_detail', controller.searchProduct.bind(controller));
}