const { send, json } = require('micro');
const { router, post } = require('microrouter');
const { handleErrors, createError } = require('micro-boom');
const validation = require('micro-joi');
const Joi = require('joi');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const validator = validation(Joi.object({
	to: Joi.string().email().required(),
	message: Joi.string().min(1).max(500).required()
}));

const sendMail = async (req, res) => {
	const body = await json(req);
	const msg = {
		to: body.to,
		from: process.env.MAIL_FROM,
		subject: process.env.MAIL_SUBJECT,
		text: body.message
	};
	try {
		await sgMail.send(msg);
		send(res, 200);
	} catch (err) {
		throw createError(500);
	}
};

module.exports = router(
  post('/send', handleErrors(validator(sendMail)))
);
