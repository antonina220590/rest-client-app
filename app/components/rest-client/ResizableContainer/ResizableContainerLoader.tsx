'use client';

import dynamic from 'next/dynamic';
import type { ResizableContainerProps } from '@/app/interfaces';
import Spinner from '../../Spinner';

const ResizableContainer = dynamic(
  () =>
    import(
      '@/app/components/rest-client/ResizableContainer/ResizableContainer'
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-full w-full">
        <Spinner />
      </div>
    ),
  }
);

export default function ResizableContainerLoader(
  props: ResizableContainerProps
) {
  return <ResizableContainer {...props} />;
}
