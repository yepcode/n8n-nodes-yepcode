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
		description:
			'YepCode lets you run full processes or dynamic scripts using Node.js or Python, with support for any NPM or PyPI dependency. All in a secure, sandboxed environment.',
		subtitle:
			'={{$parameter["operation"] + ($parameter["process"] !== undefined ? (": " + $parameter["process"]) : "")}}',
		defaults: {
			name: 'YepCode',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		parameterPane: 'wide',
		usableAsTool: true,
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
							'Move your complex business logic into YepCode processes and trigger them from your workflows using dynamic input parameters. It is the most flexible way to connect with your app and services using real code with zero dev ops overhead.',
						action: 'Run process',
					},
					{
						name: 'Run Code',
						value: 'run_code',
						description:
							'A lightweight, flexible way to execute Node.js or Python code on demand — directly from your workflows or AI agents. The run_code tool runs in secure cloud sandboxes with full support for NPM and PyPI dependencies, access to secrets, APIs, and databases. Perfect for quick scripts, dynamic logic, or AI-generated code. Review the [YepCode Coding Rules](https://yepcode.io/docs/yepcode-coding-rules) to make code compatible with our platform.',
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
		let returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0);

		switch (operation) {
			case 'run_process':
				returnData = await runProcess.execute.call(this);
				break;
			case 'run_code':
				returnData = await runCode.execute.call(this);
				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported!`,
				);
		}

		return [returnData];
	}
}
