import {
	ILoadOptionsFunctions,
	IHttpRequestOptions,
	IExecuteFunctions,
	IHttpRequestMethods,
	IDataObject,
} from 'n8n-workflow';
import { base64Decode } from './base64Utils';

export const DEFAULT_API_HOST = 'https://cloud.yepcode.io';

export async function getYepCodeCredentials(
	this: ILoadOptionsFunctions | IExecuteFunctions,
): Promise<{ apiToken: string; apiHost: string }> {
	const yepCodeApiCredentials = await this.getCredentials('yepCodeApi');
	return {
		apiToken: yepCodeApiCredentials.apiToken.toString(),
		apiHost: yepCodeApiCredentials.apiHost
			? yepCodeApiCredentials.apiHost.toString()
			: DEFAULT_API_HOST,
	};
}

async function obtainAccessToken(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	apiHost: string,
	teamId: string,
	apiToken: string,
): Promise<string> {
	try {
		const options: IHttpRequestOptions = {
			method: 'POST',
			url: `${apiHost}/api/${teamId}/rest/auth/token`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'x-api-token': apiToken,
			},
			body: 'grant_type=client_credentials',
		};

		const response = await this.helpers.httpRequest(options);
		return response.access_token;
	} catch (error: any) {
		throw new Error(`Authentication failed: ${error.message}`);
	}
}

/**
 * Make an API request to YepCode
 *
 */
export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	{
		method = 'GET',
		endpoint,
		headers = {},
		body,
		query = {},
	}: {
		method?: IHttpRequestMethods;
		endpoint: string;
		headers?: IDataObject;
		body?: any;
		query?: IDataObject;
	},
) {
	const { apiToken, apiHost } = await getYepCodeCredentials.call(this);

	const decodedToken = base64Decode(apiToken.substring(3));
	const [clientId, clientSecret] = decodedToken.split(':');
	if (!clientId || !clientSecret) {
		throw new Error('Invalid apiToken format: ' + apiToken);
	}

	let teamId;
	const match = clientId.match(/^sa-(.*)-[a-z0-9]{8}$/);
	if (match) {
		teamId = match[1];
	}
	if (!teamId) {
		throw new Error('Invalid clientId format: ' + clientId);
	}

	const accessToken = await obtainAccessToken.call(this, apiHost, teamId, apiToken);
	const options: IHttpRequestOptions = {
		method,
		url: `${apiHost}/api/${teamId}/rest/${endpoint}`,
		body,
		qs: query,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
			...headers,
		},
	};

	return await this.helpers.httpRequest(options);
}
