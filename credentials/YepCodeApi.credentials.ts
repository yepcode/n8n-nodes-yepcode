import { YepCodeApiConfig } from '@yepcode/run';
import {
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
			displayName: 'Token',
			name: 'token',
			type: 'string',
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
				'The YepCode API host to use. This is useful if you are using a self-hosted YepCode instance.',
		},
	];
}

export async function getYepCodeApiOptions(
	this: ILoadOptionsFunctions | IExecuteFunctions,
): Promise<YepCodeApiConfig> {
	const yepCodeApiCredentials = await this.getCredentials('yepCodeApi');
	return {
		apiToken: yepCodeApiCredentials.token.toString(),
		apiHost: yepCodeApiCredentials.apiHost
			? yepCodeApiCredentials.apiHost.toString()
			: DEFAULT_API_HOST,
	};
}
