import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { YepCodeApi } from '@yepcode/run';

export async function getProcesses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const yepCodeApiCredentials = await this.getCredentials('yepCodeApi');
	const api = new YepCodeApi({ apiToken: yepCodeApiCredentials.token.toString() });
	const processes = await api.getProcesses();
	for (const process of processes.data || []) {
		returnData.push({
			name: process.name,
			value: process.id,
		});
	}
	return returnData;
}

export async function getProcessVersionAliases(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [
		{
			name: '$CURRENT',
			value: '$CURRENT',
		},
	];

	const processId = this.getCurrentNodeParameter('process') as string;
	if (!processId) {
		return returnData;
	}

	const yepCodeApiCredentials = await this.getCredentials('yepCodeApi');
	const api = new YepCodeApi({ apiToken: yepCodeApiCredentials.token.toString() });

	const versions = await api.getProcessVersions(processId);
	for (const version of versions.data || []) {
		returnData.push({
			name: version.id,
			value: version.id,
		});
	}

	const aliases = await api.getProcessVersionAliases(processId);
	for (const alias of aliases.data || []) {
		returnData.push({
			name: `${alias.name} (${alias.versionId})`,
			value: alias.versionId,
		});
	}

	return returnData;
}
