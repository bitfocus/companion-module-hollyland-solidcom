import got from 'got'
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent'
import { InstanceStatus } from '@companion-module/base'

/**
 * SolidcomAPI - Handles all HTTP requests to the Hollyland Solidcom device
 */
export class SolidcomAPI {
	constructor(instance) {
		this.instance = instance
		this.cachedPpData = null
		this.cachedRolesData = null
	}

	/**
	 * Login to the Solidcom device and store the session cookie
	 */
	async login() {
		if (!this.instance.config.ipAddress || !this.instance.config.username || !this.instance.config.password) {
			this.instance.log('error', 'Missing required configuration: IP address, username or password')
			this.instance.updateStatus(InstanceStatus.BadConfig, 'Missing required configuration')
			return null
		}

		const url = `http://${this.instance.config.ipAddress}/action/login`
		const body = {
			username: this.instance.config.username,
			password: this.instance.config.password
		}

		const options = {
			form: body,
			headers: {
				'Cache-Control': 'no-cache',
				'Accept': '*/*',
				'User-Agent': 'Companion-Module/1.0'
			},
			https: {
				rejectUnauthorized: this.instance.config.rejectUnauthorized || false,
			},
			timeout: {
				request: 10000 // 10 second timeout
			}
		}

		// Add proxy support if configured
		if (this.instance.config.proxyAddress && this.instance.config.proxyAddress.length > 0) {
			options.agent = {
				http: new HttpProxyAgent({
					proxy: this.instance.config.proxyAddress
				}),
				https: new HttpsProxyAgent({
					proxy: this.instance.config.proxyAddress
				})
			}
		}

		try {
			this.instance.log('debug', `Sending login request to: ${url}`)

			const response = await got.post(url, options)

			this.instance.log('info', 'Login successful')

			// Store session cookie in instance property
			const setCookieHeader = response.headers['set-cookie']
			if (setCookieHeader) {
				this.instance.cookie = setCookieHeader
				this.instance.log('debug', `Session cookie stored`)
			}

			this.instance.updateStatus(InstanceStatus.Ok)
			return response
		} catch (e) {
			// Handle circular reference in error logging
			const errorMessage = e.message || 'Unknown error'
			const errorCode = e.code || 'UNKNOWN'

			if (e.name === 'TimeoutError' || errorCode === 'ETIMEDOUT') {
				this.instance.log('error', `Login request timed out - device may be unreachable at ${this.instance.config.ipAddress}`)
				this.instance.updateStatus(InstanceStatus.ConnectionFailure, 'Connection timeout')
			} else {
				this.instance.log('error', `Login failed: ${errorMessage}`)
				this.instance.updateStatus(InstanceStatus.ConnectionFailure, errorCode)
			}

			// Don't throw the error to avoid circular reference issues
			return null
		}
	}

	/**
	 * Get the base station role information
	 */
	// async getBsRole() {
	async getBaseStationRoles() {
		if (!this.instance.cookie) {
			this.instance.log('error', 'No session cookie available. Please login first.')
			this.instance.updateStatus(InstanceStatus.UnknownError, 'No session cookie')
			return null
		}

		const url = `http://${this.instance.config.ipAddress}/action/getBsRole`
		const options = {
			headers: {
				'Cookie': this.instance.cookie
			},
			timeout: {
				request: 10000 // 10 second timeout
			}
		}

		try {
			const response = await got.get(url, options)
			this.instance.log('debug', `Response status: ${response.statusCode}`)
			// this.instance.log('debug', `Response body: ${response.body}`)

			// Parse and return the roles data
			if (response.body && response.body.trim() !== '') {
				try {
					const data = JSON.parse(response.body)
					this.instance.log('debug', `Fetched ${data.length} roles from device`)
					this.cachedRolesData = data
					this.instance.updateStatus(InstanceStatus.Ok)
					return data
				} catch (e) {
					this.instance.log('error', `Failed to parse getBsRole response: ${e.message}`)
				}
			}

			this.instance.updateStatus(InstanceStatus.Ok)
			return null
		} catch (e) {
			this.instance.log('error', `HTTP GET Request failed (${e.message})`)
			this.instance.updateStatus(InstanceStatus.UnknownError, e.code)
			return null
		}
	}

