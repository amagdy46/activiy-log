"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  FaChevronDown,
  FaChevronRight,
  FaCircle,
  FaDownload,
  FaFilter,
} from "react-icons/fa6";
import { formatDate } from "./utils";
import { IoFilter } from "react-icons/io5";
import { APIResponse, Event } from "./types";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useDebounceValue } from "usehooks-ts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ActivityLog = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useDebounceValue("", 50);
  const [filters, setFilters] = useState({
    actorId: "",
    targetId: "",
    actionId: "",
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  console.log(search);
  const { data, error, mutate } = useSWR<APIResponse>(
    `/api/events?page=${page}&pageSize=10&search=${search}&actorId=${filters.actorId}&targetId=${filters.targetId}&actionId=${filters.actionId}`,
    fetcher
  );

  console.log(data);
  useEffect(() => {
    if (data) {
      setEvents((prevEvents) => {
        const newEventIds = data.events.map((event) => event.id);
        const filteredPrevEvents = prevEvents.filter(
          (event) => !newEventIds.includes(event.id)
        );
        if (isLive && !isLoadingMore)
          return [...data.events, ...filteredPrevEvents];
        else return [...filteredPrevEvents, ...data.events];
      });
      setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLive]);

  useEffect(() => {
    setEvents([]);
    setPage(1);
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters]);

  useEffect(() => {
    if (page > 1) {
      mutate();
    }
  }, [page, mutate]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLive) {
      interval = setInterval(() => {
        mutate();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, mutate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const exportToCSV = () => {
    const csvConfig = mkConfig({ useKeysAsHeaders: true });
    const usefulEventsInfo = events.map((event) => ({
      actorName: event.actorName,
      actionName: event.action.name,
      occurredAt: formatDate(event.occurredAt),
      targetName: event.targetName,
      location: event.location,
      description: event.metadata.description,
    }));
    const csv = generateCsv(csvConfig)(usefulEventsInfo);
    download(csvConfig)(csv);
  };

  const loadMore = () => {
    setIsLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEventId((prevEventId) =>
      prevEventId === eventId ? null : eventId
    );
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
        {events.length ? (
          <div className="flex flex-col">
            {events.map((event) => (
              <div
                key={event.id}
                className="hover:bg-gray-100 border-b py-4 px-5 grid grid-cols-3 text-gray-950 text-sm cursor-pointer"
                onClick={() => toggleExpand(event.id)}
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

                  <div className="text-gray-300 mr-4">
                    {expandedEventId === event.id ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronRight />
                    )}
                  </div>
                </div>
                {expandedEventId === event.id && (
                  <div className="p-5 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold">ACTOR</h5>
                        <p>Name: {event.actorName}</p>
                        <p>Email: {event.targetName}</p>
                        <p>ID: {event.actorId}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold">ACTION</h5>
                        <p>Name: {event.action.name}</p>
                        <p>Object: {event.action.name}</p>
                        <p>ID: {event.action.id}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold">METADATA</h5>
                        <p>{event.metadata.description}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold">TARGET</h5>
                        <p>{event.targetName}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="py-4 px-5 grid grid-cols-3 text-gray-950 text-sm"
            >
              <div className="flex items-center">
                <Skeleton circle height={25} width={25} className="mr-4" />
                <Skeleton width={135} height={14} />
              </div>
              <Skeleton width={188} height={14} />
              <div className="flex items-center justify-between">
                <Skeleton width={100} height={14} />
                <div className="text-gray-300 mr-4 cursor-pointer">
                  <FaChevronRight />
                </div>
              </div>
            </div>
          ))
        )}
        {isLoadingMore &&
          Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="py-4 px-5 grid grid-cols-3 text-gray-950 text-sm"
            >
              <div className="flex items-center">
                <Skeleton circle height={25} width={25} className="mr-4" />
                <Skeleton width={135} height={14} />
              </div>
              <Skeleton width={188} height={14} />
              <div className="flex items-center justify-between">
                <Skeleton width={100} height={14} />
                <div className="text-gray-300 mr-4 cursor-pointer">
                  <FaChevronRight />
                </div>
              </div>
            </div>
          ))}
      </div>
      <button
        onClick={loadMore}
        className="flex w-full justify-center rounded-b-lg bg-gray-200 text-gray-500 font-semibold py-4"
      >
        Load More
      </button>
    </div>
  );
};

export default ActivityLog;
function useDebounce(search: string, arg1: number) {
  throw new Error("Function not implemented.");
}
