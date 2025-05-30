import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { apiRequest } from '../transport';

export async function getProcesses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const processes = await apiRequest.call(this, {
		endpoint: 'processes',
		query: { limit: 200 },
	});
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

	const versions = await apiRequest.call(this, {
		endpoint: `processes/${processId}/versions`,
		query: { limit: 200 },
	});
	for (const version of versions.data || []) {
		returnData.push({
			name: version.id,
			value: version.id,
		});
	}

	const aliases = await apiRequest.call(this, {
		endpoint: `processes/${processId}/aliases`,
		query: { limit: 200 },
	});
	for (const alias of aliases.data || []) {
		returnData.push({
			name: `${alias.name} (${alias.versionId})`,
			value: alias.versionId,
		});
	}

	return returnData;
}
