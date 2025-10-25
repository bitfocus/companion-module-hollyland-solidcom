import { FIELDS } from './fields.js'

export function getActions(instance) {
	return {
	setHeadsetName: {
		name: 'Set Headset Name',
		options: [ FIELDS.headsetId('headsetId'),
			{
				type: 'textinput',
				label: 'New Name',
				id: 'newHeadsetName',
				default: '',
				useVariables: true,
			},
		],
		callback: async (action, context) => {
			const headsetId = parseInt(action.options.headsetId)
			const newHeadsetName = await context.parseVariablesInString(action.options.newHeadsetName)
			await instance.setHeadsetName(headsetId, newHeadsetName)
		},
	},
	setHeadsetChannel: {
		name: 'Set Headset Channel',
		options: [
			FIELDS.showCheckbox('Use Headset ID', 'useHeadsetId', false),
			{
				...FIELDS.headsetId('headsetId'),
				isVisible: (options) => options.useHeadsetId === true,
			},
			{
				...FIELDS.headsetDropdown(instance, 'headsetName'),
				isVisible: (options) => options.useHeadsetId !== true,
			},
			FIELDS.comDropdown(),
			FIELDS.channelDropdown(),
		],
		callback: async (action, context) => {
			let headsetName = action.options.headsetName
			
			// If using ID, convert ID to name
			if (action.options.useHeadsetId) {
				const headsetId = parseInt(action.options.headsetId)
				const headset = instance.ppInfoData?.[0]?.PP?.find(headset => headset.id === headsetId)
				headsetName = headset.name
			}

			// if (action.options.channelPosition.label === 'None') {

			// }
			
			const channelPosition = action.options.channelPosition
			const comPosition = action.options.comPosition
			await instance.setHeadsetChannel(headsetName, channelPosition, comPosition)
		},
	},
	setHeadsetRole: {
		name: 'Set Headset Role',
		options: [
			FIELDS.showCheckbox('Use Headset ID', 'useHeadsetId', false),
			{
				...FIELDS.headsetId('headsetId'),
				isVisible: (options) => options.useHeadsetId === true,
			},
			{
				...FIELDS.headsetDropdown(instance, 'headsetName'),
				isVisible: (options) => options.useHeadsetId !== true,
			},
		FIELDS.roleDropdown(instance),
		{
			...FIELDS.showCheckbox('Head', 'isHead', false),
			isVisible: (options) => {
				const validRoles = ['Lighting', 'CamA', 'CamB', 'Production', 'Grip']
				return validRoles.includes(options.roleName)
			},
		},
	],
		callback: async (action, context) => {
			let headsetName = action.options.headsetName
			
			// If using ID, convert ID to name
			if (action.options.useHeadsetId) {
				const headsetId = parseInt(action.options.headsetId)
				const headset = instance.ppInfoData?.[0]?.PP?.find(pp => pp.id === headsetId)
				if (headset) {
					headsetName = headset.name
				} else {
					instance.log('error', `Headset with ID ${headsetId} not found`)
					return
				}
			}
			
			const roleName = await context.parseVariablesInString(action.options.roleName)
			const isHead = action.options.isHead
			await instance.setHeadsetRole(headsetName, roleName, isHead)
		},
	},
	setHeadsetTalkMode: {
		name: 'Set Headset Talk Mode',
		options: [
			FIELDS.showCheckbox('Use Headset ID', 'useHeadsetId', false),
			{
				...FIELDS.headsetId('headsetId'),
				isVisible: (options) => options.useHeadsetId === true,
			},
			{
				...FIELDS.headsetDropdown(instance, 'headsetName'),
				isVisible: (options) => options.useHeadsetId !== true,
			},
			FIELDS.talkModeDropdown(),
		],
		callback: async (action, context) => {
			let headsetName = action.options.headsetName
			
			// If using ID, convert ID to name
			if (action.options.useHeadsetId) {
				const headsetId = parseInt(action.options.headsetId)
				const headset = instance.ppInfoData?.[0]?.PP?.find(pp => pp.id === headsetId)
				if (headset) {
					headsetName = headset.name
				} else {
					instance.log('error', `Headset with ID ${headsetId} not found`)
					return
				}
			}
			
			const talkMode = action.options.talkMode
			await instance.setHeadsetTalkMode(headsetName, talkMode)
		},
	},
	}
}