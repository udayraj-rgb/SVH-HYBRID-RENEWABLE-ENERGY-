import { Client } from '@stomp/stompjs';

let stompClient = null;
const subscribers = new Set();

export const getStompClient = () => {
  if (stompClient) {
    return stompClient;
  }

  const brokerURL = 'ws://localhost:8080/ws/tejas-grid';

  stompClient = new Client({
    brokerURL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      // debug logs suppressed in production
    },
    onConnect: () => {
      console.log('STOMP WebSocket connected to TEJAS GRID broker (/ws/tejas-grid)');
      subscribers.forEach((fn) => fn());
    },
    onStompError: (frame) => {
      console.warn('STOMP error:', frame.headers['message']);
    },
    onWebSocketClose: () => {
      // Handled by auto-reconnectDelay
    },
  });

  stompClient.activate();
  return stompClient;
};

/**
 * Subscribes to live telemetry power flows for a specific campus.
 * Topic: /topic/campus/{campusId}/live-telemetry
 */
export const subscribeCampusTelemetry = (campusId, onMessage) => {
  const client = getStompClient();
  let subscription = null;

  const doSubscribe = () => {
    if (client.connected) {
      try {
        subscription = client.subscribe(`/topic/campus/${campusId}/live-telemetry`, (message) => {
          try {
            const data = JSON.parse(message.body);
            onMessage(data);
          } catch (e) {
            console.error('Error parsing live telemetry payload:', e);
          }
        });
      } catch (err) {
        console.warn('Failed subscribing to live telemetry:', err);
      }
    }
  };

  if (client.connected) {
    doSubscribe();
  }
  subscribers.add(doSubscribe);

  return () => {
    subscribers.delete(doSubscribe);
    if (subscription) {
      try {
        subscription.unsubscribe();
      } catch (e) {}
    }
  };
};

/**
 * Subscribes to real-time bilingual operational advisories for a specific campus.
 * Topic: /topic/campus/{campusId}/advisories
 */
export const subscribeCampusAdvisories = (campusId, onMessage) => {
  const client = getStompClient();
  let subscription = null;

  const doSubscribe = () => {
    if (client.connected) {
      try {
        subscription = client.subscribe(`/topic/campus/${campusId}/advisories`, (message) => {
          try {
            const data = JSON.parse(message.body);
            onMessage(data);
          } catch (e) {
            console.error('Error parsing advisory payload:', e);
          }
        });
      } catch (err) {
        console.warn('Failed subscribing to advisories:', err);
      }
    }
  };

  if (client.connected) {
    doSubscribe();
  }
  subscribers.add(doSubscribe);

  return () => {
    subscribers.delete(doSubscribe);
    if (subscription) {
      try {
        subscription.unsubscribe();
      } catch (e) {}
    }
  };
};

/**
 * Subscribes to statewide aggregate rollup metrics for Directorate executive dashboards.
 * Topic: /topic/statewide/rollup
 */
export const subscribeStatewideRollup = (onMessage) => {
  const client = getStompClient();
  let subscription = null;

  const doSubscribe = () => {
    if (client.connected) {
      try {
        subscription = client.subscribe('/topic/statewide/rollup', (message) => {
          try {
            const data = JSON.parse(message.body);
            onMessage(data);
          } catch (e) {
            console.error('Error parsing statewide rollup payload:', e);
          }
        });
      } catch (err) {
        console.warn('Failed subscribing to statewide rollup:', err);
      }
    }
  };

  if (client.connected) {
    doSubscribe();
  }
  subscribers.add(doSubscribe);

  return () => {
    subscribers.delete(doSubscribe);
    if (subscription) {
      try {
        subscription.unsubscribe();
      } catch (e) {}
    }
  };
};
