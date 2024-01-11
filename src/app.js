const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require('node:http');

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const SERVER_PORT = 3000;
let imageList = [];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static(__dirname + "/public"))

io.on("connection", (socket) => {
    //console.log("Nueva conexion:", socket.id);
    socket.emit("loadImages", imageList);
});

httpServer.listen(SERVER_PORT);

console.log("Server on port", SERVER_PORT);

/**************************************************************************************
  #####  WHATSAPP  #####
  npm i https://github.com/pedroslopez/whatsapp-web.js#main

***************************************************************************************/

const puppeteerOptions = {
    headless: true,
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--process-per-site",
        "--disable-gpu"
    ],
};

const client = new Client({
    puppeteer: puppeteerOptions,
    authStrategy: new LocalAuth()
});

client.initialize();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTENTICADO');
});

client.on('auth_failure', msg => {
    console.error('AUNTENTICACION FALLIDA', msg);
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('ready', () => {
    console.log('INICIADO');
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

client.on('message_create', async msg => {
    console.log('MESSAGE RECEIVED FROM', msg.from);

    handleMessage(msg);
});

const isValidMsg = (msg) => {
    if (msg.from === "status@broadcast") return false;
    if (msg.fromMe) return false;
    if (
        msg.type === "chat" ||
        msg.type === "audio" ||
        msg.type === "ptt" ||
        msg.type === "video" ||
        msg.type === "image" ||
        msg.type === "document" ||
        msg.type === "vcard" ||
        msg.type === "sticker"
    )
        return true;
    return false;
};

const verifyContact = async (msgContact) => {

    const rawNumber = msgContact.id.user;
    const number = rawNumber.replace(/[^0-9]/g, "");

    const found = imageList.some(e => e.number === number);
    if (found) return false;

    const profilePicUrl = await msgContact.getProfilePicUrl();
    
    const contactData = {
        number: number,
        pic: profilePicUrl
    };

    return contactData;
};

const handleMessage = async (msg) => {
    if (!isValidMsg(msg)) {
        return;
    }

    try {
        let msgContact = await msg.getContact();     

        let contact = await verifyContact(msgContact);

        if (contact) {
            if (!!contact.pic) {
                imageList.push({
                    number: contact.number,
                    pic: contact.pic
                });
                console.log("Nuevo usuario");
                io.emit("newImage", contact.pic);
            }
        } else {
            return;
        }
    } catch (error) {
        console.log(error);
    }
};