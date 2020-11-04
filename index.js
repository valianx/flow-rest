const express = require('express')
const app = express()
const CryptoJS = require('crypto-js/hmac-sha256');
const axios = require("axios");
require('dotenv').config()
const qs = require('querystring')
const compression = require('compression')
const morgan = require('morgan')

let port = 3000
app.set('port'.port)
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(compression());
app.use(morgan('dev'))

app.post("/create_payment", async (req, res) => {

    let {
        amount,
        subject,
        email
    } = req.body


    if (amount == null) return res.status(400).json("amount es requerido")
    if (subject == null) return res.status(400).json("subject es requerido")
    if (email == null) return res.status(400).json("email es requerido")
    let commerceOrder = Date.now()
    let timeout = 60 * 10

    let data = "amount" + amount + "apiKey" + process.env.apiKey + "commerceOrder" + commerceOrder + "currency" + process.env.currency + "email" + email + "subject" + subject + "timeout" + timeout + "urlConfirmation" + process.env.urlConfirmation + "urlReturn" + process.env.urlReturn;

    let sign = CryptoJS(data, process.env.secretKey);

    let body = {
        'amount': amount,
        'apiKey': process.env.apiKey,
        'commerceOrder': commerceOrder,
        'currency': process.env.currency,
        'email': email,
        'subject': subject,
        "timeout": timeout,
        'urlConfirmation': process.env.urlConfirmation,
        'urlReturn': process.env.urlReturn,
        's': sign.toString()
    }
    try {
        let response = await axios.post(process.env.apiURL + '/payment/create', qs.stringify(body), {
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            }
        })
        return res.status(200).json({
            url: `${response.data.url}?token=${response.data.token}`,
            flowOrder: response.data.flowOrder,
            orden: commerceOrder
        })
    } catch (err) {
        return res.status(500).json(error.message)
    }
})


app.post('/getStatus', async (req, res) => {
    let token = req.body.token
    let object = "apiKey=" + process.env.apiKey + "&token=" + token;
    let sign = CryptoJS(object, process.env.secretKey);

    let url = process.env.apiURL + '/payment/getStatus' + "?" + object + "&s=" + sign;

    try {
        let response = await axios.get(url)
        return res.status(200).json(response.data)
    } catch (err) {
        return res.status(500).json(err.message)
    }
})

app.post('/refund_create', async (req, res) => {
    const {
        refundCommerceOrder,
        receiverEmail,
        amount
    } = req.body
    let urlCallBack = 'https://0d1bd9e31952.ngrok.io/refund'

    let data = "amount" + amount + "apiKey" + process.env.apiKey + "receiverEmail" + receiverEmail + "refundCommerceOrder" + refundCommerceOrder + "urlCallBack" + urlCallBack;

    let sign = CryptoJS(data, process.env.secretKey);

    let body = {
        'amount': amount,
        'apiKey': process.env.apiKey,
        'receiverEmail': receiverEmail,
        'refundCommerceOrder': refundCommerceOrder,
        'urlCallBack': process.env.urlRefund,
        's': sign.toString()
    }
    try {
        let response = await axios.post(process.env.apiURL + '/refund/create', qs.stringify(body), {
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            }
        })
        return res.status(200).json(response.data)
    } catch (error) {
        return res.status(400).json(error.message)
    }
})

app.post('/refund_status', async (req, res) => {
    let token = req.body.token

    let object = "apiKey=" + process.env.apiKey + "&token=" + token;
    let sign = CryptoJS(object, process.env.secretKey);

    let url = process.env.apiURL + '/refund/getStatus' + "?" + object + "&s=" + sign;

    try {
        let response = axios.get(url)
        return res.status(200).json(response.data)
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

app.listen(port, () => {
    console.log("server on port " + port);
})