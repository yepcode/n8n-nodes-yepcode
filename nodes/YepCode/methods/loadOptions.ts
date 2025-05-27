import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { YepCodeApi } from '@yepcode/run';
import { getYepCodeApiOptions } from '../../../credentials/YepCodeApi.credentials';

export async function getProcesses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const apiOptions = await getYepCodeApiOptions.call(this);
	const api = new YepCodeApi(apiOptions);
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

	const apiOptions = await getYepCodeApiOptions.call(this);
	const api = new YepCodeApi(apiOptions);

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
