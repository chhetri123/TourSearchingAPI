const sgMail = require("@sendgrid/mail");
const pug = require("pug");
const { htmlToText } = require("html-to-text");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.firstName = user.name.split(" ")[0];
    this.from = `Manish Chhetri <${process.env.FROM_EMAIL}>`;
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    const mailOptions = {
      to: this.to,
      from: this.from, //process.env.EMAIL_USERNAME, //
      subject,
      html,
      text: htmlToText(html, { wordwrap: 130 }),
    };
    await sgMail.send(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "Welcome to the tour family");
  }
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your Password Reset Token valid for only 10 min"
    );
  }
};
