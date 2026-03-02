/**
 * WebSocket Service for Real-time Job Updates
 * Provides real-time updates for job status changes via WebSocket connection
 */

import { AsyncJob, JobStatus } from './asyncJobService';

type MessageHandler = (job: AsyncJob) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Event) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private disconnectionHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private isConnecting = false;
  private shouldReconnect = true;

  /**
   * Connect to WebSocket server
   */
  connect(url?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    
    const wsUrl = url || this.getWebSocketUrl();
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Authenticate if token exists
        const token = localStorage.getItem('token');
        if (token && this.ws) {
          this.ws.send(JSON.stringify({ type: 'auth', token }));
        }
        
        this.connectionHandlers.forEach(handler => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'job_update':
              this.handleJobUpdate(data.job);
              break;
            case 'job_complete':
              this.handleJobUpdate(data.job);
              break;
            case 'job_failed':
              this.handleJobUpdate(data.job);
              break;
            case 'ping':
              // Respond to keep-alive ping
              if (this.ws) {
                this.ws.send(JSON.stringify({ type: 'pong' }));
              }
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.errorHandlers.forEach(handler => handler(error));
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;
        
        this.disconnectionHandlers.forEach(handler => handler());
        
        // Attempt to reconnect
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          
          console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          setTimeout(() => {
            this.connect(wsUrl);
          }, delay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }

  /**
   * Subscribe to job updates
   */
  subscribe(jobId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        jobId,
      }));
    }
  }

  /**
   * Unsubscribe from job updates
   */
  unsubscribe(jobId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        jobId,
      }));
    }
  }

  /**
   * Add message handler
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Add connection handler
   */
  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Add disconnection handler
   */
  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectionHandlers.add(handler);
    return () => this.disconnectionHandlers.delete(handler);
  }

  /**
   * Add error handler
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get WebSocket connection state
   */
  getState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Handle job update message
   */
  private handleJobUpdate(job: AsyncJob): void {
    this.messageHandlers.forEach(handler => handler(job));
  }

  /**
   * Get WebSocket URL from environment or default
   */
  private getWebSocketUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    return `${wsUrl}/ws/jobs`;
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

export default webSocketService;

/**
 * React Hook for WebSocket connection
 */
import { useEffect, useState } from 'react';

export const useWebSocketConnection = (autoConnect = true) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);

  useEffect(() => {
    if (autoConnect) {
      webSocketService.connect();
    }

    const unsubscribeConnect = webSocketService.onConnect(() => {
      setConnected(true);
      setError(null);
    });

    const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
      setConnected(false);
    });

    const unsubscribeError = webSocketService.onError((err) => {
      setError(err);
    });

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, [autoConnect]);

  return { connected, error };
};

/**
 * React Hook for job updates via WebSocket
 */
export const useWebSocketJobUpdates = (
  onJobUpdate: (job: AsyncJob) => void,
  jobIds?: string[]
) => {
  useEffect(() => {
    const unsubscribe = webSocketService.onMessage(onJobUpdate);

    // Subscribe to specific jobs if provided
    if (jobIds) {
      jobIds.forEach(jobId => webSocketService.subscribe(jobId));
    }

    return () => {
      unsubscribe();
      
      // Unsubscribe from jobs
      if (jobIds) {
        jobIds.forEach(jobId => webSocketService.unsubscribe(jobId));
      }
    };
  }, [onJobUpdate, jobIds]);
};
