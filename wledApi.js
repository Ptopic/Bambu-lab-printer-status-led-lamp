require('dotenv').config();
const axios = require('axios');

const setWledState = (data) => {
	return axios.post(process.env.WLED_URL + '/json/state', data);
};

const breatheEffectWarning = async () => {
	return await setWledState({
		seg: [
			{
				id: 0,
				start: 0,
				stop: 18,
				col: [[255, 255, 0]],
				fx: 2,
				pal: 0,
				bri: 50,
			},
		],
		on: true,
	});
};

const breatheEffectError = async () => {
	return await setWledState({
		seg: [
			{
				id: 0,
				start: 0,
				stop: 18,
				col: [[0, 255, 0]],
				fx: 2,
				pal: 0,
				bri: 50,
			},
		],
		on: true,
	});
};

const setXLedsOn = async (x) => {
	return await setWledState({
		seg: [
			{
				id: 0,
				start: 0,
				stop: x || 0,
				col: [[255, 0, 0]],
				fx: 0,
				bri: 50,
			},
		],
		on: true,
	});
};

const finishedPrinting = async () => {
	return await setWledState({
		seg: [
			{
				start: 0,
				stop: 18,
				fx: 9,
				sx: 220,
				bri: 50,
			},
		],
		on: true,
	});
};

const sendindPrintJob = async () => {
	return await setWledState({
		seg: [
			{
				start: 0,
				stop: 18,
				col: [[255, 0, 0]],
				fx: 27,
				pal: 0,
				bri: 50,
				sx: 180,
			},
		],
		on: true,
	});
};

const clearLedState = async () => {
	return await setWledState({
		seg: [
			{
				start: 0,
				stop: 18,
				bri: 0,
			},
		],
	});
};

module.exports = {
	breatheEffectWarning,
	breatheEffectError,
	setXLedsOn,
	finishedPrinting,
	sendindPrintJob,
	clearLedState,
};
