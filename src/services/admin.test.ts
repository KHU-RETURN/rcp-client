import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADMIN_SUMMARY_PATH,
  ADMIN_SYSTEM_PATH,
  adminInstancesPath,
  adminUsersPath,
} from './admin-paths.ts';

test('admin paths use dashboard endpoints with default limit', () => {
  assert.equal(ADMIN_SUMMARY_PATH, '/api/v1/admin/summary');
  assert.equal(ADMIN_SYSTEM_PATH, '/api/v1/admin/system');
  assert.equal(adminUsersPath(), '/api/v1/admin/users?limit=100');
  assert.equal(adminInstancesPath(), '/api/v1/admin/instances?limit=100');
});

test('admin paths allow explicit list limits', () => {
  assert.equal(adminUsersPath(25), '/api/v1/admin/users?limit=25');
  assert.equal(adminInstancesPath(50), '/api/v1/admin/instances?limit=50');
});
