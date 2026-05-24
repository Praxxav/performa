import { LuUndo2, LuRedo2, LuUnderline } from "react-icons/lu";
import { MdFormatQuote } from "react-icons/md";
import { HiOutlineBold } from "react-icons/hi2";
import { FiItalic } from "react-icons/fi";

const TextEditor = ({ onFormat }) => {
  return (
    <div className="flex space-x-2 p-2 bg-[#F5F5F2] rounded-lg">
      {/* Bold */}
      <button
        onClick={() => onFormat("bold")}
        title="Bold"
        className="px-2 py-1 bg-white border border-gray-300 rounded"
      >
        <HiOutlineBold />
      </button>

      {/* Italic */}
      <button
        onClick={() => onFormat("italic")}
        title="Italic"
        className="px-2 py-1 bg-white border border-gray-300 rounded"
      >
        <FiItalic />
      </button>

      {/* Underline */}
      <button
        onClick={() => onFormat("underline")}
        title="Underline"
        className="px-2 py-1 bg-white border border-gray-300 rounded"
      >
        <LuUnderline />
      </button>

      {/* Undo */}
      <button
        onClick={() => onFormat("undo")}
        title="Undo"
        className="px-2 py-1 bg-white border border-gray-300 rounded"
      >
        <LuUndo2 />
      </button>

      {/* Redo */}
      <button
        onClick={() => onFormat("redo")}
        title="Redo"
        className="px-2 py-1 bg-white border border-gray-300 rounded"
      >
        <LuRedo2 />
      </button>

      {/* Quotes */}
      <button
        onClick={() => onFormat("formatBlock", "blockquote")}
        title="Quote"
        className="px-2 py-1 bg-white border border-gray-300 rounded"
      >
        <MdFormatQuote />
      </button>
    </div>
  );
};

export default TextEditor;
