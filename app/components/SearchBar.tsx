import React from "react";
import { IoFilter } from "react-icons/io5";
import { FaDownload, FaCircle } from "react-icons/fa6";
import { Event } from "../types";
import { exportToCSV } from "../utils";

type SearchBarProps = {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  setIsLive: React.Dispatch<React.SetStateAction<boolean>>;
  isLive: boolean;
  events: Event[];
};

const SearchBar: React.FC<SearchBarProps> = ({
  search,
  onSearchChange,
  filters,
  setFilters,
  setIsLive,
  isLive,
  events,
}) => {
  return (
    <div className="p-4 bg-[#f5f5f5] rounded-t-2xl">
      <div className="mb-4 flex w-full p-0 bg-[#f5f5f5] text-xs text-gray-500 border border-gray-300 rounded-lg">
        <input
          type="text"
          className="w-full px-4 py-3 bg-transparent text-sm "
          placeholder="Search name, email or action..."
          value={search}
          onChange={onSearchChange}
        />
        <button
          className="flex items-center px-4 py-2 border-l border-gray-300"
          onClick={() =>
            setFilters({ actorId: "", targetId: "", actionId: "" })
          }
        >
          <IoFilter className="mr-2" />
          FILTER
        </button>
        <button
          className="flex items-center px-4 py-2 border-l border-gray-300 "
          onClick={() => exportToCSV(events)}
        >
          <FaDownload className="mr-2" />
          EXPORT
        </button>
        <button
          className="flex items-center px-3 py-1 border-l rounded-r-lg border-gray-300"
          onClick={() => setIsLive(!isLive)}
        >
          <FaCircle
            className={`mr-2 ${isLive ? "text-red-900" : "text-gray-400"}`}
          />
          LIVE
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
