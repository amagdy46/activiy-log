import React from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { Event } from "../types";
import { formatDate } from "../utils";

type EventRowProps = {
  event: Event;
  isExpanded: boolean;
  toggleExpand: (eventId: string) => void;
};

const EventRow: React.FC<EventRowProps> = ({
  event,
  isExpanded,
  toggleExpand,
}) => {
  return (
    <div
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
          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
        </div>
      </div>
    </div>
  );
};

export default EventRow;
