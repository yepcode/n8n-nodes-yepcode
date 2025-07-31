import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	updateDisplayOptions,
	IHttpRequestOptions,
	IDataObject,
	CodeExecutionMode,
} from 'n8n-workflow';
import { getYepCodeCredentials } from '../transport';
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
		displayName: 'Code',
		name: 'code',
		type: 'string',
		required: true,
		typeOptions: {
			editor: 'jsEditor',
		},
		default:
			"// Import any npm package - YepCode will install it automatically\nconst { DateTime } = require(\"luxon\");\n\nconst { n8n } = yepcode.context.parameters;\n\nconst results = [];\nfor (const item of n8n.items) {\n  results.push({\n    ...item.json,\n    processedAt: DateTime.now().toISO(),\n  });\n}\n\n// Access n8n metadata - check all available fields at: https://docs.n8n.io/code/builtin/n8n-metadata/\nconsole.log(\"Environment:\", n8n.metadata);\nconsole.log(\"Resume URL:\", n8n.metadata[\"$execution\"].resumeUrl);\n\nreturn results;",
		description:
			"The source's code to execute. It can be a JavaScript or Python code, and it will be executed in the YepCode environment. You can import any NPM or PyPI package and it will be installed automatically (see <a href='https://yepcode.io/docs/processes/source-code'>YepCode docs</a> for more details).",
	},
	{
		displayName: 'Show Advanced Options',
		name: 'showAdvancedForRunCode',
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
				showAdvancedForRunCode: [true],
			},
		},
		description:
			'Whether to add the n8n context to the execution. When enabled, your code will receive n8n data via yepcode.context.parameters.n8n containing input items and workflow metadata (environment variables, execution info, etc.).',
	},
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Language',
		name: 'language',
		type: 'options',
		description: "The source's code language. Optional as we'll try to detect it automatically.",
		options: [
			{
				name: 'Auto',
				value: '',
			},
			{
				name: 'JavaScript',
				value: 'javascript',
			},
			{
				name: 'Python',
				value: 'python',
			},
		],
		default: '',
		displayOptions: {
			show: {
				showAdvancedForRunCode: [true],
			},
		},
	},
	{
		displayName: 'Remove on Done',
		name: 'removeOnDone',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				showAdvancedForRunCode: [true],
			},
		},
		description: 'Whether to remove the source code after execution or keep it',
	},
	{
		displayName: 'Initiated By',
		name: 'initiatedBy',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				showAdvancedForRunCode: [true],
			},
		},
		description: 'A meta attribute to identify who initiated the execution',
	},
	{
		displayName: 'Comment',
		name: 'comment',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				showAdvancedForRunCode: [true],
			},
		},
		description: 'A meta attribute to add a comments to the execution',
	},
];

const displayOptions = {
	show: {
		operation: ['run_code'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

async function executeCode(
	this: IExecuteFunctions,
	params: {
		apiHost: string;
		apiToken: string;
		code: string;
		options: IDataObject;
	},
) {
	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: `${params.apiHost}/run`,
		body: {
			code: params.code,
			options: params.options,
		},
		headers: {
			'Content-Type': 'application/json',
			accept: 'application/json',
			'x-api-token': params.apiToken,
		},
	};

	return this.helpers.httpRequest(requestOptions);
}

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const node = this.getNode();
	let returnData: INodeExecutionData[] = [];

	const options: IDataObject = {
		removeOnDone: false,
	};

	const nodeMode = this.getNodeParameter('mode', 0) as CodeExecutionMode;
	let addN8nContext = false;
	const showAdvanced = this.getNodeParameter('showAdvancedForRunCode', 0) as boolean;
	if (showAdvanced) {
		options.language = this.getNodeParameter('language', 0) as string;
		if (options.language === '') {
			delete options.language;
		}
		options.removeOnDone = this.getNodeParameter('removeOnDone', 0) as boolean;
		options.initiatedBy = this.getNodeParameter('initiatedBy', 0) as string;
		options.comment = this.getNodeParameter('comment', 0) as string;
		addN8nContext = this.getNodeParameter('addN8nContext', 0) as boolean;
	}

	const code = this.getNodeParameter('code', 0) as string;
	const { apiToken, apiHost } = await getYepCodeCredentials.call(this);

	const inputDataItems = this.getInputData();
	if (nodeMode === 'runOnceForAllItems') {
		const metadata = cleanWorkflowData(this.getWorkflowDataProxy(0));
		if (addN8nContext) {
			options.parameters = { n8n: { items: inputDataItems, metadata } };
		}
		try {
			const execution = await executeCode.call(this, {
				apiHost,
				apiToken,
				code,
				options,
			});
			const { id, logs, processId, status, returnValue, error, timeline, parameters, comment } =
				execution;
			returnData.push({
				json: { id, logs, processId, status, returnValue, error, timeline, parameters, comment },
			});
		} catch (error) {
			if (!this.continueOnFail()) {
				(error as any).node = node;
				throw error;
			}
			returnData = [{ json: { error: error.message } }];
		}
		return returnData;
	}

	for (let index = 0; index < inputDataItems.length; index++) {
		const metadata = cleanWorkflowData(this.getWorkflowDataProxy(index));
		if (addN8nContext) {
			options.parameters = { n8n: { items: [inputDataItems[index]], metadata } };
		}
		try {
			const execution = await executeCode.call(this, {
				apiHost,
				apiToken,
				code,
				options,
			});
			const { id, logs, processId, status, returnValue, error, timeline, parameters, comment } =
				execution;
			returnData.push({
				json: { id, logs, processId, status, returnValue, error, timeline, parameters, comment },
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
	}

	return returnData;
}
