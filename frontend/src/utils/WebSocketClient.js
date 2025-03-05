export class WebSocketClient {
  constructor(url, onOpen, onMessage, onError, onClose) {
    this.url = url;
    this.ws = null;
    this.onOpen = onOpen;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onClose = onClose;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = (event) => {
        console.log('WebSocket connection established');
        if (this.onOpen) this.onOpen(event);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessage) this.onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.onError) this.onError(error);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket connection closed');
        if (this.onClose) this.onClose(event);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not open');
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default WebSocketClient;