import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { loadOptions, resourceMapping } from './methods';
import * as runProcess from './actions/runProcess.operation';
import * as runCode from './actions/runCode.operation';

export class YepCode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'YepCode',
		name: 'yepCode',
		icon: 'file:yepcode.svg',
		group: ['output'],
		version: 1,
		description: 'Invoke YepCode processes',
		subtitle: '={{$parameter["operation"] + ": " + $parameter["process"]}}',
		defaults: {
			name: 'YepCode',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		parameterPane: 'wide',
		credentials: [
			{
				name: 'yepCodeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Run Process',
						value: 'run_process',
						description:
							'Move your complex business logic into yep code processes and trigger them from your workflows using dynamic input parameters it s the most flexible way to connect with your ap is and services using real code with zero dev ops overhead',
						action: 'Run process',
					},
					{
						name: 'Run Code',
						value: 'run_code',
						description:
							'A lightweight, flexible way to execute Node.js or Python code on demand — directly from your workflows or AI agents. The run_code tool runs in secure cloud sandboxes with full support for NPM and PyPI dependencies (https://yepcode.io/docs/dependencies), access to secrets, APIs, and databases. Perfect for quick scripts, dynamic logic, or AI-generated code.',
						action: 'Run code',
					},
				],
				default: 'run_process',
			},
			...runProcess.description,
			...runCode.description,
		],
	};

	methods = { loadOptions, resourceMapping };

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				switch (operation) {
					case 'run_process':
						returnData = await runProcess.execute.call(this, items);
						break;
					case 'run_code':
						returnData = await runCode.execute.call(this, items);
						break;
				}
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(i)[0].json, error, pairedItem: i });
				} else {
					if (error.context) {
						error.context.itemIndex = i;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex: i,
					});
				}
			}
		}

		return [returnData];
	}
}
