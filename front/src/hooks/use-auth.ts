import { useSyncExternalStore } from 'react';
import { authStore } from '@/lib/auth-store';
import type { AccessRequest, Client, Host } from '@/lib/mock-data';

export function useAuth() {
  const user = useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getUser(),
    () => authStore.getUser()
  );

  return {
    user,
    login: authStore.login,
    logout: authStore.logout,
    updatePasswordStatus: authStore.updateUserPasswordStatus,
    isN1: user?.level === 1,
    isN2: user?.level === 2,
    isN3: user?.level === 3,
    canEdit: (user?.level ?? 0) >= 2,
    canManageUsers: user?.level === 3,
  };
}

export function useAccessRequests() {
  const requests = useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getRequests(),
    () => authStore.getRequests()
  );

  const pending = useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getPendingRequests(),
    () => authStore.getPendingRequests()
  );

  return {
    requests,
    pending,
    pendingCount: pending.length,
    addRequest: authStore.addRequest,
    approveRequest: authStore.approveRequest,
    denyRequest: authStore.denyRequest,
    getApprovedAccess: authStore.getApprovedAccessForHost,
  };
}

export function useClients() {
  const clients = useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getClients(),
    () => authStore.getClients()
  );
  return { clients, addClient: authStore.addClient };
}

export function useHosts() {
  const hosts = useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getHosts(),
    () => authStore.getHosts()
  );
  return {
    hosts,
    addHost: authStore.addHost,
    addHostNote: authStore.addHostNote,
    removeHostNote: authStore.removeHostNote,
  };
}
