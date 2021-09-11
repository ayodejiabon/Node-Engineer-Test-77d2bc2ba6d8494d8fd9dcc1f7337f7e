const PayStack = require('paystack-node');
const axios = require('axios');

const paystack = new PayStack(process.env.PAYSTACK_SECRET_KEY, process.env.NODE_ENV);

const paystackApi = axios.create({baseURL:process.env.PAYSTACK_URL,headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,'Content-Type': 'application/json'}});

exports.createTransferRecipient = data => {
	return paystack.createTransferRecipient(data);
}

exports.listBanks = currency => {
	return paystack.listBanks({currency:currency});
};

exports.initializeTransaction = data => {
	return paystackApi.post('/transaction/initialize', data);
};

exports.initiateTransfer = data => {
	return paystackApi.post('/transfer', data);
};

exports.calcCharge = amount => {

	const charge = (0.015 * amount);

	let total;

	if (charge >= 2000) {

		total = 2000;

	}else{

		total = charge;
	}

	return total;
}