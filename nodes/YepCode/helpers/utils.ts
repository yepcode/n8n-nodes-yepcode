export function cleanWorkflowData(obj: any): any {
	delete obj['$input'];
	delete obj['$json'];
	delete obj['$itemIndex'];
	delete obj['$now'];
	delete obj['$today'];
	delete obj['$thisItem'];
	delete obj['$thisItemIndex'];
	delete obj['$thisRunIndex'];
	delete obj['$data'];
	delete obj['$parameter'];
	delete obj['$rawParameter'];

	return removeFunctions(obj);
}

function removeFunctions(obj: any): any {
	if (obj === null || obj === undefined) {
		return obj;
	}

	if (typeof obj === 'function') {
		return undefined;
	}

	if (Array.isArray(obj)) {
		return obj.map(removeFunctions).filter((item) => item !== undefined);
	}

	if (typeof obj === 'object') {
		const cleaned: any = {};
		for (const [key, value] of Object.entries(obj)) {
			const cleanedValue = removeFunctions(value);
			if (cleanedValue !== undefined) {
				cleaned[key] = cleanedValue;
			}
		}
		return cleaned;
	}

	return obj;
}
