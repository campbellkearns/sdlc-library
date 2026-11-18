import { TestBed } from '@angular/core/testing';

import { makeToken } from './testing/make-token';
import { TokenStore } from './token-store';

const ROSA = makeToken({ sub: 'rosa', roles: ['LIBRARIAN'] });
const SAM = makeToken({ sub: 'sam', roles: ['READER'] });

describe('TokenStore', () => {
  let store: TokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(TokenStore);
  });

  it('starts signed out', () => {
    expect(store.isAuthenticated()).toBe(false);
  });

  // The instructor writes this one in class.
  it('setToken() reads who is signed in from the token', () => {
    store.setToken(ROSA);

    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentUsername()).toBe('rosa');
    expect(store.currentRoles()).toEqual(['LIBRARIAN']);
  });

  // The students write these in the lab.
  it('knows rosa is a librarian (BR-08)', () => {
    store.setToken(ROSA);

    expect(store.isLibrarian()).toBe(true);
  });

  it('knows sam is not a librarian (BR-08)', () => {
    store.setToken(SAM);

    expect(store.isLibrarian()).toBe(false);
  });

  it('clear() signs out (S6)', () => {
    store.setToken(ROSA);

    store.clear();

    expect(store.isAuthenticated()).toBe(false);
    expect(store.isLibrarian()).toBe(false);
  });
});
