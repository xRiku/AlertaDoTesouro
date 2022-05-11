import { resolve } from 'path';
import exphbs from 'express-handlebars';
import nodemailerExpressHandlebars from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';

class NodeMail {
  public transporter: any;

  configureTemplates() {
    const viewPath = resolve(__dirname, '..', 'views', 'emails');

    this.transporter.use(
      'compile',
      nodemailerExpressHandlebars({
        viewEngine: exphbs.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          // default: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      }),
    );
  }

  constructor() {
    this.transporter = nodemailer.createTransport({
      port: Number(mailConfig.port),
      host: String(mailConfig.host),
      secure: Boolean(mailConfig.secure),
      auth: mailConfig.auth,
      tls: mailConfig.tls,
    });

    this.configureTemplates();
  }

  sendMail(mailMessage: any): any {
    return this.transporter.sendMail({
      from: 'centraldoapito@alertadotesouro.com',
      ...mailMessage,
    });
  }
}

export default new NodeMail();
