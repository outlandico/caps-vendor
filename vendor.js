'use strict';

require('dotenv').config();
const io = require('socket.io-client');
const Chance = require('chance');
const fake = new Chance();

const { handlePickup, handleDelivery } = require('./handlers.js');

const URL = process.env.HUB || 'http://localhost:3000';
const vendorId = '1-206-flowers';

console.log('Connecting to:', URL);
const socket = io.connect(URL);

// Subscribe to the right events and handle them with the right handlers
socket.on('in-transit', handlePickup);
socket.on('delivered', handleDelivery);

socket.on('connect', () => {
  console.log(`Vendor connected: ${socket.id}`);
  socket.emit('join_room', { vendor_id: vendorId });
});

socket.on('message', (msg) => {
  console.log(`Received message: ${msg}`);
});

// Simulate sending an event every 5 seconds
setInterval(() => {
  let order = {
    orderID: fake.guid(),
    status: 'ready',
    store: vendorId,
    customer: fake.name(),
    address: fake.address(),
    amount: fake.dollar()
  };
  console.log('VENDOR: New Order', order.orderID);
  socket.emit('ready-for-pickup', order);
}, 5000);

function generateOrderId() {
  return 'ORDER-' + Math.floor(Math.random() * 100000);
}
