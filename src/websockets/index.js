import { fetchCard } from '../actions/cards';
import { fetchTransactions } from '../actions/transactions';
import notifications from '../services/notifications';

export default ({
  
  _ws: null,
  
  _store: null,
  
  _pingInterval: null,
  
  _pingIntervalTime: 1000 * 30,
  
  init(store) {
    this._store = store;
  },
  
  connect() {
    if (this._ws) {
      console.log('WS is already connected');
      return;
    }
    
    if (!this._store) {
      console.log('WS requires store');
      return;
    }
    
    let url;
    if (['test', 'dev'].includes(process.env.NODE_ENV)) {
      url = 'ws://localhost:4000/ws';
    } else {
      url = 'wss://wallet.kroniak.net/ws';
    }
  
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('WS requires JWT token');
      return;
    }
  
    this._ws = new WebSocket(`${url}?JWT=${token}`);
  
    this._ws.onopen = () => {
      notifications.init(document.title);
      console.log('WS connection is opened');
    };
    this._ws.onerror = () => console.log('WS connection error');
    this._ws.onclose = () => console.log('WS connection is closed');
    this._ws.onmessage = message => this._handleMessage(message);
    
    this._pingInterval = setInterval(() => this.ping(), this._pingIntervalTime);
  },
  
  disconnect() {
    if (!this._ws) {
      console.log('WS is already disconnected');
      return;
    }
    
    this._ws.close();
    this._ws = null;
    clearInterval(this._pingInterval);
    this._pingInterval = null;
  },
  
  ping() {
    if (!this._ws) {
      console.log('WS can not ping server - disconnected');
      return;
    }
    
    console.log('WS ping');
    this._ws.send('ping');
  },
  
  _handleMessage(message) {
    try {
      const { type, data } = JSON.parse(message.data);
      switch (type) {
        
        case 'CARD_IDS': {
          notifications.sendNotification('Я обновился 🎁');
          const { activeCardId } = this._store.getState().cards;
          data.forEach((cardId) => {
            this._store.dispatch(fetchCard(cardId));
            if (activeCardId === cardId) {
              this._store.dispatch(fetchTransactions(cardId));
            }
          });
          break;
        }
        
        default: {
          console.log('WS unexpected message type');
          break;
        }
        
      }
    } catch (err) {
      console.log(`WS wrong data: ${err.message}`);
    }
  }
  
});