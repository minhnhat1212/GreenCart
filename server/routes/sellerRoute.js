import express from 'express'
import { isSellerAuth, sellerLogin, sellerLogout, getDashboardStats, getRevenueStats, getBestSellingProducts } from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js';
const sellerRouter = express.Router(); 

sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', sellerLogout);
sellerRouter.get('/dashboard-stats'/*, authSeller*/, getDashboardStats);
sellerRouter.get('/revenue-stats'/*, authSeller*/, getRevenueStats);
sellerRouter.get('/best-selling'/*, authSeller*/, getBestSellingProducts);

export default sellerRouter;
