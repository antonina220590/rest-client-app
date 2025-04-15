import { describe, it, expect } from 'vitest';
import { buildUrlWithParams, decodeTemplate } from './urlBuilder';
import type { KeyValueItem } from '@/app/interfaces';

describe('buildUrlWithParams Helper', () => {
  it('should add query parameters correctly to a base URL without existing params', () => {
    const baseUrl = 'https://api.example.com/v1/users';
    const params: KeyValueItem[] = [
      { id: 'id1', key: 'page', value: '2' },
      { id: 'id2', key: 'pageSize', value: '25' },
      { id: 'id3', key: 'status', value: 'active' },
    ];
    const expectedUrl =
      'https://api.example.com/v1/users?page=2&pageSize=25&status=active';

    const result = buildUrlWithParams(baseUrl, params);
    expect(result).toBe(expectedUrl);
  });

  it('should remove existing query parameters from a valid base URL before adding new ones', () => {
    const baseUrlWithParams = 'https://example.com/search?q=old_query&page=1';
    const newParams: KeyValueItem[] = [
      { id: 'n1', key: 'q', value: 'new_query' },
      { id: 'n2', key: 'limit', value: '10' },
    ];
    const expectedUrl = 'https://example.com/search?q=new_query&limit=10';
    const result = buildUrlWithParams(baseUrlWithParams, newParams);
    expect(result).toBe(expectedUrl);
  });

  it('should remove existing query parameters from a path-only base URL before adding new ones', () => {
    const baseUrlWithPathParams = '/api/v2/data?token=expired&id=5';
    const newParams: KeyValueItem[] = [
      { id: 'n1', key: 'format', value: 'json' },
    ];
    const expectedUrl = '/api/v2/data?format=json';
    const result = buildUrlWithParams(baseUrlWithPathParams, newParams);
    expect(result).toBe(expectedUrl);
  });

  it('should return the base URL unchanged if the params array is empty', () => {
    const baseUrl = 'https://example.com/data';
    const params: KeyValueItem[] = [];
    const expectedUrl = 'https://example.com/data';

    const result = buildUrlWithParams(baseUrl, params);
    expect(result).toBe(expectedUrl);
  });

  it('should filter out parameters with empty or falsy keys', () => {
    const baseUrl = 'https://api.io/v1';
    const params: KeyValueItem[] = [
      { id: 'p1', key: 'user', value: 'admin' },
      { id: 'p2', key: '', value: 'skip_empty_key' },
      { id: 'p3', key: 'role', value: 'editor' },
    ];
    const expectedUrl = 'https://api.io/v1?user=admin&role=editor';

    const result = buildUrlWithParams(baseUrl, params as KeyValueItem[]);
    expect(result).toBe(expectedUrl);
  });
});
describe('decodeTemplate Helper', () => {
  it('should decode both %7B%7B and %7D%7D to {{ and }}', () => {
    const inputString = 'api/users/%7B%7BuserId%7D%7D/posts/%7B%7BpostId%7D%7D';
    const expectedOutput = 'api/users/{{userId}}/posts/{{postId}}';
    const result = decodeTemplate(inputString);
    expect(result).toBe(expectedOutput);
  });
});
