import { useState, Fragment } from "react";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import type { Folder } from "@app/folders/services/types";

export default function FolderCombobox({
  folders,
  selectedFolders,
  setSelectedFolders,
  error,
  register,
  setValue
}: {
  folders: Folder[]
  selectedFolders: Folder[]
  setSelectedFolders: (folders: Folder[]) => void
  error?: { message?: string },
  register: any,
  setValue: any
}) {
  const [query, setQuery] = useState('')

  const filteredFolders =
    query === ''
      ? folders
      : folders.filter((folder) =>
          folder.title
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Folders
      </label>
      
      <Combobox 
        value={selectedFolders} 
        onChange={(value) => {
          setSelectedFolders(value)
          console.log(value.map(f => f.id));
          
          setValue("folder_ids", value.map(f => f.id))
        }}
        multiple
      >
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <ComboboxInput
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-0"
              displayValue={(folders: Folder[]) => 
                folders.map(folder => folder.title).join(', ')
              }
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Select folders..."
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <FaChevronDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </ComboboxButton>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
              {filteredFolders.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300">
                  Nothing found.
                </div>
              ) : (
                filteredFolders.map((folder) => (
                  <ComboboxOption
                    key={folder.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-900 dark:text-gray-300'
                      }`
                    }
                    value={folder}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {folder.title}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            <FaCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>
      
      <input
        type="hidden"
        value={selectedFolders.map(f => f.id)}
        {...register("folder_ids")}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}
