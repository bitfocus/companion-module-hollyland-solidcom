import { InstanceBase, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { configFields } from './config.js'
import { upgradeScripts } from './upgrade.js'
import { getFeedbacks } from './feedbacks.js'
import { getActions } from './actions.js'
import { SolidcomAPI } from './solidcom.js'
import { getPresets } from './presets.js'

class SolidComHTTP extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.headsets = []
		this.variableDefinitions = []
		this.variableValues = {}
		this.pollTimer = null
		this.solidcom = new SolidcomAPI(this)
		this.updateQueue = Promise.resolve() // Queue for sequential updates
	}

	async configUpdated(config) {
		this.config = config
		this.variableDefinitions = []
		this.variableValues = {}

		this.initActions()
		this.initFeedbacks()
		this.initPresets()

		this.stopPolling()

		this.updateStatus(InstanceStatus.Connecting)
		this.connectToDevice()
	}

	async init(config) {
		this.config = config
		this.variableDefinitions = []
		this.variableValues = {}

		this.initActions()
		this.initFeedbacks()
		this.initPresets()

		this.updateStatus(InstanceStatus.Connecting)
		this.connectToDevice()
	}

	async connectToDevice() {
		const loginResult = await this.solidcom.login()

		if (loginResult) {
			this.updateStatus(InstanceStatus.Ok)
			await this.refreshVariables()
			this.startPolling()
		} else {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Login failed')
			this.stopPolling()
		}
	}

	async refreshVariables() {
		this.log('debug', 'Refreshing variables from device')

		// Fetch pack info
		const result = await this.solidcom.getAllPackInfo()
		if (result) {
			this.variableDefinitions = result.variableDefinitions
			this.variableValues = result.variableValues
			this.setVariableDefinitions(this.variableDefinitions)
			this.setVariableValues(this.variableValues)
			this.log('info', `Variables refreshed successfully (${this.variableDefinitions.length} variables)`)
		} else {
			this.log('warn', 'Failed to refresh pack info')
		}

		// Fetch roles data
		await this.solidcom.getBaseStationRoles()

		// Re-initialize actions, feedbacks, and presets to update dynamic dropdowns
		this.initActions()
		this.initFeedbacks()
		this.initPresets()

		// Trigger feedback updates after variables change
		this.checkFeedbacks()
	}

	startPolling() {
		this.stopPolling() // Clear any existing timer

		const pollInterval = this.config.pollInterval || 5000 // Default 5 seconds

		if (pollInterval > 0) {
			this.log('debug', `Starting variable polling every ${pollInterval}ms`)
			this.pollTimer = setInterval(() => {
				this.refreshVariables()
			}, pollInterval)
		}
	}

	stopPolling() {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
			this.log('debug', 'Stopped variable polling')
		}
	}

	// Return config fields for web config
	getConfigFields() {
		return configFields
	}

	// When module gets deleted
	async destroy() {
		this.stopPolling()
	}

	async setHeadsetName(headsetId, newHeadsetName) {
		this.updateQueue = this.updateQueue.then(async () => {
			try {
				this.log('debug', 'Refreshing cache')
				const result = await this.solidcom.getAllPackInfo()
				const packData = result.packData

				const data = JSON.parse(JSON.stringify(packData))
				const baseStation = data[0] // Fix, assuming single base station
				const headset = baseStation.PP.find(headset => headset.id === headsetId)

				// Update the headset name
				headset.name = newHeadsetName

				await this.solidcom.setPackInfo(data)
				this.log('info', `Renamed headset Id ${headsetId} to "${newHeadsetName}"`)

				// Update the cached data with the new state
				// this.ppInfoData = data

				// Re-initialize actions, feedbacks, and presets to update dropdown
				// this.initActions()
				// this.initFeedbacks()
				// this.initPresets()

				// Trigger feedback updates to show the new state
				this.checkFeedbacks()

				return true
			} catch (e) {
				this.log('error', `Failed to update headset: ${e.message}`)
				return false
			}
		})

		return this.updateQueue
	}

	async setHeadsetChannel(headsetName, channelPosition, comPosition) {
		this.updateQueue = this.updateQueue.then(async () => {
			try {
				this.log('debug', 'Refreshing cache')
				const result = await this.solidcom.getAllPackInfo()
				const packData = result.packData

				const data = JSON.parse(JSON.stringify(packData))
				const baseStation = data[0] // Fix, assuming single base station
				const headset = baseStation.PP.find(headset => headset.name === headsetName)

				// Remove existing COM
				for (let i = 0; i < headset.channel.length; i++) {
					if (headset.channel[i] === comPosition) {
						headset.channel[i] = ""
					}
				}

				// Assign COM to channel
				const channelIndex = parseInt(channelPosition) - 1
				if (parseInt(channelPosition) !== 0) { // 0 = "None"
					headset.channel[channelIndex] = comPosition
					this.log('info', `Assigned COM ${comPosition} to CH${channelPosition}`)
				} else {
					this.log('info', `Cleared COM ${comPosition} from headset "${headsetName}"`)
				}

				await this.solidcom.setPackInfo(data)

				// Trigger feedback updates to show the new state
				this.checkFeedbacks()

				return true
			} catch (e) {
				this.log('error', `Failed to update headset: ${e.message}`)
				return false
			}
		})

		return this.updateQueue
	}

	async setHeadsetRole(headsetName, roleName, isHead) {
		const rolesData = await this.solidcom.getBaseStationRoles()
		const roleData = rolesData.find(role => role.name === roleName)

		// Update the headset role
		this.updateQueue = this.updateQueue.then(async () => {
			try {
				this.log('debug', 'Refreshing cache')
				const result = await this.solidcom.getAllPackInfo()
				const packData = result.packData

				const data = JSON.parse(JSON.stringify(packData))
				const baseStation = data[0] // Fix, assuming single base station
				const headset = baseStation.PP.find(headset => headset.name === headsetName)

				// Update the headset role
				headset.role.id = roleData.id
				headset.role.name = roleData.name
				headset.role.head = isHead ? 1 : 0

				await this.solidcom.setPackInfo(data)
				this.log('info', `Set headset "${headsetName}" role to "${roleName}"${isHead ? ' (Head)' : ''}`)

				// Trigger feedback updates to show the new state
				this.checkFeedbacks()

				// Trigger a refresh by sending the specific role to the base station
				try {
					const roleToUpdate = rolesData.find(r => r.id === roleData.id)
					if (roleToUpdate) {
						// Send just this role with takeEffect flag
						const roleUpdate = {
							...roleToUpdate,
							head: isHead ? 1 : 0,
							takeEffect: 1
						}
						await this.solidcom.setBaseStationRole(roleUpdate)
					}
				} catch (e) {
					this.log('warn', `Failed to refresh base station roles: ${e.message}`)
				}

				return true
			} catch (e) {
				this.log('error', `Failed to update headset: ${e.message}`)
				return false
			}
		})

		return this.updateQueue
	}
	async setHeadsetTalkMode(headsetName, talkMode) {
		this.updateQueue = this.updateQueue.then(async () => {
			try {
				this.log('debug', 'Refreshing cache')
				const result = await this.solidcom.getAllPackInfo()
				const packData = result.packData

				const data = JSON.parse(JSON.stringify(packData))
				const baseStation = data[0] // Fix, assuming single base station
				const headset = baseStation.PP.find(headset => headset.name === headsetName)

				// Update the headset talk mode
				headset.talkMode = parseInt(talkMode)

				await this.solidcom.setPackInfo(data)
				this.log('info', `Set headset "${headsetName}" talk mode to ${talkMode}`)


				// Trigger feedback updates to show the new state
				this.checkFeedbacks()

				return true
			} catch (e) {
				this.log('error', `Failed to update headset: ${e.message}`)
				return false
			}
		})

		return this.updateQueue
	}

	initActions() {
		this.setActionDefinitions(getActions(this))
	}

	initFeedbacks() {
		this.setFeedbackDefinitions(getFeedbacks(this))
	}

	initPresets() {
		this.setPresetDefinitions(getPresets(this))
	}
}

runEntrypoint(SolidComHTTP, upgradeScripts)
