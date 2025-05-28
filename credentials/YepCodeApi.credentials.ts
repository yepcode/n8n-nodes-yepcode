import { YepCodeApiConfig } from '@yepcode/run';
import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeProperties,
} from 'n8n-workflow';

const DEFAULT_API_HOST = 'https://cloud.yepcode.io';

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

export async function getYepCodeApiOptions(
	this: ILoadOptionsFunctions | IExecuteFunctions,
): Promise<YepCodeApiConfig> {
	const yepCodeApiCredentials = await this.getCredentials('yepCodeApi');
	return {
		apiToken: yepCodeApiCredentials.apiToken.toString(),
		apiHost: yepCodeApiCredentials.apiHost
			? yepCodeApiCredentials.apiHost.toString()
			: DEFAULT_API_HOST,
	};
}
