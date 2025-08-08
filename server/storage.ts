import { 
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject,
  type Page,
  type InsertPage,
  type Run,
  type InsertRun,
  type LinkCandidate,
  type InsertLinkCandidate
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  createProject(project: InsertProject & { userId: string }): Promise<Project>;
  
  // Page operations
  getPagesByProjectId(projectId: string): Promise<Page[]>;
  createPage(page: InsertPage): Promise<Page>;
  
  // Run operations
  getRunsByProjectId(projectId: string): Promise<Run[]>;
  createRun(run: InsertRun): Promise<Run>;
  updateRun(id: string, updates: Partial<Run>): Promise<Run>;
  
  // Link candidate operations
  getLinkCandidatesByRunId(runId: string): Promise<LinkCandidate[]>;
  createLinkCandidate(candidate: InsertLinkCandidate): Promise<LinkCandidate>;
  updateLinkCandidate(id: string, updates: Partial<LinkCandidate>): Promise<LinkCandidate>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private projects: Map<string, Project> = new Map();
  private pages: Map<string, Page> = new Map();
  private runs: Map<string, Run> = new Map();
  private linkCandidates: Map<string, LinkCandidate> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async createProject(projectData: InsertProject & { userId: string }): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...projectData,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async getPagesByProjectId(projectId: string): Promise<Page[]> {
    return Array.from(this.pages.values()).filter(page => page.projectId === projectId);
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const id = randomUUID();
    const page: Page = {
      ...insertPage,
      id,
      createdAt: new Date(),
    };
    this.pages.set(id, page);
    return page;
  }

  async getRunsByProjectId(projectId: string): Promise<Run[]> {
    return Array.from(this.runs.values()).filter(run => run.projectId === projectId);
  }

  async createRun(insertRun: InsertRun): Promise<Run> {
    const id = randomUUID();
    const run: Run = {
      ...insertRun,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.runs.set(id, run);
    return run;
  }

  async updateRun(id: string, updates: Partial<Run>): Promise<Run> {
    const run = this.runs.get(id);
    if (!run) throw new Error(`Run ${id} not found`);
    
    const updatedRun = { ...run, ...updates };
    this.runs.set(id, updatedRun);
    return updatedRun;
  }

  async getLinkCandidatesByRunId(runId: string): Promise<LinkCandidate[]> {
    return Array.from(this.linkCandidates.values()).filter(candidate => candidate.runId === runId);
  }

  async createLinkCandidate(insertCandidate: InsertLinkCandidate): Promise<LinkCandidate> {
    const id = randomUUID();
    const candidate: LinkCandidate = {
      ...insertCandidate,
      id,
      createdAt: new Date(),
    };
    this.linkCandidates.set(id, candidate);
    return candidate;
  }

  async updateLinkCandidate(id: string, updates: Partial<LinkCandidate>): Promise<LinkCandidate> {
    const candidate = this.linkCandidates.get(id);
    if (!candidate) throw new Error(`Link candidate ${id} not found`);
    
    const updatedCandidate = { ...candidate, ...updates };
    this.linkCandidates.set(id, updatedCandidate);
    return updatedCandidate;
  }
}

export const storage = new MemStorage();
