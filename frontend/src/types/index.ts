export interface Case {
  id: string;
  title: string;
  difficulty?: string;
  case_type?: string;
}

export interface Session {
  session_id: string;
  status: string;
}

export interface Turn {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface WebSocketMessage {
  type: 'agent_message' | 'user_message' | 'end_session' | 'session_ended' | 'error';
  text?: string;
  message?: string;
  error?: string;
}
