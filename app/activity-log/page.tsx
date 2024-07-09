"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  FaChevronRight,
  FaCircle,
  FaDownload,
  FaFilter,
} from "react-icons/fa6";
import { formatDate } from "./utils";
import { IoFilter } from "react-icons/io5";
import { APIResponse } from "../type";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ActivityLog = () => {

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    actorId: "",
    targetId: "",
    actionId: "",
  });
  const [isLive, setIsLive] = useState(false);

  const { data, error, mutate } = useSWR<APIResponse>(
    `/api/events?page=${page}&pageSize=10&search=${search}&actorId=${filters.actorId}&targetId=${filters.targetId}&actionId=${filters.actionId}`,
    fetcher
  );
  useEffect(() => {
    mutate();
  }, [page, search, filters, mutate]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLive) {
      interval = setInterval(() => {
        mutate();
      }, 5000); // Fetch every 5 seconds
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, mutate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  const exportToCSV = () => {
    // Implement your CSV export logic here
  };

  if (error) return <div>Failed to load</div>;

  return (
    <div className="container mx-auto py-16 h-dvh">
      <div className="min-w-full border rounded-t-2xl text-black shadow-sm">
        <div className="p-4 bg-gray-200 rounded-t-2xl">
          <div className="mb-4 flex w-full p-0 bg-gray-200 text-xs text-gray-500 border border-gray-300 rounded-lg">
            <input
              type="text"
              className="w-full px-4 py-3 bg-transparent text-sm "
              placeholder="Search name, email or action..."
              value={search}
              onChange={handleSearchChange}
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
              onClick={exportToCSV}
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

          <div className="grid grid-cols-3 text-gray-600  font-semibold">
            <h4 className="py-3 px-4">ACTOR</h4>
            <h4 className="py-3 px-4">ACTION</h4>
            <h4 className="py-3 px-4">DATE</h4>
          </div>
        </div>
        {data ? (
          <div className="flex flex-col">
            {data.events.map((event) => (
              <div
                key={event.id}
                className="hover:bg-gray-100 border-b py-4 px-5 grid grid-cols-3 text-gray-950 text-sm"
              >
                <div className=" flex items-center">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white mr-2 bg-gradient-to-br from-orange-400 to-purple-600">
                    {event.actorName.charAt(0).toUpperCase()}
                  </div>
                  {event.actorName}
                </div>
                <p>{event.action.name}</p>
                <div className="flex items-center justify-between">
                  <p>{formatDate(event.occurredAt)}</p>

                  <div className="text-gray-300 mr-4 cursor-pointer">
                    <FaChevronRight />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className=" py-4 px-5 grid grid-cols-4 text-gray-950 text-sm">
              <div className="flex items-center">
                <Skeleton circle height={25} width={25} className="mr-4" />
                <Skeleton width={135} height={14} />
              </div>
              <Skeleton width={188} height={14} />
              <Skeleton width={100} height={14} />
              <FaChevronRight className="text-gray-400" />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={data && data.events.length < 10}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ActivityLog;
