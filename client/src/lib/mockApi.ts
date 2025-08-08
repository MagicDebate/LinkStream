import { User, Project, Page, Run, LinkCandidate } from "@shared/schema";

interface AuthData {
  user: User;
  token: string;
}

interface GlobalSettings {
  maxLinksPerPage: number;
  priorities: string[];
  minGap: number;
  exactAnchorPercent: number;
  oldLinksAction: 'enrich' | 'regenerate' | 'audit';
  brokenLinksAction: 'delete' | 'replace' | 'ignore';
  htmlClass: string;
  linkMode: 'append' | 'replace';
  stopAnchors: string[];
  relAttributes: string[];
  targetBlank: boolean;
  urlPattern: string;
  newerThan: string;
  randomSample: number;
}

const DEFAULT_SETTINGS: GlobalSettings = {
  maxLinksPerPage: 3,
  priorities: ['hubs', 'commerce', 'similar', 'deep', 'fresh', 'orphans'],
  minGap: 200,
  exactAnchorPercent: 20,
  oldLinksAction: 'enrich',
  brokenLinksAction: 'delete',
  htmlClass: 'internal-link',
  linkMode: 'append',
  stopAnchors: ['click here', 'read more', 'learn more'],
  relAttributes: [],
  targetBlank: false,
  urlPattern: '',
  newerThan: '',
  randomSample: 100,
};

class MockApi {
  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setToStorage<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Auth
  async login(email: string, password: string): Promise<AuthData> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const users = this.getFromStorage<User[]>('users', []);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const token = 'mock-token-' + Math.random().toString(36).substr(2, 9);
    this.setToStorage('auth', { user, token });
    
