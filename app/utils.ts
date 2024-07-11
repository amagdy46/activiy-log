import { mkConfig, generateCsv, download } from "export-to-csv";
import { Event } from "./types";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
};

export const exportToCSV = (events: Event[]) => {
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
