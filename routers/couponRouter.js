const router = require('express').Router();
const Authorization = require('../middleware/authorization');
const ControllerFactory = require('../controllers/controllerFactory');
const couponController = ControllerFactory.creating('coupon.controller');

const {validators, verifyToken} = require('../middleware');
const { SYSOP } = require("../models/roles");
const tokenControl = verifyToken.tokenControl;

const couponValidator = validators.couponValidator;

router.post(
    '/create-coupon',
    tokenControl,
    Authorization.authControl([SYSOP]),
    couponValidator.createCoupon,
    couponController.createCouponAsync
);

router.put(
    '/edit-coupon',
    tokenControl,
    Authorization.authControl([SYSOP]),
    couponValidator.editCoupon,
    couponController.editCouponAsync
);

router.delete(
    '/delete-coupon/:couponID',
    tokenControl,
    Authorization.authControl([SYSOP]),
    couponValidator.deleteCoupon,
    couponController.deleteCouponAsync
);

router.post(
    '/confirm-delete-coupon',
    tokenControl,
    Authorization.authControl([SYSOP]),
    couponValidator.confirmDeleteCoupon,
    couponController.confirmDeleteCouponAsync
);

router.post(
    '/get-used-orders',
    tokenControl,
    Authorization.authControl([SYSOP]),
    couponValidator.getUsedOrders,
    couponController.getUsedOrdersAsync
);

module.exports = router;