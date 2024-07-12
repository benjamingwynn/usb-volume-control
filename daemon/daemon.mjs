/** @format */
import {getChipNumber, watchPin} from "./gpio.mjs"
import {pressMute, pressPlay, holdVolumeDown, holdVolumeUp, releaseKeys, pressVolumeDown, pressVolumeUp} from "./usb.mjs"

// main program
const volumeUpPin = 20
const volumeDownPin = 21
const holdTime = 500
const chipNumber = await getChipNumber()

let event = null
let eventFired = false

function queueEvent() {
	if (event) {
		console.log("event already queued, bailing")
		return
	}
	eventFired = false
	event = setTimeout(() => {
		eventFired = true
		theEvent().then(() => {
			event = null
		})
	}, holdTime)
}
function discardEvent() {
	clearTimeout(event)
	event = null
}

let volumeDownHeld = false
let volumeUpHeld = false

async function theEvent() {
	if (volumeDownHeld && volumeUpHeld) {
		console.log("pressing play/pause because both buttons are pressed")
		await pressPlay()
	} else if (volumeDownHeld) {
		console.log("i should now start holding the vol down key")
		holdVolumeDown()
	} else if (volumeUpHeld) {
		console.log("i should now start holding the vol up key")
		holdVolumeUp()
	} else {
		console.log("**** WTF this shouldn't happen!! ****")
	}
}

watchPin(chipNumber, volumeDownPin, async (held) => {
	volumeDownHeld = held
	if (held) {
		queueEvent()
	} else {
		if (eventFired) {
			await releaseKeys()
		} else {
			discardEvent()
			await pressVolumeDown()
		}
	}
})

watchPin(chipNumber, volumeUpPin, async (held) => {
	volumeUpHeld = held
	if (held) {
		queueEvent()
	} else {
		if (eventFired) {
			await releaseKeys()
		} else {
			discardEvent()
			await pressVolumeUp()
		}
	}
})
