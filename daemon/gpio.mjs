/**
 * GPIO functions in JS for Raspberry Pi
 * @format
 * @author Benjamin Gwynn <git@benjamingwynn.com>
 */

import path from "node:path"
import fs from "node:fs"
import fsp from "node:fs/promises"

const root = "/sys/class/gpio"
const knownGoodPins = new Set()

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}

/** exports the pin if its not already exported */
export async function exportPin(chip, pin) {
	if (knownGoodPins.has(chip + pin)) {
		// known good
		return
	}

	// only export the pin if it doesn't already exist
	if (fs.existsSync(getGpioPath(chip, pin))) {
		console.log("already exported")
		knownGoodPins.add(chip + pin)
		return
	}

	// https://stackoverflow.com/a/39637569/3754229
	const exportNumber = String(chip + pin)
	console.log("export:", exportNumber)
	await fsp.writeFile(path.join(root, "export"), exportNumber)
	await sleep(1000) // wait for setup
	console.log("success")
	knownGoodPins.add(chip + pin)
}

/** gets the path to the gpio path for the chip + pin */
function getGpioPath(chip, pin) {
	const exportNumber = chip + pin
	return path.join(root, `gpio${exportNumber}`)
}

/** reads the pin as a boolean */
export async function readPin(chip, pin) {
	await exportPin(chip, pin)
	const gpio = getGpioPath(chip, pin)
	const result = (await fsp.readFile(path.join(gpio, "value"))).subarray(0, -1) // <- remove the trailing /n byte
	// console.log("value of", gpio, ":", `"${result.toString()}"`)
	return Boolean(+result.toString())
}

/** watches the pin for changes, returns promise for dispose callback */
export async function watchPin(chip, pin, callback) {
	await exportPin(chip, pin)
	const gpio = getGpioPath(chip, pin)

	// tell kernel to watch edges
	await fsp.writeFile(path.join(gpio, "edge"), "both")

	const watchPath = path.join(gpio, "value")
	let lastValue = undefined
	const listener = fs.watch(watchPath, async () => {
		// changed, so read:
		const value = await readPin(chip, pin)
		if (value === lastValue) {
			// ignore
			return
		}
		lastValue = value
		// console.log("[!]", gpio, "changed to:", value)
		callback(value)
	})
	console.log("now watching:", watchPath)

	const disposer = () => {
		listener.close()
	}

	return disposer
}

export async function getChipNumber() {
	const inGpio = await fsp.readdir(root)
	const gpiochip = inGpio.find((file) => file.startsWith("gpiochip"))

	if (!gpiochip) {
		throw new Error("Could not find gpiochip")
	}

	return +gpiochip.replace("gpiochip", "")
}
