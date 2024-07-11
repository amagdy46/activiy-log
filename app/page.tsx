"use client";

import { download, generateCsv, mkConfig } from "export-to-csv";
import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import {
  FaChevronDown,
  FaChevronRight,
  FaCircle,
  FaDownload,
} from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useSWR from "swr";
import { useDebounceValue } from "usehooks-ts";
import { APIResponse, Event } from "./types";
import { formatDate } from "./utils";

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

  const { data, error, mutate } = useSWR<APIResponse>(
    `/api/events?page=${page}&pageSize=10&search=${search}&actorId=${filters.actorId}&targetId=${filters.targetId}&actionId=${filters.actionId}`,
    fetcher
  );

  useEffect(() => {
    if (data?.events.length) {
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
    if (search === "") return;
    setEvents([]);
    setPage(1);
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-full mt-48 p-24">
        <FaExclamationTriangle className="text-red-500 text-6xl" />
        <h2 className="mt-4 text-2xl font-bold text-red-500">Failed to load</h2>
        <p className="text-gray-600 mt-2">
          There was an error loading the data. Please try again later.
        </p>
      </div>
    );
  return (
    <div className="container mx-auto py-16 h-dvh">
      <div className="min-w-full border rounded-t-2xl text-gray-400 shadow-sm">
        <div className="p-4 bg-[#f5f5f5] rounded-t-2xl">
          <div className="mb-4 flex w-full p-0 bg-[#f5f5f5] text-xs text-gray-500 border border-gray-300 rounded-lg">
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
                  <div className="relative col-span-3 mt-3 min-h-72">
                    <div className="absolute -left-9 w-[105%] p-8 bg-white border border-gray-300 rounded-lg mt-2 shadow-xl z-10">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-semibold mb-6 text-gray-400">
                            ACTOR
                          </h5>
                          <div className="grid grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <p className="text-gray-400 mr-12 uppercase">
                                Name
                              </p>
                              <p className="text-gray-400 mr-12 uppercase">
                                Email
                              </p>
                              <p className="text-gray-400 mr-20 uppercase">
                                ID
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <p>{event.actorName}</p>
                              <p>{event.targetName}</p>
                              <p>{event.actorId}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-6 text-gray-400">
                            ACTION
                          </h5>
                          <div className="grid grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <p className="text-gray-400 mr-12 uppercase">
                                Name
                              </p>
                              <p className="text-gray-400 mr-20 uppercase">
                                ID
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <p>{event.action.name}</p>
                              <p>{event.action.id}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-6 text-gray-400">
                            DATE
                          </h5>
                          <div className="grid grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <p className="text-gray-400 mr-12 uppercase">
                                Readable
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <p>{formatDate(event.occurredAt)}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-6 text-gray-400">
                            METADATA
                          </h5>
                          <div className="grid grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <p className="text-gray-400 uppercase">
                                Description
                              </p>

                              <p className="text-gray-400 uppercase">
                                Redirect
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <p>{event.metadata.description}</p>
                              <p>{event.metadata.redirect}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-6 text-gray-400">
                            TARGET
                          </h5>
                          <div className="grid grid-cols-2">
                            <div className="flex flex-col">
                              <p className="text-gray-400 mr-12 uppercase">
                                Name
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <p>{event.targetName}</p>
                            </div>
                          </div>
                        </div>
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
        className="flex w-full justify-center rounded-b-lg bg-[#f5f5f5] text-gray-500 font-semibold py-4"
      >
        Load More
      </button>
    </div>
  );
};

export default ActivityLog;
