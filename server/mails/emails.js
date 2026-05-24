import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import createTransporter from "./email.config.js";


export const sendVerificationEmail = async (email, name, verificationToken) => {
	try {
		const mailOptions = {
		  from: process.env.EMAIL,
		  to: email,
		  subject: 'Verify your email',
		  html: VERIFICATION_EMAIL_TEMPLATE
			.replace('{name}', name)
			.replace('{verificationCode}', verificationToken),
		};
	
		const transporterInstance = await createTransporter();
		await transporterInstance.sendMail(mailOptions);
	
		console.log('Verification email sent successfully.');
	  } catch (error) {
		console.error('Error sending verification email:', error);
	  }
};

export const sendWelcomeEmail = async (email, name) => {
	try {
	  const mailOptions = {
		from: process.env.EMAIL,
		to: email,
		subject: 'Welcome to Proforma',
		html: WELCOME_EMAIL_TEMPLATE.replace('{name}', name),
	  };
  
	  const transporterInstance = await createTransporter();
	  await transporterInstance.sendMail(mailOptions);
  
	  console.log('Welcome email sent successfully.');
	} catch (error) {
	  console.error('Error sending welcome email:', error);
	}
  };

  export const sendPasswordResetEmail = async (email, name, resetURL) => {
	try {
	  const mailOptions = {
		from: process.env.EMAIL,
		to: email,
		subject: 'Reset your password',
		html: PASSWORD_RESET_REQUEST_TEMPLATE
		  .replace('{name}', name)
		  .replace('{resetURL}', resetURL),
	  };
  
	  const transporterInstance = await createTransporter(); 
	  await transporterInstance.sendMail(mailOptions);
  
	  console.log('Password reset email sent successfully.');
	} catch (error) {
	  console.error('Error sending password reset email:', error);
	}
  };

  export const sendResetSuccessEmail = async (email, name) => {
	try {
	  const mailOptions = {
		from: process.env.EMAIL,
		to: email,
		subject: 'Password Reset Successful',
		html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace('{name}', name),
	  };
  
	  const transporterInstance = await createTransporter(); 
	  await transporterInstance.sendMail(mailOptions);
  
	  console.log('Password reset success email sent successfully.');
	} catch (error) {
	  console.error('Error sending password reset success email:', error);
	}
  };

