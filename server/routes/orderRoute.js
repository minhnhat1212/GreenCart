import express from "express"
import authUser from "../middlewares/authUser.js";
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, updateOrderStatus, syncPaymentStatus, confirmOrderDelivery } from "../controllers/orderController.js";
import authSeller from "../middlewares/authSeller.js";

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.put('/:orderId/confirm-delivery', authUser, confirmOrderDelivery)
orderRouter.put('/:orderId/status', authSeller, updateOrderStatus)
orderRouter.post('/:orderId/sync-payment', authSeller, syncPaymentStatus)

export default orderRouter;