	/**
	 * Get all pack (headset) information from the device
	 * Returns variable definitions and values for Companion
	 */
	// async getAllPpInfo() {
	async getAllPackInfo() {
		if (!this.instance.cookie) {
			this.instance.log('error', 'No session cookie available. Please login first.')
			this.instance.updateStatus(InstanceStatus.UnknownError, 'No session cookie')
			return null
		}

		const url = `http://${this.instance.config.ipAddress}/action/getAllPpInfo`
		const options = {
			headers: {
				'Cookie': this.instance.cookie
			},
			timeout: {
				request: 10000 // 10 second timeout
			}
		}

		try {
			const response = await got.get(url, options)
			this.instance.log('debug', `Response status: ${response.statusCode}`)
			// this.instance.log('debug', `Response body: ${response.body}`)
			let variableDefinitions = []
			let variableValues = {}

			const data = JSON.parse(response.body)
			
			// Filter the PP array to remove 4WIRE/UAC devices
			const packData = data.map(data => {
				return {
					...data,
					PP: data.PP.filter(data => {
						return data.name !== "4WIRE_IN" && 
						       data.name !== "4WIRE_OUT" && 
						       data.name !== "UAC_IN" && 
						       data.name !== "UAC_OUT"
					})
				}
			}).filter(bs => bs !== null)

			// Store the filtered data for use in other methods
			this.cachedPpData = packData

			for (const baseStation of packData) {
				let id = "BaseStation_" + baseStation.id
				variableDefinitions.push(
					{ name: `${id} - Name`, variableId: `${id}_Name` },
					{ name: `${id} - Online`, variableId: `${id}_Online` },
					{ name: `${id} - Cascade`, variableId: `${id}_Cascade` },
					{ name: `${id} - Roam`, variableId: `${id}_Roam` },
					{ name: `${id} - SN`, variableId: `${id}_SN` },
					{ name: `${id} - IP`, variableId: `${id}_IP` }
				)

				variableValues[`${id}_Name`] = baseStation.name
				variableValues[`${id}_Online`] = baseStation.online
				variableValues[`${id}_Cascade`] = baseStation.cascade
				variableValues[`${id}_Roam`] = baseStation.roam
				variableValues[`${id}_SN`] = baseStation.sn
				variableValues[`${id}_IP`] = baseStation.ip

				for (const headset of baseStation.PP) {

					let hsId = "Headset_" + headset.id
					variableDefinitions.push(
						{ name: `${hsId} - Name`, variableId: `${hsId}_Name` },
						{ name: `${hsId} - Online`, variableId: `${hsId}_Online` },
						{ name: `${hsId} - Cell`, variableId: `${hsId}_Cell` },
						{ name: `${hsId} - RSSI`, variableId: `${hsId}_RSSI` }
					)

					variableValues[`${hsId}_Name`] = headset.name
					variableValues[`${hsId}_Online`] = headset.online
					variableValues[`${hsId}_Cell`] = headset.cell
					variableValues[`${hsId}_RSSI`] = headset.rssi

					// Role is an object, not an array
					if (headset.role) {
						variableDefinitions.push(
							{ name: `${hsId} - Role ID`, variableId: `${hsId}_RoleID` },
							{ name: `${hsId} - Role Name`, variableId: `${hsId}_RoleName` },
							{ name: `${hsId} - Role Head`, variableId: `${hsId}_RoleHead` }
						)
						variableValues[`${hsId}_RoleID`] = headset.role.id
						variableValues[`${hsId}_RoleName`] = headset.role.name
						variableValues[`${hsId}_RoleHead`] = headset.role.head
					}

					// Create variables for each channel position
					if (headset.channel && Array.isArray(headset.channel)) {
						headset.channel.forEach((channel, index) => {
							const channelNum = index + 1
							variableDefinitions.push(
								{ name: `${hsId} - Channel ${channelNum}`, variableId: `${hsId}_Channel${channelNum}` }
							)
							variableValues[`${hsId}_Channel${channelNum}`] = channel || ''
						})

						// Create variables for each COM showing which channels are assigned to it
						const comOptions = ['A', 'B']
						comOptions.forEach(com => {
							variableDefinitions.push({
								name: `${hsId} - Com ${com} Channels`,
								variableId: `${hsId}_Com_${com}`
							})

							// Find all channels assigned to this COM
							let channelsForCom = []
							for (let i = 0; i < headset.channel.length; i++) {
								if (headset.channel[i] === com) {
									channelsForCom.push(i + 1)
								}
							}

							// Store as space-separated numbers like "1 3 5" or "-" if none
							variableValues[`${hsId}_Com_${com}`] = channelsForCom.length > 0 ? channelsForCom.join(' ') : '-'
						})
					}
				}
			}

			this.instance.updateStatus(InstanceStatus.Ok)
			// this.instance.log('debug', `Variable definitions: ${JSON.stringify(variableDefinitions)}`)
			// this.instance.log('debug', `Variable values: ${JSON.stringify(variableValues)}`)

			return { variableDefinitions, variableValues, packData }

		} catch (e) {
			this.instance.log('error', `HTTP GET Request failed (${e.message})`)
			this.instance.updateStatus(InstanceStatus.UnknownError, e.code)
			return null
		}
	}

