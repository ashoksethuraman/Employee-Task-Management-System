import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

function readYamlSpec(specPath: string): Record<string, unknown> {
  const contents = fs.readFileSync(specPath, 'utf8');
  const parsed = YAML.parse(contents);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid YAML spec content: ${specPath}`);
  }
  return parsed as Record<string, unknown>;
}

export function setupApiDocs(app: Express): void {
  const docsDir = path.resolve(process.cwd(), 'docs');
  const openApiPath = path.join(docsDir, 'openapi.yaml');
  const asyncApiPath = path.join(docsDir, 'asyncapi.yaml');

  if (!fs.existsSync(openApiPath)) {
    throw new Error(`OpenAPI file not found: ${openApiPath}`);
  }

  const openApiDocument = readYamlSpec(openApiPath);

  app.get('/api/docs/openapi.yaml', (_req: Request, res: Response) => {
    res.type('application/yaml').sendFile(openApiPath);
  });

  app.get('/api/docs/asyncapi.yaml', (_req: Request, res: Response) => {
    if (!fs.existsSync(asyncApiPath)) {
      return res.status(404).json({ message: 'AsyncAPI spec not found' });
    }
    return res.type('application/yaml').sendFile(asyncApiPath);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument as any, {
      explorer: true,
      customSiteTitle: 'Employee Task Management API Docs',
    })
  );
}
