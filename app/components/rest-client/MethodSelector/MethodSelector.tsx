'use client';

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import React from 'react';
import { MethodProps, methods } from '@/app/interfaces';

export default function MethodSelector({ value, onChange }: MethodProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative ml-9">
        <ListboxButton className="grid w-32 h-full max-w-max grid-cols-1 rounded-l-md bg-cta-secondary py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-cta-primary text-xs sm:text-sm cursor-pointer font-bold">
          <span className="col-start-1 row-start-1 flex items-center justify-center text-center gap-3 pr-6">
            <span className="block truncate mt-1">{value}</span>
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 overflow-auto rounded-md bg-cta-secondary py-1 ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {methods.map((method) => (
            <ListboxOption
              key={method}
              value={method}
              className="group relative cursor-default py-2 pr-3 pl-3 text-gray-900 select-none data-focus:bg-cta-primary data-focus:text-white data-focus:outline-hidden"
            >
              <div className="flex items-center">
                <span className="ml-3 block truncate font-normal text-xs sm:text-sm">
                  {method}
                </span>
              </div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