    return { user, token };
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = this.getFromStorage<User[]>('users', []);
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const user: User = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email,
      password,
      firstName,
      lastName,
      createdAt: new Date(),
    };
    
    users.push(user);
    this.setToStorage('users', users);
    
    const token = 'mock-token-' + Math.random().toString(36).substr(2, 9);
    this.setToStorage('auth', { user, token });
    
    return { user, token };
  }

  async getCurrentUser(): Promise<User | null> {
    const auth = this.getFromStorage<AuthData | null>('auth', null);
    return auth?.user || null;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const auth = this.getFromStorage<AuthData | null>('auth', null);
    if (!auth) throw new Error('Not authenticated');
    
    const users = this.getFromStorage<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === auth.user.id);
    
    if (userIndex === -1 || users[userIndex].password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    
    users[userIndex].password = newPassword;
    auth.user.password = newPassword;
    
    this.setToStorage('users', users);
    this.setToStorage('auth', auth);
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const auth = this.getFromStorage<AuthData | null>('auth', null);
    if (!auth) throw new Error('Not authenticated');
    
    const projects = this.getFromStorage<Project[]>('projects', []);
    return projects.filter(p => p.userId === auth.user.id);
  }

  async createProject(name: string, domain: string): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const auth = this.getFromStorage<AuthData | null>('auth', null);
    if (!auth) throw new Error('Not authenticated');
    
    const project: Project = {
      id: 'project-' + Math.random().toString(36).substr(2, 9),
      name,
      domain,
      userId: auth.user.id,
      createdAt: new Date(),
    };
    
    const projects = this.getFromStorage<Project[]>('projects', []);
    projects.push(project);
    this.setToStorage('projects', projects);
    
    // Initialize with demo data
    await this.initializeDemoData(project.id);
    
    return project;
  }

  async initializeDemoData(projectId: string): Promise<void> {
    // Create sample pages
    const samplePages: Page[] = [
      {
        id: `page-${projectId}-1`,
        projectId,
        url: '/catalog/products',
        title: 'Каталог товаров',
        content: 'Большой выбор качественных товаров для дома и офиса.',
        metaTitle: 'Каталог товаров - Интернет-магазин',
        metaDescription: 'Широкий ассортимент товаров с доставкой',
        publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        language: 'ru',
        depth: 2,
        isOrphan: false,
        createdAt: new Date(),
      },
      {
        id: `page-${projectId}-2`,
        projectId,
        url: '/about',
        title: 'О компании',
        content: 'Мы ведущая компания в сфере электронной коммерции.',
        metaTitle: 'О нашей компании',
        metaDescription: 'Узнайте больше о нашей истории и ценностях',
        publishDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        language: 'ru',
        depth: 1,
        isOrphan: false,
        createdAt: new Date(),
      },
      {
        id: `page-${projectId}-3`,
        projectId,
        url: '/catalog/electronics/smartphones',
        title: 'Смартфоны',
        content: 'Современные смартфоны от ведущих производителей.',
        metaTitle: 'Смартфоны - Электроника',
        metaDescription: 'Выбор смартфонов по выгодным ценам',
        publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        language: 'ru',
        depth: 3,
        isOrphan: false,
        createdAt: new Date(),
      },
    ];
    
    this.setToStorage(`pages_${projectId}`, samplePages);
    
    // Create sample runs
    const sampleRuns: Run[] = [
      {
        id: `run-${projectId}-1`,
        projectId,
        status: 'completed',
        config: { tasks: ['hubs', 'similar', 'orphans'], maxLinksPerPage: 3 },
        stats: { 
          linksAdded: 45, 
          rejected: 12, 
          pagesProcessed: 156,
          processingTime: 127,
          orphansReduced: 8,
          avgDepthReduced: 0.3
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 127000),
      },
      {
        id: `run-${projectId}-2`,
        projectId,
        status: 'completed',
        config: { tasks: ['commerce', 'fresh'], maxLinksPerPage: 5 },
        stats: { 
          linksAdded: 23, 
          rejected: 7, 
          pagesProcessed: 89,
          processingTime: 83,
          orphansReduced: 3,
          avgDepthReduced: 0.1
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 83000),
      },
    ];
    
    this.setToStorage(`runs_${projectId}`, sampleRuns);
    
    // Create sample link candidates for the latest run
    const latestRun = sampleRuns[0];
    const sampleCandidates: LinkCandidate[] = [
      {
        id: `candidate-${latestRun.id}-1`,
        runId: latestRun.id,
        sourceUrl: '/catalog/products',
        targetUrl: '/catalog/electronics/smartphones',
        anchor: 'смартфоны',
        type: 'hubs',
        status: 'approved',
        rejectionReason: null,
        beforeText: 'В нашем каталоге представлены различные категории товаров.',
        afterText: 'В нашем каталоге представлены различные категории товаров, включая смартфоны.',
        createdAt: latestRun.createdAt,
      },
      {
        id: `candidate-${latestRun.id}-2`,
        runId: latestRun.id,
        sourceUrl: '/about',
        targetUrl: '/catalog/products',
        anchor: 'каталог товаров',
        type: 'similar',
        status: 'pending',
        rejectionReason: null,
        beforeText: 'Мы предлагаем широкий ассортимент продукции.',
        afterText: 'Мы предлагаем широкий каталог товаров высокого качества.',
        createdAt: latestRun.createdAt,
      },
      {
        id: `candidate-${latestRun.id}-3`,
        runId: latestRun.id,
        sourceUrl: '/catalog/electronics/smartphones',
        targetUrl: '/about',
        anchor: 'о нашей компании',
        type: 'orphans',
        status: 'rejected',
        rejectionReason: 'stop_anchor',
        beforeText: 'Узнайте больше информации.',
        afterText: 'Узнайте больше о нашей компании.',
        createdAt: latestRun.createdAt,
      },
    ];
    
    this.setToStorage(`candidates_${latestRun.id}`, sampleCandidates);
  }

  async getProject(id: string): Promise<Project | null> {
    const projects = this.getFromStorage<Project[]>('projects', []);
    return projects.find(p => p.id === id) || null;
  }

  // Pages
  async getPages(projectId: string): Promise<Page[]> {
    const pages = this.getFromStorage<Page[]>(`pages_${projectId}`, []);
    return pages;
  }

  async uploadCSV(projectId: string, csvData: any[]): Promise<{ success: boolean; stats: any }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pages: Page[] = csvData.map((row, index) => ({
      id: `page-${projectId}-${index}`,
      projectId,
      url: row.url || `/page-${index}`,
      title: row.title || `Page ${index}`,
      content: row.html_or_text || row.content || '',
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      publishDate: row.pub_date ? new Date(row.pub_date) : new Date(),
      language: row.lang || 'en',
      depth: Math.floor(Math.random() * 5) + 1,
      isOrphan: Math.random() < 0.1,
      createdAt: new Date(),
    }));
    
    this.setToStorage(`pages_${projectId}`, pages);
    
    const stats = {
      totalPages: pages.length,
      avgDepth: pages.reduce((sum, p) => sum + p.depth, 0) / pages.length,
      orphaned: pages.filter(p => p.isOrphan).length,
      duplicates: 0, // Mock
    };
    
    return { success: true, stats };
  }

  // Settings
  async getSettings(): Promise<GlobalSettings> {
    return this.getFromStorage('settings', DEFAULT_SETTINGS);
  }

  async updateSettings(settings: Partial<GlobalSettings>): Promise<GlobalSettings> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const current = this.getFromStorage('settings', DEFAULT_SETTINGS);
    const updated = { ...current, ...settings };
    this.setToStorage('settings', updated);
    return updated;
  }

  // Runs
  async getRuns(projectId: string): Promise<Run[]> {
    const runs = this.getFromStorage<Run[]>(`runs_${projectId}`, []);
    return runs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createRun(projectId: string, config: any): Promise<Run> {
    const run: Run = {
      id: 'run-' + Math.random().toString(36).substr(2, 9),
      projectId,
      status: 'running',
      config,
      stats: {},
      createdAt: new Date(),
      completedAt: null,
    };
    
    const runs = this.getFromStorage<Run[]>(`runs_${projectId}`, []);
    runs.unshift(run);
    this.setToStorage(`runs_${projectId}`, runs);
    
    return run;
  }

  async updateRun(runId: string, projectId: string, updates: Partial<Run>): Promise<Run> {
    const runs = this.getFromStorage<Run[]>(`runs_${projectId}`, []);
    const runIndex = runs.findIndex(r => r.id === runId);
    
    if (runIndex === -1) throw new Error('Run not found');
    
    runs[runIndex] = { ...runs[runIndex], ...updates };
    this.setToStorage(`runs_${projectId}`, runs);
    
    return runs[runIndex];
  }

  // Link candidates
  async getLinkCandidates(runId: string): Promise<LinkCandidate[]> {
    return this.getFromStorage<LinkCandidate[]>(`candidates_${runId}`, []);
  }

  async updateLinkCandidate(candidateId: string, runId: string, updates: Partial<LinkCandidate>): Promise<LinkCandidate> {
    const candidates = this.getFromStorage<LinkCandidate[]>(`candidates_${runId}`, []);
    const index = candidates.findIndex(c => c.id === candidateId);
    
    if (index === -1) throw new Error('Candidate not found');
    
    candidates[index] = { ...candidates[index], ...updates };
    this.setToStorage(`candidates_${runId}`, candidates);
    
    return candidates[index];
  }

  // Generation simulation
  async simulateGeneration(projectId: string, runId: string, tasks: string[]): Promise<void> {
    const pages = await this.getPages(projectId);
    const candidates: LinkCandidate[] = [];
    
    // Simulate generating link candidates based on tasks
    let candidateId = 0;
    
    for (const task of tasks) {
      const count = this.getTaskCandidateCount(task, pages.length);
      
      for (let i = 0; i < count; i++) {
        const sourceIndex = Math.floor(Math.random() * pages.length);
        const targetIndex = Math.floor(Math.random() * pages.length);
        
        if (sourceIndex === targetIndex) continue;
        
        const source = pages[sourceIndex];
        const target = pages[targetIndex];
        
        candidates.push({
          id: `candidate-${runId}-${candidateId++}`,
          runId,
          sourceUrl: source.url,
          targetUrl: target.url,
          anchor: this.generateAnchor(target.title || target.url),
          type: task,
          status: Math.random() < 0.85 ? 'approved' : 'rejected',
          rejectionReason: Math.random() < 0.15 ? this.getRandomRejectionReason() : null,
          beforeText: 'Sample text before the link insertion.',
          afterText: `Sample text before the ${this.generateAnchor(target.title || target.url)} link insertion.`,
          createdAt: new Date(),
        });
      }
    }
    
    this.setToStorage(`candidates_${runId}`, candidates);
  }

  private getTaskCandidateCount(task: string, pageCount: number): number {
    const baseCounts: Record<string, number> = {
      hubs: Math.floor(pageCount * 0.15),
      commerce: Math.floor(pageCount * 0.05),
      similar: Math.floor(pageCount * 0.12),
      deep: Math.floor(pageCount * 0.08),
      fresh: Math.floor(pageCount * 0.06),
      orphans: Math.floor(pageCount * 0.03),
    };
    
    return baseCounts[task] || Math.floor(pageCount * 0.05);
  }

  private generateAnchor(title: string): string {
    const words = title.split(' ').slice(0, 4);
    return words.join(' ');
  }

  private getRandomRejectionReason(): string {
    const reasons = ['min_gap', 'exact_exceed', 'stop_anchor', 'duplicate', 'broken_link'];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }
}

export const mockApi = new MockApi();
