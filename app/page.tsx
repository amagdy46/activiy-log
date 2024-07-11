"use client";

import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import useSWR from "swr";
import { useDebounceValue } from "usehooks-ts";
import { APIResponse, Event } from "./types";
import { fetcher } from "./utils";
import SearchBar from "./components/SearchBar";
import EventRow from "./components/EventRow";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ExpandedEvent from "./components/ExpandedEvent";

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
    setSearch(e.target.value);
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
        <SearchBar
          search={search}
          onSearchChange={handleSearchChange}
          filters={filters}
          setFilters={setFilters}
          setIsLive={setIsLive}
          isLive={isLive}
          events={events}
        />
        <div className="grid grid-cols-3 text-gray-600  font-semibold">
          <h4 className="py-3 px-4">ACTOR</h4>
          <h4 className="py-3 px-4">ACTION</h4>
          <h4 className="py-3 px-4">DATE</h4>
        </div>
        {events.length ? (
          <div className="flex flex-col">
            {events.map((event) => (
              <div key={event.id}>
                <EventRow
                  event={event}
                  isExpanded={expandedEventId === event.id}
                  toggleExpand={toggleExpand}
                />
                {expandedEventId === event.id && (
                  <ExpandedEvent event={event} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <LoadingSkeleton count={10} />
        )}
        {isLoadingMore && <LoadingSkeleton count={10} />}
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
