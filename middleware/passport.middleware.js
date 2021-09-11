const fs = require('fs');
const path = require('path');

const { usersModel } = require('../database/models/user.model');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const pathToKey = path.join(__dirname, '../config', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey:PUB_KEY,
	algorithms: [process.env.JWT_ALOGRITHM],
	ignoreExpiration:false
};

const strategy = new JwtStrategy(options, async (payload, done) => {

	const {key} = payload;

	try {

		const get_user = usersModel.query().select('user_id','name','email','balance','status').where({user_id:key}).limit(1);
		
		get_user.then((user) => {

			if (user) {
	
				const {user_id, name, email, balance} = user[0]
	
				return done(null, {user_id,name,email,balance});
				
			}else{
				return done(null, false, {message:"Invalid credentials"});
			}
		})
		.catch(err => done(err, null, {message:"Invalid login credentials"}))
		
	} catch (err) {
		console.log(err)
		return done(null, false, {message:"Invalid credentials"});
	}
});

module.exports = (passport) => {
	passport.use(strategy);
}