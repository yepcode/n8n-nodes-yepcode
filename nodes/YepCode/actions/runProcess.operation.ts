import { YepCodeApi } from '@yepcode/run';
import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	updateDisplayOptions,
	IDataObject,
} from 'n8n-workflow';
import { getYepCodeApiOptions } from '../../../credentials/YepCodeApi.credentials';

const properties: INodeProperties[] = [
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Process',
		name: 'process',
		type: 'options',
		typeOptions: {
			searchable: true,
			loadOptionsMethod: 'getProcesses',
		},
		default: '',
		required: true,
		description:
			'The YepCode process to run. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Parameters',
		name: 'parameters',
		type: 'resourceMapper',
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		typeOptions: {
			loadOptionsDependsOn: ['process'],
			resourceMapper: {
				valuesLabel: 'Parameters',
				resourceMapperMethod: 'getProcessFormSchema',
				mode: 'map',
				supportAutoMap: false,
				showTypeConversionOptions: false,
			},
		},
		description: 'Map input data to the process form',
	},
	{
		displayName: 'Show Advanced Options',
		name: 'showAdvanced',
		type: 'boolean',
		default: false,
	},
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Version',
		name: 'version',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getProcessVersionAliases',
			loadOptionsDependsOn: ['process'],
		},
		displayOptions: {
			show: {
				showAdvanced: [true],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-options
		default: '$CURRENT',
		description:
			'Specify a version tag to run a particular published version of the process. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Synchronous',
		name: 'synchronous',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				showAdvanced: [true],
			},
		},
		description:
			"Whether to wait for the execution to finish or not. If false, the execution result won't be available.",
	},
	{
		displayName: 'Initiated By',
		name: 'initiatedBy',
		type: 'string',
		displayOptions: {
			show: {
				showAdvanced: [true],
			},
		},
		default: '',
		description: 'A meta attribute to identify who initiated the execution',
	},
	{
		displayName: 'Comment',
		name: 'comment',
		type: 'string',
		displayOptions: {
			show: {
				showAdvanced: [true],
			},
		},
		default: '',
		description: 'A meta attribute to add a comments to the execution',
	},
];

const displayOptions = {
	show: {
		operation: ['run_process'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const apiOptions = await getYepCodeApiOptions.call(this);
			const api = new YepCodeApi(apiOptions);

			const processId = this.getNodeParameter('process', i) as string;

			const parameters = this.getNodeParameter('parameters.value', i, []) as IDataObject[];
			const payload = { ...parameters };

			const showAdvanced = this.getNodeParameter('showAdvanced', i) as boolean;
			const version = showAdvanced ? (this.getNodeParameter('version', i) as string) : '$CURRENT';
			const versionOrAlias = version === '$CURRENT' ? '' : version;
			const synchronous = showAdvanced
				? (this.getNodeParameter('synchronous', i) as boolean)
				: true;
			const comment = showAdvanced ? (this.getNodeParameter('comment', i) as string) : '';
			const initiatedBy = showAdvanced ? (this.getNodeParameter('initiatedBy', i) as string) : '';

			let result;
			if (!synchronous) {
				result = await api.executeProcessAsync(processId, payload, {
					tag: versionOrAlias,
					comment,
					initiatedBy,
				});
			} else {
				result = await api.executeProcessSync(processId, payload, {
					tag: versionOrAlias,
					comment,
					initiatedBy,
				});
			}
			returnData.push({ json: result });
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: { message: error.message, error }, pairedItem: { item: i } });
				continue;
			} else {
				throw error;
			}
		}
	}

	return returnData;
}
