const { body, param, validationResult } = require('express-validator');
const {  usersModel, userBanksModel } = require('../database/models/user.model');

exports.validateAccount = [
    body('name').trim().escape().not().isEmpty().withMessage('Full name is required').matches(/([A-Za-z]{1})([A-Za-z]+)(\s)([A-Za-z]{1})([A-Za-z]+){1}/)
    .withMessage('Please provide your valid full name').bail(),
    body('email', 'Provide a valid email address').trim().not().isEmpty().exists().isEmail().normalizeEmail()
    .custom( async (value, { req }) => {

        try {
            const check = await usersModel.query().where({email:value}).select('id').limit(1);
            if (check.length > 0) {
                return Promise.reject('Email is already in use');
            }else {
                return;
            }
        } catch (err) {
            return Promise.reject('Unable to perform request');
        }
    }),
    body('password').trim().escape().not().isEmpty().withMessage('Password is required').isLength({min:8}).withMessage('Password must be at least 8 characters long')
    .matches(/^.*(?=.{6,})(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/).withMessage('Password must contain a number and an uppercase letter').bail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const extractedErrors = [];
            errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
            return res.status(422).json({status:'failed',message:'All account data is required',errors:extractedErrors});
        }
        next();
    }
]

exports.validateLogin = [
    body('email', 'Provide a valid email address').trim().not().isEmpty().exists().isEmail().normalizeEmail()
    .custom( async (value, { req }) => {

        try {
            const check = await usersModel.query().where({email:value}).select('user_id','password').limit(1);
            if (check.length < 1) {
                return Promise.reject('Your credentials did not match any of our records');
            }else {
                req.login_access = {hash:check[0].password,user_id:check[0].user_id};
                return;
            }
        } catch (err) {
            return Promise.reject('Unable to perform request');
        }
    }),
    body('password').trim().escape().not().isEmpty().withMessage('Password is required').isLength({min:8}).withMessage('Invalid Password')
    .matches(/^.*(?=.{6,})(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/).withMessage('Invalid Password').bail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const extractedErrors = [];
            errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
            return res.status(422).json({status:'failed',message:'Invalid login data',errors:extractedErrors});
        }
        next();
    }
]

exports.validateBeneficiary = [
    body('bank_code').trim().escape().not().isEmpty().withMessage('Bank code is required').bail(),
    body('account_no','Invalid bank account number').trim().escape().not().isEmpty().withMessage('Bank account number is required')
    .isLength({min:10,max:11}).isNumeric().withMessage('Invalid bank account number')
    .custom( async (value, { req }) => {

        try {
            const check = await userBanksModel.query().where({user_id:req.user.user_id,bank_account:value}).select('id').limit(1);
            if (check.length == 1) {
                return Promise.reject('Beneficiary already added');
            }
            return;
        } catch (err) {
            return Promise.reject('Unable to perform request');
        }
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const extractedErrors = [];
            errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
            return res.status(422).json({status:'failed',message:'Invalid beneficiary data',errors:extractedErrors});
        }
        next();
    }
]

exports.validateFundAccount = [
    body('channel').trim().escape().not().isEmpty().withMessage('funding channel is required')
    .custom( async (value, { req }) => {

        if (value != 'card' && value != 'bank_transfer') {
            return Promise.reject('channel can only be card or bank_transfer');
        }
        return;
    }),
    body('amount','amount is required').trim().escape().not().isEmpty().withMessage('amount is required').isNumeric().withMessage('Invalid amount').bail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const extractedErrors = [];
            errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
            return res.status(422).json({status:'failed',message:'Invalid funding data',errors:extractedErrors});
        }
        next();
    }
]

exports.validateTransfer = [
    body('email', 'Please provide a valid email address').trim().not().isEmpty().withMessage('Please provide a valid email address').exists().isEmail().normalizeEmail()
    .custom( async (value, { req }) => {
        try {
            const check = await usersModel.query().where({email:value}).andWhere('user_id','!=', req.user.user_id).select('user_id').limit(1);
            if (check.length < 1) {
                return Promise.reject('Email does not exist');
            }else {
                req.transfer = {transfer_id:check[0].user_id,amount:req.body.amount};
                return;
            }
        } catch (err) {
            return Promise.reject('Unable to perform request');
        }
    }),
    body('amount','amount is required').trim().escape().not().isEmpty().withMessage('amount is required').isNumeric().withMessage('Invalid amount')
    .custom( async (value, { req }) => {
        try {
            const check = await usersModel.query().where('user_id','=', req.user.user_id).select('balance').limit(1);
            if (check.length < 1) {
                return Promise.reject('Invalid request');
            }else {

                const { balance } = check[0];

                if (Math.abs(balance) < value || balance == 0){
                    return Promise.reject('Insufficient balance');
                }else{
                    return;
                }
            }
        } catch (err) {
            return Promise.reject('Unable to perform request');
        }
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const extractedErrors = [];
            errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
            return res.status(422).json({status:'failed',message:'Invalid transfer data',errors:extractedErrors});
        }
        next();
    }
]

exports.validateWithdrawal = [
    body('transfer_code', 'Please provide transfer code').trim().escape().not().isEmpty()
    .custom( async (value, { req }) => {
        try {
            const check = await userBanksModel.query().where({transfer_code:value}).andWhere('user_id','=', req.user.user_id).select('id').limit(1);
            if (check.length < 1) {
                return Promise.reject('Beneficiary does not exist');
            }else {
                req.transfer = {transfer_id:check[0].user_id,amount:req.body.amount};
                return;
            }
        } catch (err) {
            return Promise.reject('Unable to perform request');
        }
    }),
    body('amount','amount is required').trim().escape().not().isEmpty().withMessage('amount is required').isNumeric().withMessage('Invalid amount')
    .custom( async (value, { req }) => {
        try {
            const check = await usersModel.query().where('user_id','=', req.user.user_id).select('balance').limit(1);
            if (check.length < 1) {
                return Promise.reject('Invalid request');
            }else {

                const { balance } = check[0];

                if (Math.abs(balance) < value || balance == 0){
                    return Promise.reject('Insufficient balance');
                }else{
                    return;
                }
            }
        } catch (err) {
            return Promise.reject('Unable to perform request');
        }
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const extractedErrors = [];
            errors.array({ onlyFirstError: true }).map(err => extractedErrors.push(err.msg));
            return res.status(422).json({status:'failed',message:'Invalid transfer data',errors:extractedErrors});
        }
        next();
    }
]