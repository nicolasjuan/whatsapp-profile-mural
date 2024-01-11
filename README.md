# Whatsapp Profile Mural
A _very simple_ web application that shows a grid of WhatsApp profile images from incoming messages.

Backend uses [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) to receive WhatsApp messages and extract profile images, then sends it to a web client the signal over a socket when a new image is received.
