// Local storage utilities for offline support and caching

import type { User, TherapySession, Dose, SideEffect } from '@/types';

const KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THERAPY: 'therapy',
  DOSES: 'doses',
  SIDE_EFFECTS: 'sideEffects',
  LAST_SYNC: 'lastSync',
};

// Token
export const saveToken = (token: string): void => {
  localStorage.setItem(KEYS.TOKEN, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(KEYS.TOKEN);
};

export const removeToken = (): void => {
  localStorage.removeItem(KEYS.TOKEN);
};

// User
export const saveUser = (user: User): void => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const user = localStorage.getItem(KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const removeUser = (): void => {
  localStorage.removeItem(KEYS.USER);
};

// Therapy Session
export const saveTherapy = (therapy: TherapySession): void => {
  localStorage.setItem(KEYS.THERAPY, JSON.stringify(therapy));
};

export const getTherapy = (): TherapySession | null => {
  const therapy = localStorage.getItem(KEYS.THERAPY);
  return therapy ? JSON.parse(therapy) : null;
};

export const removeTherapy = (): void => {
  localStorage.removeItem(KEYS.THERAPY);
};

// Doses
export const saveDoses = (doses: Dose[]): void => {
  localStorage.setItem(KEYS.DOSES, JSON.stringify(doses));
};

export const getDoses = (): Dose[] => {
  const doses = localStorage.getItem(KEYS.DOSES);
  return doses ? JSON.parse(doses) : [];
};

export const addDose = (dose: Dose): void => {
  const doses = getDoses();
  doses.unshift(dose);
  saveDoses(doses);
};

// Side Effects
export const saveSideEffects = (sideEffects: SideEffect[]): void => {
  localStorage.setItem(KEYS.SIDE_EFFECTS, JSON.stringify(sideEffects));
};

export const getSideEffects = (): SideEffect[] => {
  const sideEffects = localStorage.getItem(KEYS.SIDE_EFFECTS);
  return sideEffects ? JSON.parse(sideEffects) : [];
};

export const addSideEffect = (sideEffect: SideEffect): void => {
  const sideEffects = getSideEffects();
  sideEffects.unshift(sideEffect);
  saveSideEffects(sideEffects);
};

// Last Sync
export const saveLastSync = (): void => {
  localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
};

export const getLastSync = (): string | null => {
  return localStorage.getItem(KEYS.LAST_SYNC);
};

// Clear all data
export const clearAll = (): void => {
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};
