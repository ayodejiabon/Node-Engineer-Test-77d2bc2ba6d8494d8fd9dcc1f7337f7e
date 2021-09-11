exports.response = async (req, res, next) => {

    const { status, message, code, data } = req.result;

    if (!status || !message || !code){
        return res.status(400).json({status:'failed',message:'Invalid request'});
    }

    if (data) {
        return res.status(code).json({status,message,data});
    }

    return res.status(code).json({status,message});
};
