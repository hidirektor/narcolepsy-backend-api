const db = require('../../models');
const GenericCRUD = require('../genericCrud');
const { errorSender } = require('../../utils');
const HttpStatusCode = require('http-status-codes');

const couponCrud = new GenericCRUD({ model: db.Coupon });
const orderCrud = new GenericCRUD({ model: db.Orders });

class CouponController {
    constructor() {}

    // Generate unique 8-character coupon code
    static generateCouponCode() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    // Create Coupon
    async createCouponAsync(req, res) {
        try {
            const { packageID, salePercent, couponCode } = req.body;

            // Generate coupon code if not provided
            const generatedCode = couponCode || CouponController.generateCouponCode();

            // Check if couponCode already exists
            const existingCoupon = await couponCrud.findOne({ where: { couponCode: generatedCode } });
            if (existingCoupon.result) {
                return res.status(HttpStatusCode.CONFLICT).json({ message: 'Coupon code already exists.' });
            }

            // Create coupon
            const newCoupon = await couponCrud.create({
                couponID: uuidv4(),
                packageID: packageID || null,
                salePercent: salePercent || null,
                couponCode: generatedCode,
            });

            res.status(HttpStatusCode.CREATED).json({ message: 'Coupon created successfully.', coupon: newCoupon });
        } catch (error) {
            console.error('Error creating coupon:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create coupon.' });
        }
    }

    // Edit Coupon
    async editCouponAsync(req, res) {
        try {
            const { couponID, packageID, salePercent, couponCode } = req.body;

            // Check if coupon exists
            const existingCoupon = await couponCrud.findOne({ where: { couponID } });
            if (!existingCoupon.result) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Coupon not found.' });
            }

            // Update coupon
            const updatedCoupon = await couponCrud.update(
                { where: { couponID } },
                {
                    packageID: packageID || existingCoupon.result.packageID,
                    salePercent: salePercent || existingCoupon.result.salePercent,
                    couponCode: couponCode || existingCoupon.result.couponCode,
                }
            );

            res.status(HttpStatusCode.OK).json({ message: 'Coupon updated successfully.', coupon: updatedCoupon });
        } catch (error) {
            console.error('Error editing coupon:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to edit coupon.' });
        }
    }

    // Delete Coupon
    async deleteCouponAsync(req, res) {
        try {
            const { couponID } = req.params;

            const deleted = await couponCrud.delete({ where: { couponID } });

            if (!deleted.status) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Coupon not found.' });
            }

            res.status(HttpStatusCode.OK).json({ message: 'Coupon deleted successfully.' });
        } catch (error) {
            console.error('Error deleting coupon:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete coupon.' });
        }
    }

    // Confirm Delete Coupon
    async confirmDeleteCouponAsync(req, res) {
        try {
            const { couponID } = req.body;

            const orders = await orderCrud.getAll({ where: { couponID } });

            if (orders.length > 0) {
                return res.status(HttpStatusCode.CONFLICT).json({
                    message: 'Cannot delete coupon as it is associated with existing orders.',
                });
            }

            const deleted = await couponCrud.delete({ where: { couponID } });

            if (!deleted.status) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Coupon not found.' });
            }

            res.status(HttpStatusCode.OK).json({ message: 'Coupon deleted successfully.' });
        } catch (error) {
            console.error('Error confirming coupon deletion:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete coupon.' });
        }
    }

    // Get Orders with Coupon
    async getUsedOrdersAsync(req, res) {
        try {
            const { couponID } = req.body;

            const orders = await orderCrud.getAll({ where: { couponID } });

            if (!orders || orders.length === 0) {
                return res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No orders found with this coupon.' });
            }

            res.status(HttpStatusCode.OK).json(orders);
        } catch (error) {
            console.error('Error fetching orders with coupon:', error.message);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch orders with coupon.' });
        }
    }
}

module.exports = CouponController;