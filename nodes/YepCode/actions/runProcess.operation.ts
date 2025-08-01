import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	updateDisplayOptions,
	IDataObject,
	CodeExecutionMode,
} from 'n8n-workflow';
import { apiRequest } from '../transport';
import { cleanWorkflowData } from '../helpers/utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Run Once for All Items',
				value: 'runOnceForAllItems',
				description: 'Run this code only once, no matter how many input items there are',
			},
			{
				name: 'Run Once for Each Item',
				value: 'runOnceForEachItem',
				description: 'Run this code as many times as there are input items',
			},
		],
		default: 'runOnceForAllItems',
	},
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
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
		displayName: 'Add n8n Context as Parameters',
		name: 'addN8nContext',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				showAdvanced: [true],
			},
		},
		description:
			'Whether to add the n8n context to the execution. When enabled, your code will receive n8n data via yepcode.context.parameters.n8n containing input items and workflow metadata (environment variables, execution info, etc.).',
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

async function executeProcess(
	this: IExecuteFunctions,
	params: {
		processId: string;
		parameters: IDataObject[];
		versionOrAlias: string;
		comment: string;
		synchronous: boolean;
		headers: IDataObject;
	},
) {
	const endpoint = params.synchronous
		? `processes/${params.processId}/execute-sync`
		: `processes/${params.processId}/execute`;

	return await apiRequest.call(this, {
		method: 'POST',
		endpoint,
		headers: params.headers,
		body: {
			parameters: JSON.stringify(params.parameters),
			tag: params.versionOrAlias,
			comment: params.comment,
		},
	});
}

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const node = this.getNode();

	const nodeMode = this.getNodeParameter('mode', 0) as CodeExecutionMode;
	const processId = this.getNodeParameter('process', 0) as string;

	const parameters = this.getNodeParameter('parameters.value', 0, []) as IDataObject[];

	const showAdvanced = this.getNodeParameter('showAdvanced', 0) as boolean;
	const addN8nContext = showAdvanced
		? (this.getNodeParameter('addN8nContext', 0) as boolean)
		: true;
	const version = showAdvanced ? (this.getNodeParameter('version', 0) as string) : '$CURRENT';
	const versionOrAlias = version === '$CURRENT' ? '' : version;
	const synchronous = showAdvanced ? (this.getNodeParameter('synchronous', 0) as boolean) : true;
	const comment = showAdvanced ? (this.getNodeParameter('comment', 0) as string) : '';
	const initiatedBy = showAdvanced ? (this.getNodeParameter('initiatedBy', 0) as string) : '';
	const headers: IDataObject = {};
	if (initiatedBy) {
		headers['Yep-Initiated-By'] = initiatedBy;
	}

	const inputDataItems = this.getInputData();
	if (nodeMode === 'runOnceForAllItems') {
		let result;
		const metadata = cleanWorkflowData(this.getWorkflowDataProxy(0));
		const allParameters = addN8nContext
			? { ...parameters, n8n: { items: inputDataItems, metadata } }
			: parameters;
		let returnData: INodeExecutionData[] = [];
		try {
			result = await executeProcess.call(this, {
				processId,
				parameters: allParameters,
				versionOrAlias,
				comment,
				synchronous,
				headers,
			});
		} catch (error) {
			if (!this.continueOnFail()) {
				(error as any).node = node;
				throw error;
			}
			returnData = [{ json: { error: error.message } }];
		}

		if (result) {
			returnData.push({ json: result });
		}
		return returnData;
	}

	let returnData: INodeExecutionData[] = [];
	for (let index = 0; index < inputDataItems.length; index++) {
		let result;
		const metadata = cleanWorkflowData(this.getWorkflowDataProxy(index));
		const allParameters = addN8nContext
			? { ...parameters, n8n: { items: [inputDataItems[index]], metadata } }
			: parameters;
		try {
			result = await executeProcess.call(this, {
				processId,
				parameters: allParameters,
				versionOrAlias,
				comment,
				synchronous,
				headers,
			});
		} catch (error) {
			if (!this.continueOnFail()) {
				(error as any).node = node;
				throw error;
			}
			returnData.push({
				json: { error: error.message },
				pairedItem: {
					item: index,
				},
			});
		}

		if (result) {
			returnData.push({
				json: result,
				pairedItem: { item: index },
				...(result.binary && { binary: result.binary }),
			});
		}
	}

	return returnData;
}
