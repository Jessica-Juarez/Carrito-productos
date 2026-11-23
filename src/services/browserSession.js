import { useSyncExternalStore } from 'react';

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot
  );
}

export function readStoredValue(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue === null ? fallback : JSON.parse(storedValue);
  } catch (error) {
    console.error(`Error al leer ${key} de localStorage:`, error);
    return fallback;
  }
}

export function readStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token = window.localStorage.getItem('token');
    const storedUser = window.localStorage.getItem('user');
    return token && storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error al leer la sesion de localStorage:', error);
    return null;
  }
}
