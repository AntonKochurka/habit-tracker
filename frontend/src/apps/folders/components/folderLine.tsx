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
      <div className="flex items-center w-full py-2 px-4">
        <div 
          onClick={toggleOpen} 
          className="cursor-pointer flex items-center" 
          style={{ color: folder.color }}
        >
          <span className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}>
            ▶
          </span>
          <span className="ml-2 font-medium">{folder.title}</span>
        </div>
        <div className="flex-grow ml-2">
          <hr className="m-0" style={{ borderTop: `1px solid ${folder.color}` }} />
        </div>
      </div>

      {open && (
        <div className="pl-6 pt-2">
          <div className="text-gray-500 italic">Folder content goes here</div>
        </div>
      )}
    </div>
  );
}