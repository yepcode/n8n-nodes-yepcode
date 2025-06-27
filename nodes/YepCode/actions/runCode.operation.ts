import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	updateDisplayOptions,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';
import { getYepCodeCredentials } from '../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Code',
		name: 'code',
		type: 'string',
		required: true,
		typeOptions: {
			editor: 'jsEditor',
		},
		default:
			"const isOdd = require('is-odd');\n\nconst number = yepcode.context.parameters?.number || 3;\nconst result = isOdd(number);\nreturn { message: `${number} is ${result ? 'odd' : 'even'}` };",
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

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const options: IDataObject = {
				removeOnDone: false,
			};

			const showAdvanced = this.getNodeParameter('showAdvancedForRunCode', i) as boolean;
			if (showAdvanced) {
				options.language = this.getNodeParameter('language', i) as string;
				if (options.language === '') {
					delete options.language;
				}
				options.removeOnDone = this.getNodeParameter('removeOnDone', i) as boolean;
				options.initiatedBy = this.getNodeParameter('initiatedBy', i) as string;
				options.comment = this.getNodeParameter('comment', i) as string;
			}

			const code = this.getNodeParameter('code', i) as string;
			const { apiToken, apiHost } = await getYepCodeCredentials.call(this);
			const requestOptions: IHttpRequestOptions = {
				method: 'POST',
				url: `${apiHost}/run`,
				body: {
					code,
					options,
				},
				headers: {
					'Content-Type': 'application/json',
					accept: 'application/json',
					'x-api-token': apiToken,
				},
			};

			const execution = await this.helpers.httpRequest(requestOptions);
			const { id, logs, processId, status, returnValue, error, timeline, parameters, comment } =
				execution;
			returnData.push({
				json: { id, logs, processId, status, returnValue, error, timeline, parameters, comment },
			});
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
