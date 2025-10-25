export function getPresets(instance) {
	const presets = {}

	const packData = instance.solidcom.getCachedPackData()

	if (!packData || !packData[0] || !packData[0].PP) {
		return presets
	}

	const headsets = packData[0].PP

	// Create presets for each headset
	headsets.forEach((headset) => {
		const headsetName = headset.name
		const headsetId = headset.id

		/* -------------------------------------------------------------------------- */
		/*                               HEADSET STATUS                               */
		/* -------------------------------------------------------------------------- */
		/* -------------------------- HEADSET ONLINE STATUS ------------------------- */
		presets[`headset_${headsetId}_online`] = {
			type: 'button',
			category: 'Headset Status',
			name: `${headsetName} - Online Status`,
			style: {
				text: `ID: ${headsetId}\\n$(Solidcom:Headset_${headsetId}_Name)\\nOnline`,
				size: 'auto',
			},
			feedbacks: [
				{
					feedbackId: 'headsetOnline',
					options: {
						useHeadsetId: true,
						headsetId: headsetId,
						onlineBg: 0x009000,
						offlineBg: 0xFF0000,
					},
				},
			],
			steps: [],
		}

		/* ------------------------------ VIEW CHANNELS ----------------------------- */
		presets[`headset_${headsetId}_view_status`] = {
			type: 'button',
			category: 'Headset Status',
			name: `${headsetName} - View Status`,
			style: {
				text: `ID: ${headsetId}\\n$(Solidcom:Headset_${headsetId}_Name)\\n[A:$(Solidcom:Headset_${headsetId}_Com_A)] [B:$(Solidcom:Headset_${headsetId}_Com_B)]`,
				size: '14',
				color: 0xFFFFFF,
				bgcolor: 0x000000,
			},
			feedbacks: [
				{
					feedbackId: 'headsetOnline',
					options: {
						useHeadsetId: true,
						headsetId: headsetId,
						onlineBg: 0x009000,
						offlineBg: 0xFF0000,
					},
				},
			],
			steps: [],
		}

		/* ------------------------------ HEADSET RSSI ------------------------------ */
		presets[`headset_${headsetId}_rssi`] = {
			type: 'button',
			category: 'Headset Status',
			name: `${headsetName} - RSSI`,
			style: {
				text: `ID: ${headsetId}\\n$(Solidcom:Headset_${headsetId}_Name)\\nRSSI: $(${instance.label}:Headset_${headsetId}_RSSI)`,
				size: 'auto',
			},
			feedbacks: [
				{
					feedbackId: 'headsetRSSI',
					options: {
						useHeadsetId: true,
						headsetId: headsetId,
						useText: true,
						showId: false,
						showName: true,
						showRSSI: true,
						rssi0bg: 0x929292,
						rssi0fg: 0xFFFFFF,
						rssi1bg: 0xFF0000,
						rssi1fg: 0xFFFFFF,
						rssi2bg: 0xFF8000,
						rssi2fg: 0xFFFFFF,
						rssi3bg: 0xFFFF00,
						rssi3fg: 0xFFFFFF,
						rssi4bg: 0x009000,
						rssi4fg: 0xFFFFFF,
					},
				},
			],
			steps: [],
		}

		/* ----------------------------- HEADSET BATTERY ---------------------------- */
		presets[`headset_${headsetId}_battery`] = {
			type: 'button',
			category: 'Headset Status',
			name: `${headsetName} - Battery`,
			style: {
				text: `ID: ${headsetId}\\n$(Solidcom:Headset_${headsetId}_Name)\\nBatt: $(${instance.label}:Headset_${headsetId}_Cell)`,
				size: 'auto',
			},
			feedbacks: [
				{
					feedbackId: 'headsetCell',
					options: {
						useHeadsetId: true,
						headsetId: headsetId,
						useText: true,
						showId: false,
						showName: true,
						cell1Bg: 0xCC0000,
						cell2Bg: 0xFF0000,
						cell3Bg: 0xFF8000,
						cell4Bg: 0xFFFF00,
						cell5Bg: 0x006600,
						cell6Bg: 0x009000,
						cell7Bg: 0x0000FF,
					},
				},
			],
			steps: [],
		}

		/* ------------------------------ HEADSET ROLE ------------------------------ */
		presets[`headset_${headsetId}_role`] = {
			type: 'button',
			category: 'Headset Status',
			name: `${headsetName} - Role`,
			style: {
				text: `ID: ${headsetId}\\n$(Solidcom:Headset_${headsetId}_Name)\\nRole: $(${instance.label}:Headset_${headsetId}_RoleName)`,
				size: 'auto',
			},
			feedbacks: [
				{
					feedbackId: 'headsetRole',
					options: {
						useHeadsetId: true,
						headsetId: headsetId,
						showId: false,
						showName: true,
					},
				},
			],
			steps: [],
		}



		/* -------------------------------------------------------------------------- */
		/*                             COM CHANNEL DISPLAY                            */
		/* -------------------------------------------------------------------------- */
		const comOptions = ['A', 'B']

		comOptions.forEach((com) => {
			presets[`headset_${headsetId}_com_${com.toLowerCase()}`] = {
				type: 'button',
				category: 'COM Channel Display',
				style: {
					text: `ID: ${headsetId}\\n$(Solidcom:Headset_${headsetId}_Name)\\n[${com}:$(${instance.label}:Headset_${headsetId}_Com_${com})]`,
					size: 'auto',
					color: 0xFFFFFF,
					bgcolor: 0x000000,
				},
				feedbacks: [
					{
						feedbackId: 'comChannel',
						options: {
							useHeadsetId: true,
							headsetId: headsetId,
							useText: true,
							showId: true,
							showName: true,
							com: com,
							channelPosition: 1,
							matchedBg: 0x000090,
						},
					},
				],
				steps: [],
			}
		})

		/* -------------------------------------------------------------------------- */
		/*                            SET HEADSET CHANNELS                            */
		/* -------------------------------------------------------------------------- */
		/* ---------------------------------- COM A --------------------------------- */
		presets[`headset_${headsetId}_set_com_a`] = {
			type: 'button',
			category: 'Set Headset Channels',
			style: {
				text: `ID:${headsetId}\\n$(Solidcom:Headset_${headsetId}_Name)\\n[Set A]`,
				size: 'auto',
				color: 0xFFFFFF,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'setHeadsetChannel',
							options: {
								useHeadsetId: true,
								headsetId: headsetId,
								channelPosition: 1,
								comPosition: 'A',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		/* ---------------------------------- COM B --------------------------------- */
		presets[`headset_${headsetId}_set_com_b`] = {
			type: 'button',
			category: 'Set Headset Channels',
			style: {
				text: `ID:${headsetId}\\n$(Solidcom:Headset_${headsetId}_Name)\\n[Set B]`,
				size: 'auto',
				color: 0xFFFFFF,
				bgcolor: 0x303030,
			},
			steps: [
				{
					down: [
						{
							actionId: 'setHeadsetChannel',
							options: {
								useHeadsetId: true,
								headsetId: headsetId,
								channelPosition: 2,
								comPosition: 'B',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	/* -------------------------------------------------------------------------- */
	/*                            SET HEADSET ROLES                                */
	/* -------------------------------------------------------------------------- */
	const rolesData = instance.solidcom.getCachedRolesData()
	if (rolesData && rolesData.length > 0) {
		const getRoleColors = (roleName) => {
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
			return { color, bgcolor }
		}

		headsets.forEach((headset) => {
			const headsetName = headset.name
			const headsetId = headset.id

			rolesData.forEach((role) => {
				const roleName = role.name
				const colors = getRoleColors(roleName)

				presets[`headset_${headsetId}_role_${role.id}`] = {
					type: 'button',
					category: 'Headset Roles',
					name: `${headsetName} - Set Role: ${roleName}`,
					style: {
						text: `ID: ${headsetId}\\n$(Solidcom:Headset_${headsetId}_Name)\\nRole: ${roleName}`,
						size: 'auto',
						color: colors.color,
						bgcolor: colors.bgcolor,
					},
					steps: [
						{
							down: [
								{
									actionId: 'setHeadsetRole',
									options: {
										useHeadsetId: true,
										headsetId: headsetId,
										roleName: roleName,
										isHead: false,
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [],
				}
			})
		})
	}

	return presets
}
