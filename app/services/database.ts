import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { ReceiptItem } from './receiptAnalyzer';

// In-memory storage for web platform
let inMemoryStorage: StoredItem[] = [];

export interface StoredItem extends ReceiptItem {
  id: number;
  dateAdded: string;
}

type SQLTransaction = any;
type SQLError = any;
type SQLResultSet = any;

let db: any;

try {
  if (Platform.OS !== 'web') {
    db = SQLite.openDatabaseSync('pantrypal.db');
  }
} catch (error) {
  console.error('Error initializing database:', error);
}

export function initDatabase() {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'web') {
      console.log('Using in-memory storage for web platform');
      resolve(true);
      return;
    }

    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, quantity REAL NOT NULL, unit TEXT, dateAdded TEXT NOT NULL);',
        [],
        () => {
          console.log('Database initialized');
          resolve(true);
        },
        (_: SQLTransaction, error: SQLError) => {
          console.error('Error initializing database:', error);
          reject(error);
        }
      );
    });
  });
}

export function addItems(items: ReceiptItem[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'web') {
      const dateAdded = new Date().toISOString();
      const newItems = items.map((item, index) => ({
        ...item,
        id: inMemoryStorage.length + index + 1,
        dateAdded,
      }));
      inMemoryStorage = [...inMemoryStorage, ...newItems];
      resolve();
      return;
    }

    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.transaction((tx: SQLTransaction) => {
      const dateAdded = new Date().toISOString();
      
      items.forEach(item => {
        tx.executeSql(
          'INSERT INTO items (name, quantity, unit, dateAdded) VALUES (?, ?, ?, ?);',
          [item.name, item.quantity, item.unit || null, dateAdded],
          () => {},
          (_: SQLTransaction, error: SQLError) => {
            console.error('Error adding item:', error);
            reject(error);
            return false;
          }
        );
      });
    }, 
    (error: SQLError) => {
      console.error('Transaction error:', error);
      reject(error);
    },
    () => {
      resolve();
    });
  });
}

export function getAllItems(): Promise<StoredItem[]> {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'web') {
      resolve([...inMemoryStorage]);
      return;
    }

    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        'SELECT * FROM items ORDER BY dateAdded DESC;',
        [],
        (_: SQLTransaction, { rows }: SQLResultSet) => {
          resolve(rows._array as StoredItem[]);
        },
        (_: SQLTransaction, error: SQLError) => {
          console.error('Error getting items:', error);
          reject(error);
        }
      );
    });
  });
}

export function deleteItem(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'web') {
      inMemoryStorage = inMemoryStorage.filter(item => item.id !== id);
      resolve();
      return;
    }

    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        'DELETE FROM items WHERE id = ?;',
        [id],
        () => {
          resolve();
        },
        (_: SQLTransaction, error: SQLError) => {
          console.error('Error deleting item:', error);
          reject(error);
        }
      );
    });
  });
}

const database = {
  initDatabase,
  addItems,
  getAllItems,
  deleteItem,
};

export default database; 