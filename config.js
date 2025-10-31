import { Regex } from "@companion-module/base";

export const configFields = [
	{
		type: 'static-text',
		id: 'info',
		width: 12,
		label: 'Information',
		value:
			"Hollyland Solidcom devices store credentials in plain text. Use at your own risk!",
	},
	{
		type: 'textinput',
		id: 'ipAddress',
		label: 'Device IP Address',
		width: 6,
		default: '192.168.218.10',
		regex: Regex.IP,
	},
	{
		type: 'textinput',
		id: 'username',
		label: 'Device Username',
		width: 6,
		default: 'admin',
	},
	{
		type: 'textinput',
		id: 'password',
		label: 'Device Password',
		width: 12,
		default: '12345678',
	},
	{
		type: 'number',
		id: 'pollInterval',
		label: 'Variable Polling Interval (ms)',
		tooltip: 'How often to refresh variables from the device. Set to 0 to disable automatic polling.',
		width: 12,
		default: 5000,
		min: 0,
		max: 60000,
	}
]
