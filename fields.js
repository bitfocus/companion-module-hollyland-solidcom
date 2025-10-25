function getHeadsetChoices(instance) {
	const choices = []
	// const data = instance.ppInfoData
	const data = instance.solidcom.getCachedPackData()
	
	if (data && data.length > 0) {
		const baseStation = data[0]
		if (baseStation && baseStation.PP) {
			for (const headset of baseStation.PP) {
				if (headset.type === 0) {
					choices.push({
						id: headset.name,
						label: `${headset.name} (ID: ${headset.id})`
					})
				}
			}
		}
	}

	if (choices.length === 0) {
		choices.push({ id: '', label: 'No headsets found - refresh variables first' })
	}
	
	return choices
}

function getRoleChoices(instance) {
	const choices = []
	const rolesData = instance.solidcom.getCachedRolesData()
	
	if (rolesData && rolesData.length > 0) {
		// Add all roles from the device
		rolesData.forEach(role => {
			if (role.name) {
				choices.push({
					id: role.name,
					label: role.name
				})
			}
		})
	}

	if (choices.length === 0) {
		// Fallback if no roles data available
		choices.push({ id: '', label: 'No roles found - refresh variables first' })
	}
	
	return choices
}

export const FIELDS = {
	headsetDropdown: (instance, id = 'headsetName') => ({
		type: 'dropdown',
		label: 'Headset Name',
		id: id,
		default: getHeadsetChoices(instance)[0]?.id || '',
		choices: getHeadsetChoices(instance),
	}),
	channelDropdown: (id = 'channelPosition') => ({
		type: 'dropdown',
		label: 'Channel',
		id: id,
		default: 1,
		choices: [
			{ id: 1, label: 'CH 1' },
			{ id: 2, label: 'CH 2' },
			{ id: 3, label: 'CH 3' },
			{ id: 4, label: 'CH 4' },
			{ id: 5, label: 'CH 5' },
			{ id: 6, label: 'CH 6' },
			{ id: 0, label: 'None' },
		],
	}),
	comDropdown: (id = 'comPosition') => ({
		type: 'dropdown',
		label: 'Intercom',
		id: id,
		default: 'A',
		choices: [
			{ id: 'A', label: 'COM A' },
			{ id: 'B', label: 'COM B' },
		],
	}),
	headsetId: (id = 'headsetId') => ({
		type: 'textinput',
		label: 'Headset ID',
		id: id,
		default: '1',
		useVariables: true,
	}),
	showCheckbox: (label, id, defaultValue) => ({
		type: 'checkbox',
		label: label,
		id: id,
		default: defaultValue,
	}),
	colorpicker: (label, id, defaultValue) => ({
		type: 'colorpicker',
		label: label,
		id: id,
		default: defaultValue,
	}),
	roleDropdown: (instance, id = 'roleName') => ({
		type: 'dropdown',
		label: 'Role',
		id: id,
		default: getRoleChoices(instance)[0]?.id || '',
		choices: getRoleChoices(instance),
		useVariables: true,
	}),
	talkModeDropdown: (id = 'talkMode') => ({
		type: 'dropdown',
		label: 'Talk Mode',
		id: id,
		default: 1,
		choices: [
			{ id: 2, label: 'Talk & Listen' },
			{ id: 3, label: 'Talk & Force Listen' },
			{ id: 1, label: 'PTT & Force Listen' },
		],
	}),
}
