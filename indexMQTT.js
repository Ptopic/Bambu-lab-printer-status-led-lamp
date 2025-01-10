require('dotenv').config();
const mqtt = require('mqtt');

const protocol = 'mqtts';
const host = process.env.PRINTER_IP;
const port = '8883';

const topic = `device/${process.env.PRINTER_SERIAL_NUMBER}/report`;

const connectUrl = `${protocol}://${host}:${port}`;

const client = mqtt.connect(connectUrl, {
	clientId: 'mqtt-explorer-32e383d4',
	clean: false,
	connectTimeout: 4000,
	username: 'bblp',
	password: process.env.PRINTER_SECRET_CODE,
	reconnectPeriod: 1000,
	rejectUnauthorized: false,
});

/*
STATUSES:
--- Preparing project ---
command: 'project_prepare',

-- Percentage of print ---
mc_percent: 41,
*/

client.on('connect', () => {
	console.log('Connected');

	client.subscribe([topic], () => {
		client.on('message', (topic, payload) => {
			const message = JSON.parse(payload.toString());

			console.log('Received Message:', topic);
			console.log(message.print);

			if (message.command === 'project_prepare') {
				console.log('Preparing project...');
			}

			if (message.mc_percent) {
				console.log('Printing progress:', message.print.mc_percent);
			}
		});
	});
});

client.on('error', (err) => {
	console.error('Connection error: ', err);
	client.end();
});
