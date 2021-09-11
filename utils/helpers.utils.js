const path = require('path');
const fs = require('fs');
const moment = require('moment');
const crypto = require('crypto');
const ratelimit = require('express-rate-limit');
const jsonwebtoken = require('jsonwebtoken');

exports.idGenerator = () => {
	return `${Math.floor(Math.random() * 100000000)}`;
}

exports.getCurrentTime = () => {
	return moment().format();
}

exports.generateReference = () => {
	
	const token = crypto.randomBytes(32).toString('hex');

	const finalToken = crypto.createHash('sha256').update(token).digest('hex');

	return finalToken;
}

exports.limiter = (max, windowMs) => {
	return ratelimit({max, windowMs, message: {status:'failed',message:'Too many requests'},statusCode: 400,headers:false});
}

exports.issueJWT = (data, expires) => {

  	const expiresIn = expires;

  	const pathToKey = path.join(__dirname, '../config', 'id_rsa_priv.pem');
	const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

  	const payload = data;

  	const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn, algorithm: process.env.JWT_ALOGRITHM });

 	return signedToken;
}