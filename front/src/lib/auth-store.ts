import { mockUsers, mockClients, mockHosts, type User, type AccessRequest, type Client, type Host, type HostNote, type HostType, initialRequests } from './mock-data';

let currentUser: User | null = null;
if (typeof window !== 'undefined') {
  try {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) currentUser = JSON.parse(storedUser);
  } catch (e) {}
}
let accessRequests: AccessRequest[] = [...initialRequests];
let clients: Client[] = [...mockClients];
// Seed each host with a notesList derived from the legacy `notes` string
let hosts: Host[] = mockHosts.map(h => ({
  ...h,
  notesList: h.notesList ?? (h.notes
    ? h.notes.split('\n').filter(Boolean).map((line, i) => ({
        id: `n-${h.id}-${i}`,
        text: line,
        createdAt: Date.now() - (i + 1) * 60_000,
      }))
    : []),
}));
let listeners: Array<() => void> = [];

// Cached snapshots for useSyncExternalStore (must be referentially stable)
let cachedRequests = accessRequests;
let cachedPending = accessRequests.filter(r => r.status === 'pending');
let cachedUser: User | null = null;
let cachedClients = clients;
let cachedHosts = hosts;

function rebuildSnapshots() {
  cachedRequests = [...accessRequests];
  cachedPending = accessRequests.filter(r => r.status === 'pending');
  cachedUser = currentUser;
  cachedClients = [...clients];
  cachedHosts = [...hosts];
}

function notify() {
  rebuildSnapshots();
  listeners.forEach(fn => fn());
}

// Initial build
rebuildSnapshots();

export const authStore = {
  subscribe(fn: () => void) {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  },

  async login(email: string, password: string): Promise<User | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.status === 'success') {
        const user: User = {
          id: data.user.id.toString(),
          name: data.user.name,
          email: data.user.email,
          level: data.user.level,
          active: data.user.active !== undefined ? data.user.active : true,
          password: ''
        };
        currentUser = user;
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        notify();
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  logout() {
    currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    notify();
  },

  getUser(): User | null {
    return cachedUser;
  },

  getRequests(): AccessRequest[] {
    return cachedRequests;
  },

  getPendingRequests(): AccessRequest[] {
    return cachedPending;
  },

  addRequest(req: AccessRequest) {
    accessRequests = [req, ...accessRequests];
    notify();
  },

  approveRequest(id: string, durationMinutes: number) {
    accessRequests = accessRequests.map(r =>
      r.id === id ? { ...r, status: 'approved' as const, approvedDuration: durationMinutes, approvedAt: Date.now() } : r
    );
    notify();
  },

  denyRequest(id: string) {
    accessRequests = accessRequests.map(r =>
      r.id === id ? { ...r, status: 'denied' as const } : r
    );
    notify();
  },

  getApprovedAccessForHost(hostId: string, userId: string): { expiresAt: number } | null {
    const req = accessRequests.find(
      r => r.hostId === hostId && r.requesterId === userId && r.status === 'approved' && r.approvedAt && r.approvedDuration
    );
    if (!req || !req.approvedAt || !req.approvedDuration) return null;
    const expiresAt = req.approvedAt + req.approvedDuration * 60 * 1000;
    if (Date.now() > expiresAt) return null;
    return { expiresAt };
  },

  getClients(): Client[] {
    return cachedClients;
  },

  getHosts(): Host[] {
    return cachedHosts;
  },

  addClient(input: { name: string; description: string }) {
    const newClient: Client = {
      id: `c${Date.now()}`,
      name: input.name,
      description: input.description,
      hostsCount: 0,
    };
    clients = [newClient, ...clients];
    notify();
    return newClient;
  },

  addHost(input: { clientId: string; name: string; type: HostType; ip: string; username: string; password: string; notes: string; noteTitle?: string }) {
    const newHost: Host = {
      id: `h${Date.now()}`,
      ...input,
      notesList: input.notes.trim()
        ? [{ id: `n-${Date.now()}`, title: input.noteTitle?.trim() || undefined, text: input.notes.trim(), createdAt: Date.now() }]
        : [],
    };
    hosts = [...hosts, newHost];
    clients = clients.map(c => c.id === input.clientId ? { ...c, hostsCount: c.hostsCount + 1 } : c);
    notify();
    return newHost;
  },

  addHostNote(
    hostId: string,
    input: { title?: string; text: string; attachmentName?: string; attachmentDataUrl?: string },
    authorName?: string,
  ) {
    const note: HostNote = {
      id: `n${Date.now()}`,
      title: input.title?.trim() || undefined,
      text: input.text.trim(),
      createdAt: Date.now(),
      authorName,
      attachmentName: input.attachmentName,
      attachmentDataUrl: input.attachmentDataUrl,
    };
    hosts = hosts.map(h => h.id === hostId
      ? { ...h, notesList: [note, ...(h.notesList ?? [])] }
      : h);
    notify();
  },

  removeHostNote(hostId: string, noteId: string) {
    hosts = hosts.map(h => h.id === hostId
      ? { ...h, notesList: (h.notesList ?? []).filter(n => n.id !== noteId) }
      : h);
    notify();
  },
};
