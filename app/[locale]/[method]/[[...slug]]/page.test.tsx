import { describe, it, expect, vi, beforeEach } from 'vitest';
import PageComponent from './page';
import type { RestClientPageProps } from '@/app/interfaces';
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));
vi.mock('@/app/components/rest-client/helpers/encoding', () => ({
  decodeFromBase64Url: vi.fn((str: string) => `decoded(${str})`),
}));

vi.mock(
  '@/app/components/rest-client/ResizableContainer/ResizableContainer',
  () => ({
    default: (props: unknown) => (
      <div
        data-testid="mock-resizable-container"
        data-props={JSON.stringify(props)}
      ></div>
    ),
  })
);

vi.mock('@/app/store/providers', () => ({
  ReduxProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="mock-toaster"></div>,
}));

const randomUUIDSpy = vi.spyOn(crypto, 'randomUUID');

describe('RESTful Page Server Component (Logic Test)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    randomUUIDSpy.mockReturnValue('mock-test-id');
  });

  it('should call notFound for invalid method', async () => {
    const mockParams = { locale: 'en', method: 'INVALID', slug: [] };
    const mockSearchParams = {};
    const props: RestClientPageProps = {
      params: Promise.resolve(mockParams),
      searchParams: Promise.resolve(mockSearchParams),
    };
    await PageComponent(props);

    expect(vi.mocked(Navigation.notFound)).toHaveBeenCalledTimes(1);
  });

  it('should process valid params and pass correct initial props to ResizableContainer', async () => {
    const mockParams = {
      locale: 'en',
      method: 'POST',
      slug: ['encodedUrl123', 'encodedBody456'],
    };
    const mockSearchParams = {
      Header1: 'Value1',
      'X-Test': 'Value Test',
    };
    const props: RestClientPageProps = {
      params: Promise.resolve(mockParams),
      searchParams: Promise.resolve(mockSearchParams),
    };

    const _resultJSX = await PageComponent(props);
    expect(vi.mocked(Navigation.notFound)).not.toHaveBeenCalled();
    expect(vi.mocked(EncodingHelper.decodeFromBase64Url)).toHaveBeenCalledWith(
      'encodedUrl123'
    );
    expect(vi.mocked(EncodingHelper.decodeFromBase64Url)).toHaveBeenCalledWith(
      'encodedBody456'
    );
  });

  it('should handle missing slug parameters gracefully', async () => {
    const mockParams = { locale: 'fr', method: 'GET' };
    const mockSearchParams = { Cache: 'no' };
    const props: RestClientPageProps = {
      params: Promise.resolve(mockParams),
      searchParams: Promise.resolve(mockSearchParams),
    };

    await PageComponent(props);

    expect(vi.mocked(Navigation.notFound)).not.toHaveBeenCalled();
    expect(
      vi.mocked(EncodingHelper.decodeFromBase64Url)
    ).not.toHaveBeenCalled();
    expect(randomUUIDSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle empty searchParams correctly', async () => {
    const mockParams = {
      locale: 'de',
      method: 'PUT',
      slug: ['encodedUrlOnly'],
    };
    const mockSearchParams = {};
    const props: RestClientPageProps = {
      params: Promise.resolve(mockParams),
      searchParams: Promise.resolve(mockSearchParams),
    };

    await PageComponent(props);

    expect(vi.mocked(Navigation.notFound)).not.toHaveBeenCalled();
    expect(vi.mocked(EncodingHelper.decodeFromBase64Url)).toHaveBeenCalledWith(
      'encodedUrlOnly'
    );
    expect(randomUUIDSpy).toHaveBeenCalledTimes(1);
  });
});

import * as Navigation from 'next/navigation';
import * as EncodingHelper from '@/app/components/rest-client/helpers/encoding';
import React from 'react';
