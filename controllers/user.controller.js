const passport = require('passport');
const bcrypt = require('bcrypt');
var crypto = require('crypto');
const { usersModel, userBanksModel } = require('../database/models/user.model');
const { debitTransactionModel, creditTransactionModel } = require('../database/models/transaction.model');
const { getCurrentTime, idGenerator, issueJWT, generateReference } = require('../utils/helpers.utils');
const catchAsync = require('../utils/async.utils');
const { listBanks, createTransferRecipient, initializeTransaction, initiateTransfer } = require('../controllers/paystack.controller');

exports.createAccount = catchAsync ( async (req, res, next) => {

  	const { name, email, password } = req.body;

  	try {

		const password_hash = await bcrypt.hash(password, 12);
		const user_id = idGenerator();
        const created = getCurrentTime();

		await usersModel.query().insert({user_id, email, name, password:password_hash, created});

        req.result = {status:'success',message:'Account created successfully, please proceed to login',code:200};
		return next();

  	} catch (err) {

  		console.log(err);
  		req.result = {status: 'failed',message: 'Unable to perform request',code:500};
		return next();
  	}
});

exports.loginAccount = catchAsync ( async (req, res, next) => {
  	
  	try {

        const { email, password } = req.body;
    
        const { hash, user_id } = req.login_access;
    
        const compare_password = await bcrypt.compare(password, hash);
    
        if (compare_password == true) {
    
            const data = {key:user_id};
    
            const jwt = issueJWT(data, process.env.JWT_EXPIRES);
    
            req.result = {status:'success',message:'Logged in successfully',code:200,data:{token:jwt}};
            return next();
        }

        req.result = {status:'failed',message: 'Invalid login credentials',code:401};
        return next();

  	} catch (err) {

  		console.log(err);
  		req.result = {status: 'failed',message: 'Unable to perform request',code:500};
		return next();
  	}	
});

exports.checkAuthentication = passport.authenticate('jwt', { session: false });

exports.getBanks = catchAsync ( async (req, res, next) => {

    try {

        const { body: { message, data: banks } } = await listBanks('NGN');

        const data = banks.map(bank => {
            return {bank_name:bank.name,bank_code:bank.code,slug:bank.slug};
        });

        req.result = {status:'success',message,data,code:200};
		return next();

    } catch (err) {
        console.log(err);
  		req.result = {status: 'failed',message: 'Unable to perform request',code:500};
		return next();
    }
});

exports.createBeneficiary  = catchAsync ( async (req, res, next) => {

    const { bank_code, account_no: bank_account } = req.body;

    const { name, user_id } = req.user;

  	try {

        const created = getCurrentTime();

        const { body: { data } } = await createTransferRecipient({type:"nuban",name,account_number:bank_account,bank_code});

        await userBanksModel.query().insert({user_id, bank_code, bank_account, transfer_code:data.recipient_code, created});

        req.result = {status:'success',message:'Beneficiary successfully added',code:200};
		return next();

  	} catch (err) {

  		console.log(err);
  		req.result = {status: 'failed',message: 'Invalid account details',code:500};
		return next();
  	}

});

exports.getBeneficiaries  = catchAsync ( async (req, res, next) => {

    const { user_id } = req.user;

  	try {

        const data = await userBanksModel.query().select('transfer_code','bank_code','bank_account').where({user_id});        

        req.result = {status:'success',message:'Beneficiary successfully added',data,code:200};
		return next();

  	} catch (err) {

  		console.log(err);
  		req.result = {status: 'failed',message: 'Unable to perform request',code:500};
		return next();
  	}

});

exports.getAccountBalance = catchAsync ( async (req, res, next) => {

  	try {
        
        const { balance: account_balance } = req.user;

        req.result = {status:'success',message:'Balance retrieved successfully',data:{account_balance},code:200};
		return next();

  	} catch (err) {

  		console.log(err);
  		req.result = {status: 'failed',message: 'Unable to perform request',code:500};
		return next();
  	}

});

