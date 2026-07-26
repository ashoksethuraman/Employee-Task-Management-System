# Serverless Example (Azure Functions)

This folder demonstrates how backend capability can be deployed in an Azure serverless model.

## Included

- Azure Functions HTTP trigger (Node.js 20)
- Stateless task-event endpoint
- Azure deployment configuration (azure.yaml)

## Files

- azure-functions-task-events/src/taskEvents.ts
- azure-functions-task-events/host.json
- azure-functions-task-events/azure.yaml
- azure-functions-task-events/package.json

## Local build steps

1. Install dependencies:

```bash
cd serverless-example/azure-functions-task-events
npm install
```

2. Build TypeScript:

```bash
npm run build
```

3. Deploy with Azure Developer CLI (if configured):

```bash
azd auth login
azd up
```

This is a proof-of-capability artifact for badge submission to demonstrate serverless-ready backend design.
