const errors = require('../controllers/error.controller');

const sendErrorDev = (err, req, res) => {
	
	if (req.originalUrl .startsWith('/api')) {

		return res.status(err.statusCode).json({
	        status: err.status,
	        error:err,
	        message: err.message,
	        stack: err.stack
	    })
	}

	return res.status(err.statusCode).send('<h1 style="font-weight:bold;">Oops...!!!!<h1>');
}

const sendErrorStag = (err, req, res) => {
	
	if (req.originalUrl .startsWith('/api')) {

		if (err.isOperational) {

			return res.status(err.statusCode).json({
		        status: err.status,
		        message: err.message,
		    })
		}

		return res.status(500).json({
	        status: 'error',
	        message: "Service unavailable"
	    });
	}

	return res.status(err.statusCode).send('<h1 style="font-weight:bold;">Oops...!!!!<h1>');
}

const sendErrorPro = (err, req, res) => {

	if (req.originalUrl .startsWith('/api')) {

		if (err.isOperational) {

			return res.status(err.statusCode).json({
		        status: err.status,
		        message: err.message
		    })
		}

		return res.status(500).json({
	        status: 'error',
	        message: "Service unavailable"
	    });

	}

	return res.status(err.statusCode).send('<h1 style="font-weight:bold;">Oops...!!!!<h1>');	
}

module.exports = (err, req, res, next) => {
	
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error'

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	}

	if (process.env.NODE_ENV === 'staging') {
		sendErrorStag(err, req, res);
	}

	if (process.env.NODE_ENV === 'production') {

		let error = {...err};
		error.message = err.message;
	    sendErrorPro(error, req, res);
	}
}