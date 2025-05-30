import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';
import { DEFAULT_API_HOST } from '../nodes/YepCode/transport';

export class YepCodeApi implements ICredentialType {
	name = 'yepCodeApi';
	displayName = 'YepCode API';
	documentationUrl = 'https://yepcode.io/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			description:
				"Find your API Token in the YepCode dashboard under the 'Settings -> API Credentials' section.",
			default: '',
			typeOptions: {
				password: true,
			},
		},
		{
			displayName: 'API Host',
			name: 'apiHost',
			type: 'string',
			default: DEFAULT_API_HOST,
			description:
				"The YepCode API host to use (default: https://cloud.yepcode.io). It can be customized for YepCode On-Premise instances.",
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-token': '={{$credentials.apiToken}}',
			},
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.apiHost}}',
			url: '/run/whoami',
		},
	};
}
