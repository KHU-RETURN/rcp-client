import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADMIN_SUMMARY_PATH,
  ADMIN_SYSTEM_PATH,
  adminInstancesPath,
  adminUserResourcesPath,
  adminUsersPath,
  adminContainersPath,
} from './admin-paths.ts';

test('admin paths use dashboard endpoints with default limit', () => {
  assert.equal(ADMIN_SUMMARY_PATH, '/api/v1/admin/summary');
  assert.equal(ADMIN_SYSTEM_PATH, '/api/v1/admin/system');
  assert.equal(adminUsersPath(), '/api/v1/admin/users?page=1&limit=10');
  assert.equal(adminInstancesPath(), '/api/v1/admin/instances?page=1&limit=10');
  assert.equal(adminContainersPath(), '/api/v1/admin/containers?page=1&limit=10');
});

test('admin paths allow explicit list limits', () => {
  assert.equal(adminUsersPath(2, 25), '/api/v1/admin/users?page=2&limit=25');
  assert.equal(adminInstancesPath(3, 50), '/api/v1/admin/instances?page=3&limit=50');
  assert.equal(adminContainersPath(4, 10), '/api/v1/admin/containers?page=4&limit=10');
});

test('admin paths include user resource detail endpoint', () => {
  assert.equal(adminUserResourcesPath('user-1'), '/api/v1/admin/users/user-1/resources');
});
