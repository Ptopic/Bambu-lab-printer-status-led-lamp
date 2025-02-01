require('dotenv').config();

const WebSocket = require('ws');
const {
	breatheEffectWarning,
	breatheEffectError,
	setXLedsOn,
	finishedPrinting,
	sendindPrintJob,
	clearLedState,
} = require('./wledApi');

// Replace with your Home Assistant URL and Long-Lived Access Token
const HASS_URL = process.env.HASS_URL;
const HASS_TOKEN = process.env.HASS_TOKEN;

const TARGET_EVENTS = [
	`sensor.a1mini_${process.env.EVENT_PRINTER_SERIAL_NUMBER}_current_stage`,
	`sensor.a1mini_${process.env.EVENT_PRINTER_SERIAL_NUMBER}_print_progress`,
	`sensor.a1mini_${process.env.EVENT_PRINTER_SERIAL_NUMBER}_print_status`,
	`sensor.a1mini_${process.env.EVENT_PRINTER_SERIAL_NUMBER}_print_type`,
	`sensor.a1mini_${process.env.EVENT_PRINTER_SERIAL_NUMBER}_remaining_time`,
];

const ws = new WebSocket(HASS_URL);

let isInPrintStage = false;

const getLedCountToLightUp = (percentage) => {
	switch (true) {
		case percentage < 5:
			return 0;
		case percentage >= 5 && percentage < 10:
			return 1;
		case percentage >= 10 && percentage < 15:
			return 2;
		case percentage >= 15 && percentage < 20:
			return 3;
		case percentage >= 20 && percentage < 25:
			return 4;
		case percentage >= 25 && percentage < 30:
			return 5;
		case percentage >= 30 && percentage < 35:
			return 6;
		case percentage >= 35 && percentage < 40:
			return 7;
		case percentage >= 40 && percentage < 45:
			return 8;
		case percentage >= 45 && percentage < 50:
			return 9;
		case percentage >= 50 && percentage < 55:
			return 10;
		case percentage >= 55 && percentage < 60:
			return 11;
		case percentage >= 60 && percentage < 65:
			return 12;
		case percentage >= 65 && percentage < 70:
			return 13;
		case percentage >= 70 && percentage < 75:
			return 14;
		case percentage >= 75 && percentage < 80:
			return 15;
		case percentage >= 80 && percentage < 85:
			return 16;
		case percentage >= 85 && percentage < 100:
			return 17;
		case percentage === 100:
			return 18;
	}
};

ws.on('open', async () => {
	console.log('Connected to Home Assistant WebSocket API');

	ws.send(
		JSON.stringify({
			type: 'auth',
			access_token: HASS_TOKEN,
		})
	);
});

ws.on('message', async (data) => {
	const message = JSON.parse(data);

	if (message.type === 'auth_ok') {
		console.log('Authentication successful!');
		ws.send(
			JSON.stringify({
				id: 1,
				type: 'subscribe_events',
				event_type: 'state_changed',
			})
		);
	} else if (message.type === 'auth_invalid') {
		console.error('Authentication failed:', message.message);
	} else if (
		message.type === 'event' &&
		message.event.event_type === 'state_changed'
	) {
		const entity = message.event.data.entity_id;
		if (TARGET_EVENTS.includes(entity)) {
			if (
				entity ===
				`sensor.a1mini_${process.env.EVENT_PRINTER_SERIAL_NUMBER}_current_stage`
			) {
				console.log('Current stage:', message.event.data.new_state.state);
				if (
					message.event.data.new_state.state === 'prepare' ||
					message.event.data.new_state.state === 'heatbed_preheating' ||
					message.event.data.new_state.state === 'changing_filament'
				) {
					// Trigger loading led effect
					try {
						await sendindPrintJob();
					} catch (error) {
						console.error('Error setting WLED state:', error);
					}
				} else if (message.event.data.new_state.state === 'printing') {
					isInPrintStage = true;
				} else if (message.event.data.new_state.state === 'error') {
					// Trigger error led effect
					try {
						await breatheEffectError();
					} catch (error) {
						console.error('Error setting WLED state:', error);
					}
				}
			} else if (
				entity ===
				`sensor.a1mini_${process.env.EVENT_PRINTER_SERIAL_NUMBER}_print_progress`
			) {
				let currentProgress = message.event.data.new_state.state;
				console.log('Print progress:', currentProgress);
				if (isInPrintStage) {
					// Calculate number of leds needed to light up
					let ledCount = getLedCountToLightUp(currentProgress);
					// Trigger led effect to x leds
					try {
						if (ledCount === 0) {
							await clearLedState();
						} else {
							await setXLedsOn(ledCount);
						}
					} catch (error) {
						console.error('Error setting WLED state:', error);
					}
				}
			} else if (
				entity ===
				`sensor.a1mini_${process.env.EVENT_PRINTER_SERIAL_NUMBER}_print_status`
			) {
				console.log('Print status:', message.event.data.new_state.state);
				if (message.event.data.new_state.state === 'finish') {
					isInPrintStage = false;
					// Trigger finished led effect
					try {
						await finishedPrinting();
					} catch (error) {
						console.error('Error setting WLED state:', error);
					}
				} else if (message.event.data.new_state.state === 'pause') {
					try {
						await breatheEffectWarning();
					} catch (error) {
						console.error('Error setting WLED state:', error);
					}
				} else if (message.event.data.new_state.state === 'error') {
					try {
						await breatheEffectError();
					} catch (error) {
						console.error('Error setting WLED state:', error);
					}
				}
			} else if (
				entity ===
				`sensor.a1mini_${process.env.EVENT_PRINTER_SERIAL_NUMBER}_print_type`
			) {
				console.log('Print type:', message.event.data.new_state.state);
			} else if (
				entity ===
				`sensor.a1mini_${process.env.EVENT_PRINTER_SERIAL_NUMBER}_remaining_time`
			) {
				console.log('Remaining time:', message.event.data.new_state.state);
			}
		}
	} else {
		console.log('Message received:', message);
	}
});

ws.on('close', () => {
	console.log('WebSocket connection closed');
});

ws.on('error', (err) => {
	console.error('WebSocket error:', err);
});
