import { Request, Response, NextFunction } from 'express';
import { getProjects, createProject } from '../services/projectService';

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function createNewProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description } = req.body;
    const project = await createProject(name, description);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}
