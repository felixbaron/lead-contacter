// Requirements
const express = require('express');
const Mustache = require('mustache');
const fs = require('fs');
const {
  exec,
} = require('child_process');

// Constants
const port = 8088;
const sendEmailScript = `${__dirname}/scripts/Email-send.scpt`;
const sendAppointmentScript = `${__dirname}/scripts/Appointment-send.scpt`;

// Instants
const app = express();

// Helper functions
function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Middleware
const checkParams = (requiredParams) => (req, res, next) => {
  if (!Array.isArray(requiredParams)) throw Error(`Expected Array, got: ${typeof (requiredParams)}`);
  for (let i = 0; i < requiredParams.length; i += 1) {
    const param = requiredParams[i];
    if (!req.query[param]) return next(createError(400, `Provide a value for ${param}`));
    req[param] = req.query[param];
  }
  return next();
};

const deleteTpl = () => (req, res, next) => {
  fs.unlinkSync(req.renderedTemplateFile);
  return next();
};

const renderTemplate = () => (req, res, next) => {
  const content = fs.readFileSync(req.template, {
    encoding: 'utf8',
  });
  const renderedTemplate = Mustache.render(content, req.query);
  const tempDir = '.tmp';
  const filename = `/Users/${process.env.USER}/${tempDir}/${Math.floor(Math.random() * 100000 + 1)}.html`;
  fs.writeFile(filename, renderedTemplate, {
    encoding: 'utf8',
  }, (err) => {
    if (err) return next(createError(400, `/ould not write file ${filename}`));
    req.renderedTemplateFile = filename;
    return next();
  });
};

const sendAppointment = () => (req, res, next) => {
  exec(`recipient="${req.email}" subject="${req.subject}" template="${req.renderedTemplateFile}" osascript ${sendAppointmentScript}`, (error) => {
    if (error) {
      return next(createError(400, `exec error: ${error}`));
    }
    return next();
  });
};

const sendEmail = () => (req, res, next) => {
  exec(`recipient="${req.email}" bccrecipient="${req.bccemail}" subject="${req.subject}" template="${req.renderedTemplateFile}" osascript ${sendEmailScript}`, (error) => {
    if (error) {
      return next(createError(400, `exec error: ${error}`));
    }
    return next();
  });
};

// Routers
// http://localhost:8088/sendEmail?email=name%40email.com&bccemail=name%40email.com&subject=my-subject&template=/Users/$USER/Downloads/mail.html&Name=Hallo%20Herr%20LastName&Account=Account&Industry=YourIndustry
const reqParamsSendEmail = ['email', 'bccemail', 'subject', 'template'];
app.get('/sendEmail', checkParams(reqParamsSendEmail), renderTemplate(), sendEmail(), deleteTpl(), (req, res) => res.status(200).send('OK'));

// http://localhost:8088/sendAppointment?email=name%40email.com&subject=my-subject&template=/Users/$USER/Downloads/invite.html&First=First&Last=Last&Account=Account
const reqParamsSendAppointment = ['email', 'subject', 'template'];
app.get('/sendAppointment', checkParams(reqParamsSendAppointment), renderTemplate(), sendAppointment(), deleteTpl(), (req, res) => res.status(200).send('OK'));

// Listener
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`); // eslint-disable-line no-console
});
