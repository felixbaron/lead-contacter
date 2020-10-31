# LeadContacter

This [Express.js](https://expressjs.com/) microservice provides REST endpoints to automate email and appointment sending with Microsoft Outlook.

## Install

```shell
git clone https://github.com/felixbaron/lead-contacter
cd lead-contacter
node index.js
```

## Examples

```shell
# Send email
curl http://localhost:3000/sendEmail?email=name%40email.com&subject=my-subject&template=/path/to/template.html

# Send appointment
curl http://localhost:3000/sendAppointment?email=name%40email.com&subject=my-subject&template=/path/to/template.html
```
