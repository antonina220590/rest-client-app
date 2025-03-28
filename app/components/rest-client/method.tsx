'use client';

import { useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { CheckIcon } from '@heroicons/react/20/solid';
import React from 'react';

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export default function MethodSelector() {
  const [selected, setSelected] = useState(methods[0]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative mt-2 ml-9">
        <ListboxButton className="grid w-[120px] cursor-default grid-cols-1 rounded-md bg-cta-secondary py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-cta-primary sm:text-sm/6">
          <span className="col-start-1 row-start-1 flex items-center justify-center gap-3 pr-6">
            <span className="block truncate">{selected}</span>
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 w-auto overflow-auto rounded-md bg-cta-secondary py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {methods.map((method) => (
            <ListboxOption
              key={method}
              value={method}
              className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-cta-primary data-focus:text-white data-focus:outline-hidden"
            >
              <div className="flex items-center">
                <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">
                  {method}
                </span>
              </div>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-cta-primary group-not-data-selected:hidden group-data-focus:text-white">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
