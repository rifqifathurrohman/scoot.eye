export interface StatusCheck {
  id: string;
  client_name: string;
  timestamp: string;
}

export interface StatusCheckCreate {
  client_name: string;
}