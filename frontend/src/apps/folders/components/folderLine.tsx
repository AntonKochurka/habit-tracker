import { useState } from "react";
import type { Folder } from "../services/types";

interface Props {
  folder: Folder;
  isOpen?: boolean; 
}

export default function FolderLine({ folder, isOpen = false }: Props) {
  const [open, setOpen] = useState(isOpen);

  if (!folder) return null;

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <div className="flex flex-col w-full">
      <div
        className="flex items-center justify-between cursor-pointer py-2 px-4"
        onClick={toggleOpen}
      >
        <div
          className={`transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        >
          ▶
        </div>

        <div className="ml-2 font-medium" style={{ color: folder.color }}>
          {folder.title}
        </div>
      </div>

      <hr className="border-t border-gray-300 w-full" />

      {open && (
        <div className="pl-6 pt-2">
          <div className="text-gray-500 italic">Folder content goes here</div>
        </div>
      )}
    </div>
  );
}
