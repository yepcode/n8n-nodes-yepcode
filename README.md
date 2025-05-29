![YepCode Image](https://cdn.prod.website-files.com/632cd328ed2b485519c3f689/68303b945a8746ed63f24a99_yepcode-cover-dev-tool-ai-solutions.png)

# n8n-nodes-yepcode

This is an n8n community node that enables you to use [YepCode](https://yepcode.io) within your n8n workflows.

Easily execute AI-generated code in a secure, scalable environment with full support for dependencies, secrets, logs, and access to APIs or databases—all on a developer-first platform designed to create any integration or automation without DevOps complexity.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

1. Run a YepCode Process: Execute a specific YepCode process by selecting it from your YepCode workspace. Supports passing parameters, version selection, and advanced options such as synchronous/asynchronous execution.
2. Run Code: Directly execute custom code in YepCode from your n8n workflow, with full support for dependencies and secrets.

## Credentials

Authentication is required to use this node. You'll need your YepCode API token, which you can find in your YepCode workspace under `Settings > API credentials`. For YepCode On-Premise, you may also specify a custom API host.

1. Sign up for [YepCode Cloud](https://cloud.yepcode.io).
2. Get your API token from `Settings > API credentials` in your YepCode workspace.
3. Create your n8n credential using this token.
4. (Optional) Enter a custom API host if using YepCode On-Premise.

## Usage

To use this node, add it to your n8n workflow and configure the required fields, such as selecting the YepCode process or entering your custom code. Make sure your credentials are set up as described above. For more information on using n8n community nodes, see the [n8n documentation](https://docs.n8n.io/integrations/#community-nodes). If you are new to n8n, you can get started with the [Try it out](https://docs.n8n.io/try-it-out/) guide.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [YepCode official docs](https://docs.yepcode.io/)
