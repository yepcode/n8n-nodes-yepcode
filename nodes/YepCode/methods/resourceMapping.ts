import { YepCodeApi } from '@yepcode/run';
import {
	FieldType,
	ILoadOptionsFunctions,
	ResourceMapperField,
	ResourceMapperFields,
} from 'n8n-workflow';
import { getYepCodeApiOptions } from '../../../credentials/YepCodeApi.credentials';

function mapJsonSchemaType(jsonPropertyType: string): FieldType {
	switch (jsonPropertyType) {
		case 'string':
			return 'string';
		case 'number':
		case 'integer':
			return 'number';
		case 'boolean':
			return 'boolean';
		case 'object':
			return 'object';
		default:
			return 'string';
	}
}

function mapJsonProperty(key: string, property: any): ResourceMapperField {
	return {
		id: key,
		type: mapJsonSchemaType(property.type),
		displayName: property.title || key,
		defaultMatch: true,
		required: property.required || false,
		display: true,
	};
}

export async function getProcessFormSchema(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {
	const processId = this.getNodeParameter('process') as string;
	if (!processId) {
		return { fields: [] };
	}
	const apiOptions = await getYepCodeApiOptions.call(this);
	const api = new YepCodeApi(apiOptions);
	const process = await api.getProcess(processId);

	const properties = process.parametersSchema?.properties ?? {};
	if (!properties || Object.keys(properties).length === 0) {
		return { fields: [] };
	}

	const fields: ResourceMapperField[] = [];
	Object.entries(properties).forEach(([key, property]: [string, any]) => {
		const field = mapJsonProperty(key, property);
		fields.push(field);
	});
	return { fields };
}
