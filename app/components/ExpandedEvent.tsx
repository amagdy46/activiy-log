import { Event } from "../types";
import { formatDate } from "../utils";

type ExpandedEventProps = {
  event: Event;
};

const ExpandedEvent = ({ event }: ExpandedEventProps) => {
  return (
    <div className="relative col-span-3 mt-3 min-h-72 text-black">
      <div className="absolute -left-9 w-[105%] p-8 bg-white border border-gray-300 rounded-lg mt-2 shadow-xl z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <h5 className="font-semibold mb-6 text-gray-400">ACTOR</h5>
            <div className="grid grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-gray-400  uppercase">Name</p>
                <p className="text-gray-400  uppercase">Email</p>
                <p className="text-gray-400  uppercase">ID</p>
              </div>
              <div className="flex flex-col gap-2">
                <p>{event.actorName}</p>
                <p>{event.targetName}</p>
                <p>{event.actorId}</p>
              </div>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-6 text-gray-400">ACTION</h5>
            <div className="grid grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-gray-400  uppercase">Name</p>
                <p className="text-gray-400  uppercase">ID</p>
              </div>
              <div className="flex flex-col gap-2">
                <p>{event.action.name}</p>
                <p>{event.action.id}</p>
              </div>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-6 text-gray-400">DATE</h5>
            <div className="grid grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-gray-400  uppercase">Readable</p>
              </div>
              <div className="flex flex-col gap-2">
                <p>{formatDate(event.occurredAt)}</p>
              </div>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-6 text-gray-400">METADATA</h5>
            <div className="grid grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-gray-400 uppercase">Description</p>
                <p className="text-gray-400 uppercase">Redirect</p>
              </div>
              <div className="flex flex-col gap-2">
                <p>{event.metadata.description}</p>
                <p>{event.metadata.redirect}</p>
              </div>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-6 text-gray-400">TARGET</h5>
            <div className="grid grid-cols-2">
              <div className="flex flex-col">
                <p className="text-gray-400  uppercase">Name</p>
              </div>
              <div className="flex flex-col gap-2">
                <p>{event.targetName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedEvent;
