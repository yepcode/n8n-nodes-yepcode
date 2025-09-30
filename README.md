![YepCode Image](https://cdn.prod.website-files.com/632cd328ed2b485519c3f689/68303b945a8746ed63f24a99_yepcode-cover-dev-tool-ai-solutions.png)

# n8n-nodes-yepcode

This is an n8n community node that enables you to use [YepCode](https://yepcode.io/l/DqsDT) within your n8n workflows.

Easily execute AI-generated code in a secure, scalable environment with full support for dependencies, secrets, logs, and access to APIs or databases—all on a developer-first platform designed to create any integration or automation without DevOps complexity.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### 1. Run a YepCode Process

Execute a specific YepCode process by selecting it from your YepCode workspace. This operation allows you to run pre-built processes with parameter mapping and advanced execution options.

**Key Features:**
- **Process Selection**: Choose from your available YepCode processes with searchable dropdown
- **Parameter Mapping**: Map n8n input data to process parameters using a visual resource mapper
- **Version Control**: Select specific process versions or use the current version
- **Execution Modes**:
  - **Run Once for All Items**: Execute the process once with all input items
  - **Run Once for Each Item**: Execute the process separately for each input item
- **Synchronous/Asynchronous**: Choose whether to wait for execution completion
- **n8n Context Integration**: Automatically pass n8n workflow data to your process

**Advanced Options:**
- **Version Selection**: Run specific published versions of your process
- **Synchronous Execution**: Wait for completion and get results immediately
- **Metadata**: Add execution comments and initiator information
- **n8n Context**: Include workflow metadata, environment variables, and execution info

**Example Use Cases:**
- AI/ML model inference
- Data transformation processes
- API integrations with complex logic
- File processing workflows
- Database operations

### 2. Run Code

Directly execute custom JavaScript or Python code in YepCode from your n8n workflow. This operation provides maximum flexibility for custom logic execution.

**Key Features:**
- **Multi-language Support**: Write code in JavaScript (Node.js) or Python
- **Auto-dependency Management**: Import any NPM or PyPI package - YepCode installs them automatically
- **n8n Integration**: Access n8n input items and workflow metadata directly in your code
- **Execution Modes**:
  - **Run Once for All Items**: Process all input items in a single execution
  - **Run Once for Each Item**: Execute code separately for each input item
- **Secure Environment**: Code runs in YepCode's isolated, secure environment

**Advanced Options:**
- **Language Detection**: Auto-detect code language or specify manually
- **Code Cleanup**: Option to remove code after execution
- **Metadata**: Add execution comments and initiator information
- **n8n Context**: Include workflow data and metadata in your code execution

**Example Use Cases:**
- Custom data transformations
- Complex calculations
- API aggregations
- Data validation
- Custom business logic
- Integration with external services

## Coding Rules

Review the [YepCode Coding Rules](https://yepcode.io/docs/yepcode-coding-rules) to make code compatible with our platform.

## Credentials

Authentication is required to use this node. You'll need your YepCode API token, which you can find in your YepCode workspace under `Settings > API credentials`. For YepCode On-Premise, you may also specify a custom API host.

1. Sign up for [YepCode Cloud](https://yepcode.io/l/DqsDT).
2. Get your API token from `Settings > API credentials` in your YepCode workspace.
3. Create your n8n credential using this token.
4. (Optional) Enter a custom API host if using YepCode On-Premise.

## Usage

### Setting Up Credentials

1. In your YepCode workspace, go to `Settings > API credentials`
2. Copy your API token
3. In n8n, create a new credential for the YepCode node
4. Paste your API token
5. (Optional) Set a custom API host for YepCode On-Premise

### Using Run Process Operation

1. **Add the YepCode node** to your workflow
2. **Select "Run Process"** as the operation
3. **Choose your process** from the dropdown (searchable)
4. **Configure parameters** using the resource mapper to map n8n data to process inputs
5. **Set execution mode**:
   - **Run Once for All Items**: Process all items together
   - **Run Once for Each Item**: Process each item individually
6. **Configure advanced options** (optional):
   - Enable/disable n8n context integration
   - Select specific process version
   - Set synchronous/asynchronous execution

### Using Run Code Operation

1. **Add the YepCode node** to your workflow
2. **Select "Run Code"** as the operation
3. **Write your code** in the code editor (JavaScript or Python)
4. **Set execution mode**:
   - **Run Once for All Items**: Process all items together
   - **Run Once for Each Item**: Process each item individually
5. **Configure advanced options** (optional):
   - Specify language (auto-detected by default)
   - Enable/disable n8n context integration
   - Set code cleanup options

**Example JavaScript Code:**
```javascript
// Import any npm package - YepCode will install it automatically
const { DateTime } = require("luxon");

const { n8n } = yepcode.context.parameters;

const results = [];
for (const item of n8n.items) {
  results.push({
    ...item.json,
    processedAt: DateTime.now().toISO(),
    transformed: item.json.data * 2
  });
}

// Access n8n metadata
console.log("Environment:", n8n.metadata);

return results;
```

**Example Python Code:**
```python
# Import any PyPI package - YepCode will install it automatically
from datetime import datetime

# Access n8n context
n8n = yepcode.context.parameters['n8n']

results = []
for item in n8n['items']:
    # Process each item
    processed_item = {
        **item['json'],
        'processed_at': datetime.now().isoformat(),
        'status': 'completed'
    }
    results.append(processed_item)

# Access n8n metadata
print("Environment:", n8n['metadata'])
print("Execution ID:", n8n['metadata']['$execution']['id'])

return results
```

### Accessing n8n Context

Both operations can include n8n context data in your YepCode execution:

- **Input Items**: All data from previous nodes in your workflow
- **Workflow Metadata**: Environment variables, execution information, and workflow details
- **Execution Context**: Current execution ID, resume URLs, and other runtime information

### Error Handling

- **Continue on Fail**: Enable this option to continue workflow execution even if YepCode operations fail
- **Error Information**: Failed executions return detailed error information in the output
- **Logs**: Access execution logs through the YepCode dashboard or API

For more information on using n8n community nodes, see the [n8n documentation](https://docs.n8n.io/integrations/#community-nodes). If you are new to n8n, you can get started with the [Try it out](https://docs.n8n.io/try-it-out/) guide.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [YepCode official docs](https://docs.yepcode.io/)
* [YepCode Coding Rules](https://yepcode.io/docs/yepcode-coding-rules)
