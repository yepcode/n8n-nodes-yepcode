import {
	FieldType,
	ILoadOptionsFunctions,
	ResourceMapperField,
	ResourceMapperFields,
} from 'n8n-workflow';
import { apiRequest } from '../transport';

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
	const ycProcess = await apiRequest.call(this, {
		method: 'GET',
		endpoint: `processes/${processId}`,
	});

	const properties = ycProcess.parametersSchema?.properties ?? {};
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
