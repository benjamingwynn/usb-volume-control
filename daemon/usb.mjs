/** @format */
import fsp from "node:fs/promises"

const DEVICE = "/dev/hidg0"
const CODE_MUTE = 0x10
const CODE_PLAY = 0x08
const CODE_VOLUME_UP = 0x20
const CODE_VOLUME_DOWN = 0x40

async function send(buffer) {
	await fsp.writeFile(DEVICE, buffer)
}

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}

export async function releaseKeys() {
	console.log("usb: <release keys>")
	// release special keys
	await send(Buffer.from([0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))
	// release regular keys
	await send(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))
}

async function pressSpecialCode(code, ms = 200) {
	// send the code
	await sendSpecialCode(code)

	// hold special key for specified ms
	await sleep(ms)

	// release all keys
	await releaseKeys()
}
async function sendSpecialCode(code) {
	console.log("usb: send special code:", code)
	// release regular keys
	await send(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))
	// press special code
	await send(Buffer.from([0x02, code, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))
}

export async function pressMute() {
	await pressSpecialCode(CODE_MUTE)
}

export async function pressPlay() {
	await pressSpecialCode(CODE_PLAY)
}

export async function pressVolumeDown() {
	await pressSpecialCode(CODE_VOLUME_DOWN)
}

export async function pressVolumeUp() {
	await pressSpecialCode(CODE_VOLUME_UP)
}

export async function holdVolumeDown() {
	await sendSpecialCode(CODE_VOLUME_DOWN)
}

export async function holdVolumeUp() {
	await sendSpecialCode(CODE_VOLUME_UP)
}

// #echo 'get ready...'
// #sleep 1
// #echo 'now!'
// #echo -ne "\0\0\0\0\0\0\0\0" > /dev/hidg0
// #sleep 0.2

// #bytearray(b'\x02\x10\x00\x00\x00\x00\x00\x00')
// #bytearray(b'\x00\x00\x00\x00\x00\x00\x00\x00')
// #bytearray(b'\x02\x00\x00\x00\x00\x00\x00\x00')
// #bytearray(b'\x00\x00\x00\x00\x00\x00\x00\x00')

// echo -ne "\x02\x10\0\0\0\0\0\0" > /dev/hidg0
// echo -ne "\0\0\0\0\0\0\0\0" > /dev/hidg0
// sleep 0.2
// echo -ne "\x02\0\0\0\0\0\0\0" > /dev/hidg0
// echo -ne "\0\0\0\0\0\0\0\0" > /dev/hidg0
// #sleep 1
// #echo 'clear'
// #echo -ne "\0\0\0\0\0\0\0\0" > /dev/hidg0
// #sleep 1
// #echo "done"
