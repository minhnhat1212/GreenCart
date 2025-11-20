import express from 'express';
import { createCoupon, getCoupons, applyCoupon, useCoupon, getAvailableCoupons } from '../controllers/couponController.js';
import sellerAuth from '../middlewares/authSeller.js';

const couponRouter = express.Router();

couponRouter.post('/create'/*, sellerAuth*/, createCoupon);
couponRouter.get('/list', /*sellerAuth*/ getCoupons);
couponRouter.get('/available', getAvailableCoupons); // Endpoint cho user xem mã giảm giá
couponRouter.post('/apply', applyCoupon);
couponRouter.post('/use', useCoupon);

export default couponRouter;