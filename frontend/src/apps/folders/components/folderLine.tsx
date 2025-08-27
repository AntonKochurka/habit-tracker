import { useState } from "react";
import type { Folder } from "../services/types";
import { FaDoorClosed, FaPlusSquare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { showModal } from "@shared/modals/service/service";
import { ModalKeys } from "@shared/modals/service/types";

interface Props {
  folder: Folder;
  isOpen?: boolean; 
}

export default function FolderLine({ folder, isOpen = false }: Props) {
  const [open, setOpen] = useState(isOpen);
  const navigate = useNavigate();

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
        <div className="ml-2">
          <FaPlusSquare color={folder.color} onClick={() => {
            showModal(
              ModalKeys.CREATE_HABIT, {
                title: "Create Habit",
                folder: {
                  id: folder.id,
                  title: folder.title
                }
              }
            )
          }} />
        </div>
        <div className="ml-2">
          <FaDoorClosed color={folder.color} onClick={() => {navigate(`/home/folder/${folder.id}`)}} />
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