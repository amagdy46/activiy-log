// types.ts

export interface Action {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  actorId: string;
  actorName: string;
  group: string;
  actionId: string;
  action: Action;
  targetId: string;
  targetName: string;
  location: string;
  occurredAt: string;
  metadata: Metadata;
}

type Metadata = {
  redirect: string;
  description: string;
  x_request_id: string;
};

export interface APIResponse {
  events: Event[];
  total: number;
  page: number;
  pageSize: number;
}