	/**
	 * Set pack (headset) information on the device
	 * Takes the full data structure from getAllPpInfo with modifications
	 */
	// async setPpInfo(data) {
	async setPackInfo(data) {
		if (!this.instance.cookie) {
			this.instance.log('error', 'No session cookie available. Please login first.')
			this.instance.updateStatus(InstanceStatus.UnknownError, 'No session cookie')
			return null
		}

		const url = `http://${this.instance.config.ipAddress}/action/setPpInfo`
		const options = {
			headers: {
				'Cookie': this.instance.cookie,
				'Content-Type': 'application/json'
			},
			json: data,
			timeout: {
				request: 5000 // 5 second timeout
			},
			retry: {
				limit: 0
			}
		}

		try {
			this.instance.log('debug', `Sending setPpInfo request to: ${url}`)
			const response = await got.post(url, options)
			this.instance.log('debug', `Response status: ${response.statusCode}`)
			this.instance.updateStatus(InstanceStatus.Ok)
			return response
		} catch (e) {
			this.instance.log('error', `HTTP POST Request failed (${e.message})`)
			this.instance.updateStatus(InstanceStatus.UnknownError, e.code)
			return null
		}
	}

	/**
	 * Set base station role information
	 * Sends modified role data back to the device
	 */
	async setBaseStationRole(data) {
		if (!this.instance.cookie) {
			this.instance.log('error', 'No session cookie available. Please login first.')
			this.instance.updateStatus(InstanceStatus.UnknownError, 'No session cookie')
			return null
		}

		const url = `http://${this.instance.config.ipAddress}/action/setBsRole`
		const options = {
			headers: {
				'Cookie': this.instance.cookie,
				'Content-Type': 'application/json'
			},
			json: data,
			timeout: {
				request: 5000 // 5 second timeout
			},
			retry: {
				limit: 0
			}
		}

		try {
			this.instance.log('debug', `Sending setBsRole request to: ${url}`)
			const response = await got.post(url, options)
			this.instance.log('debug', `Response status: ${response.statusCode}`)
			this.instance.updateStatus(InstanceStatus.Ok)
			return response
		} catch (e) {
			this.instance.log('error', `HTTP POST Request failed (${e.message})`)
			this.instance.updateStatus(InstanceStatus.UnknownError, e.code)
			return null
		}
	}

	// Getter function to access the cached pack data
	getCachedPackData() {
		return this.cachedPpData
	}

	// Getter function to access the cached roles data
	getCachedRolesData() {
		return this.cachedRolesData
	}
}