exports.fundAccount = catchAsync ( async (req, res, next) => {

    try {
      
        const { user_id, email  } = req.user;

        const { channel, amount } = req.body;

        const meta_data = JSON.stringify({data:req.user});

        const credit_amount = Math.abs(parseFloat(amount));

        const ref_code = generateReference();

        const channels = [channel];

        const params = {reference:ref_code,amount:`${credit_amount*100}`,email,callback_url:`${req.protocol}://${req.get('host')}/users/account/payment_success`,channels,metadata:meta_data}

        const { data: { data: { authorization_url }}  } = await initializeTransaction(params);

        await creditTransactionModel.query().insert({user_id, channel, ref_code, meta_data, amount:credit_amount, created:getCurrentTime()});

        req.result = {status:'success',message:'Complete your transaction',data:{authorization_url},code:200};
        return next();

    } catch (err) {
        console.log(err);
        req.result = {status: 'failed',message: 'Unable to perform request',code:500};
        return next();
    }
});

exports.transferFunds = catchAsync ( async (req, res, next) => {

    try {
      
        const { user_id } = req.user;

        const {transfer_id, amount} = req.transfer;

        const debit_amount = Math.abs(parseFloat(amount));

        const meta_data = JSON.stringify({recipient:transfer_id});

        const created = getCurrentTime();

        const ref_code = generateReference();

        const transaction = await creditTransactionModel.transaction(async trx => {

            await debitTransactionModel.query(trx).insert({user_id,trx_type:'transfer',ref_code,meta_data,amount,status:'completed',created});

            await usersModel.query(trx).where({user_id}).decrement('balance', debit_amount).limit(1);

            await usersModel.query(trx).where({user_id:transfer_id}).increment('balance', debit_amount).limit(1);

            await creditTransactionModel.query(trx).insert({user_id:transfer_id, channel:'transfer', ref_code, meta_data, amount:debit_amount,status:'completed',created});

        });

        req.result = {status:'success',message:'Transfer completed successfully',code:200};
        return next();

    } catch (err) {
        console.log(err.message);
        req.result = {status: 'failed',message: 'Unable to perform request',code:500};
        return next();
    }
});

exports.withdrawFunds = catchAsync ( async (req, res, next) => {

    try {
      
        const { user_id  } = req.user;

        const { transfer_code, amount } = req.body;

        const meta_data = JSON.stringify({data:{user_id,transfer:transfer_code}});

        const debit_amount = Math.abs(parseFloat(amount));

        const ref_code = generateReference();

        const params = {reference:ref_code,amount:debit_amount*100,metadata:meta_data,recipient:transfer_code,source:'balance'}

        const { body: { message, data } } = await initiateTransfer(params);

        await debitTransactionModel.query().insert({user_id, trx_type:'withdraw', ref_code, meta_data, amount:debit_amount, created:getCurrentTime()});

        req.result = {status:'success',message:'Your funds is on its way to your account',code:200};
        return next();

    } catch (err) {
        console.log(err);
        req.result = {status: 'failed',message:'You cannot initiate third party payouts as a starter business',code:500};
        return next();
    }
});

exports.checkPayment = catchAsync ( async (req, res, next) => {
    
    try {

        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');

        if (hash == req.headers['x-paystack-signature']) {

            const { event } = req.body;

            if (event == 'charge.success') {

                const { data: { reference, amount, metadata: { data: meta_data } } } = req.body;

                const  { user_id } = meta_data;

                const credit_amount = amount/100;

                res.status(200);

                const transaction = await creditTransactionModel.transaction(async trx => {

                    await creditTransactionModel.query(trx).where({ref_code:reference}).patch({status:'completed',created:getCurrentTime()});

                    await usersModel.query(trx).where({user_id}).increment('balance', Math.abs(credit_amount)).limit(1);
                });
            }

            if (event == 'transfer.success') {

                const { data: { reference, amount, recipient: { metadata: {data: meta_data} } } } = req.body;

                const  { user_id } = meta_data;

                const debit_amount = amount/100;

                res.status(200);

                const transaction = await creditTransactionModel.transaction(async trx => {

                    await debitTransactionModel.query(trx).where({ref_code:reference}).patch({status:'completed',created:getCurrentTime()});

                    await usersModel.query(trx).where({user_id}).decrement('balance', Math.abs(debit_amount)).limit(1);

                });
            }

            if (event == 'transfer.failed' || event == 'transfer.failed') {

                res.status(200);

                await debitTransactionModel.query(trx).where({ref_code:reference}).patch({status:'failed',created:getCurrentTime()});
            }
        }

        res.status(400);

    } catch (err) {
        console.log(err);
        res.status(500);
    }
});