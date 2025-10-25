import { FIELDS } from './fields.js'

export function getFeedbacks(instance) {
	return {
		headsetOnline: {
			type: 'advanced',
			name: 'Headset Online Status',
			description: 'Changes button style when the specified headset is online',
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
				FIELDS.colorpicker('Online - Background Color', 'onlineBg', 0x009000),
				FIELDS.colorpicker('Offline - Background Color', 'offlineBg', 0xFF0000),
			],
			callback: (feedback) => {
				let headsetId, headsetName

				// Get headset ID and name based on selection mode
				if (feedback.options.useHeadsetId) {
					headsetId = parseInt(feedback.options.headsetId)
					headsetName = instance.getVariableValue(`Headset_${headsetId}_Name`)
				} else {
					headsetName = feedback.options.headsetName
					headsetId = instance.ppInfoData?.[0]?.PP?.find(pp => pp.name === headsetName)?.id
				}

				if (!headsetId) return {}

				const onlineValue = instance.getVariableValue(`Headset_${headsetId}_Online`)

				// Check if online
				const isOnline = onlineValue === 1

				// Build result with colors
				let result = {
					bgcolor: isOnline ? feedback.options.onlineBg : feedback.options.offlineBg
				}

				return result
			},
		},
		headsetRSSI: {
			// RSSI is Value between 0 and 4
			type: 'advanced',
			name: 'Headset RSSI Level',
			description: 'Changes button style based on headset signal strength (0=no signal, 4=excellent)',
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
				FIELDS.colorpicker('RSSI: 0 (No Signal) - Background Color', 'rssi0bg', 0x929292),
				FIELDS.colorpicker('RSSI: 0 (No Signal) - Text Color', 'rssi0fg', 0xFFFFFF),
				FIELDS.colorpicker('RSSI: 1 (Poor) - Background Color', 'rssi1bg', 0xFF0000),
				FIELDS.colorpicker('RSSI: 1 (Poor) - Text Color', 'rssi1fg', 0xFFFFFF),
				FIELDS.colorpicker('RSSI: 2 (Fair) - Background Color', 'rssi2bg', 0xFF8000),
				FIELDS.colorpicker('RSSI: 2 (Fair) - Text Color', 'rssi2fg', 0xFFFFFF),
				FIELDS.colorpicker('RSSI: 3 (Good) - Background Color', 'rssi3bg', 0xFFFF00),
				FIELDS.colorpicker('RSSI: 3 (Good) - Text Color', 'rssi3fg', 0x000000),
				FIELDS.colorpicker('RSSI: 4 (Excellent) - Background Color', 'rssi4bg', 0x009000),
				FIELDS.colorpicker('RSSI: 4 (Excellent) - Text Color', 'rssi4fg', 0xFFFFFF),
			],
			callback: (feedback, context) => {
				let headsetId, headsetName

				// Get headset ID and name based on selection mode
				if (feedback.options.useHeadsetId) {
					headsetId = parseInt(feedback.options.headsetId)
					headsetName = instance.getVariableValue(`Headset_${headsetId}_Name`)
				} else {
					headsetName = feedback.options.headsetName
					headsetId = instance.ppInfoData?.[0]?.PP?.find(pp => pp.name === headsetName)?.id
				}

				if (!headsetId) return {}

				const variableName = `Headset_${headsetId}_RSSI`
				const rssiValue = instance.getVariableValue(variableName)

				const rssi = parseInt(rssiValue)

				// Build the result object with colors
				let result = {}

				// Determine colors based on RSSI level (0-4)
				if (isNaN(rssi) || rssi === 0) {
					result.color = feedback.options.rssi0fg
					result.bgcolor = feedback.options.rssi0bg
				} else if (rssi === 1) {
					result.color = feedback.options.rssi1fg
					result.bgcolor = feedback.options.rssi1bg
				} else if (rssi === 2) {
					result.color = feedback.options.rssi2fg
					result.bgcolor = feedback.options.rssi2bg
				} else if (rssi === 3) {
					result.color = feedback.options.rssi3fg
					result.bgcolor = feedback.options.rssi3bg
				} else if (rssi === 4) {
					result.color = feedback.options.rssi4fg
					result.bgcolor = feedback.options.rssi4bg
				} else {
					// Default - Gray
					result.color = 0xFFFFFF
					result.bgcolor = 0x666666
				}

				return result
			},
		},
		headsetRole: {
			type: 'advanced',
			name: 'Headset Role',
			description: 'Changes button style based on headset role',
			options: [
				FIELDS.showCheckbox('Use Headset ID', 'useHeadsetId', false),
				{
					...FIELDS.headsetId('headsetId'),
					isVisible: (options) => options.useHeadsetId === true,
				}
			],
			callback: (feedback) => {
				let headsetId, headsetName

				// Get headset ID and name based on selection mode
				if (feedback.options.useHeadsetId) {
					headsetId = parseInt(feedback.options.headsetId)
					headsetName = instance.getVariableValue(`Headset_${headsetId}_Name`)
				} else {
					headsetName = feedback.options.headsetName
					headsetId = instance.ppInfoData?.[0]?.PP?.find(pp => pp.name === headsetName)?.id
				}

				if (!headsetId) return {}

				const roleName = instance.getVariableValue(`Headset_${headsetId}_RoleName`)

				// Color based on role
				let color = 0xFFFFFF
				let bgcolor = 0x000000
				if (roleName === 'Production') {
					color = 0xFFFFFF
					bgcolor = 0xFF0000
				} else if (roleName === 'CamA') {
					color = 0xFFFFFF
					bgcolor = 0xFF8000
				} else if (roleName === 'CamB') {
					color = 0xFFFFFF
					bgcolor = 0xFF8000
				} else if (roleName === 'Lighting') {
					color = 0x000000
					bgcolor = 0xFFFF00
				} else if (roleName === 'Grip') {
					color = 0xFFFFFF
					bgcolor = 0x009000
				} else if (roleName === 'Unassigned') {
					color = 0xFFFFFF
					bgcolor = 0x666666
				}

				let result = { color: color, bgcolor: bgcolor }

				return result
			},
		},
		comChannel: {
			type: 'advanced',
			name: 'COM Channel Display',
			description: 'Shows which channel positions are assigned to a specific COM',
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
				FIELDS.comDropdown('com'),
				FIELDS.channelDropdown('channelPosition'),
				FIELDS.colorpicker('Matched - Background Color', 'matchedBg', 0x000090),
			],
			callback: (feedback) => {
				let headsetId, headsetName

				// Get headset ID and name based on selection mode
				if (feedback.options.useHeadsetId) {
					headsetId = parseInt(feedback.options.headsetId)
					headsetName = instance.getVariableValue(`Headset_${headsetId}_Name`)
				} else {
					headsetName = feedback.options.headsetName
					headsetId = instance.ppInfoData?.[0]?.PP?.find(pp => pp.name === headsetName)?.id
				}

				if (!headsetId) return {}

				const selectedCom = feedback.options.com

				// Check all channels (1-6) for the selected COM
				let activeChannels = []
				for (let ch = 1; ch <= 6; ch++) {
					const actualChannel = instance.getVariableValue(`Headset_${headsetId}_Channel${ch}`)
					if (actualChannel === selectedCom) {
						activeChannels.push(ch)
					}
				}

				// Check if the selected channel is in the active channels
				const selectedChannel = parseInt(feedback.options.channelPosition)
				const isMatched = activeChannels.includes(selectedChannel)

				let result = {}

				if (isMatched) {
					result.bgcolor = feedback.options.matchedBg
				}

				return result
			},
		},
		headsetCell: {
			type: 'advanced',
			name: 'Headset Cell',
			description: 'Changes button style based on headset Battery Level (1-7)',
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
				FIELDS.colorpicker('Cell 1 - Background Color', 'cell1Bg', 0xCC0000),
				FIELDS.colorpicker('Cell 2 - Background Color', 'cell2Bg', 0xFF0000),
				FIELDS.colorpicker('Cell 3 - Background Color', 'cell3Bg', 0xFF8000),
				FIELDS.colorpicker('Cell 4 - Background Color', 'cell4Bg', 0xFFFF00),
				FIELDS.colorpicker('Cell 5 - Background Color', 'cell5Bg', 0x006600),
				FIELDS.colorpicker('Cell 6 - Background Color', 'cell6Bg', 0x009000),
				FIELDS.colorpicker('Cell 7 - Background Color', 'cell7Bg', 0x0000FF),
			],
			callback: (feedback) => {
				let headsetId, headsetName

				// Get headset ID and name based on selection mode
				if (feedback.options.useHeadsetId) {
					headsetId = parseInt(feedback.options.headsetId)
					headsetName = instance.getVariableValue(`Headset_${headsetId}_Name`)
				} else {
					headsetName = feedback.options.headsetName
					headsetId = instance.ppInfoData?.[0]?.PP?.find(pp => pp.name === headsetName)?.id
				}

				if (!headsetId) return {}

				const cell = instance.getVariableValue(`Headset_${headsetId}_Cell`)

				// Determine background color based on cell value
				let bgcolor = 0x666666 // Default gray
				const cellNum = parseInt(cell)

				if (cellNum === 1) {
					bgcolor = feedback.options.cell1Bg
				} else if (cellNum === 2) {
					bgcolor = feedback.options.cell2Bg
				} else if (cellNum === 3) {
					bgcolor = feedback.options.cell3Bg
				} else if (cellNum === 4) {
					bgcolor = feedback.options.cell4Bg
				} else if (cellNum === 5) {
					bgcolor = feedback.options.cell5Bg
				} else if (cellNum === 6) {
					bgcolor = feedback.options.cell6Bg
				} else if (cellNum === 7) {
					bgcolor = feedback.options.cell7Bg
				}

				let result = {
					color: 0xFFFFFF,
					bgcolor: bgcolor
				}

				return result
			},
		},
	}
}

