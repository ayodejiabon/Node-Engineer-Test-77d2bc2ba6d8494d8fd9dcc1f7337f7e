const express = require('express');
const ratelimit = require('express-rate-limit');
const { validateAccount, validateLogin, validateBeneficiary, validateFundAccount, validateTransfer, validateWithdrawal } = require('../middleware/validator.middleware');
const { response } = require('../middleware/response.middleware');
const { limiter } = require('../utils/helpers.utils');

const userController = require('../controllers/user.controller');

const router = express.Router();

router.use(express.json({limit: '10Kb'}));

router.post('/account/create', limiter(10, 36000), validateAccount, userController.createAccount, response);
router.post('/account/login', limiter(10, 36000), validateLogin, userController.loginAccount, response);

router.use(userController.checkAuthentication);

router.get('/account/banks', userController.getBanks, response);

router.route('/account/beneficiary')
.get(limiter(10, 36000), userController.getBeneficiaries, response)
.post(limiter(10, 36000), validateBeneficiary, userController.createBeneficiary, response);

router.get('/account/balance', limiter(10, 36000), userController.getAccountBalance, response);

router.post('/account/fund', limiter(10, 36000), validateFundAccount, userController.fundAccount, response);

router.post('/account/transfer', limiter(10, 36000), validateTransfer, userController.transferFunds, response);

router.post('/account/withdraw', limiter(10, 36000), validateWithdrawal, userController.withdrawFunds, response);

module.exports = router;