//this is from installs/emdsk_portable/emscripten/1.30.0/src/library_idbfs.js
var IDBfs = {
  dbs: {},
  DB_VERSION: 21,
  DB_STORE_NAME: 'FILE_DATA',
};
  function indexedDB() {
    if (typeof indexedDB !== 'undefined') return indexedDB;
    var ret = null;
    if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    assert(ret, 'IDBfs used, but indexedDB not supported');
    return ret;
  };
  function getDB(name, callback) {
    // check the cache first
    var db = IDBfs.dbs[name];
    if (db) {
      return callback(null, db);
    }

    var req;
    try {
      req = IDBfs.indexedDB().open(name, IDBfs.DB_VERSION);
    } catch (e) {
      return callback(e);
    }
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      var transaction = e.target.transaction;

      var fileStore;

      if (db.objectStoreNames.contains(IDBfs.DB_STORE_NAME)) {
        fileStore = transaction.objectStore(IDBfs.DB_STORE_NAME);
      } else {
        fileStore = db.createObjectStore(IDBfs.DB_STORE_NAME);
      }

      if (!fileStore.indexNames.contains('timestamp')) {
        fileStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    req.onsuccess = function() {
      db = req.result;

      // add to the cache
      IDBfs.dbs[name] = db;
      callback(null, db);
    };
    req.onerror = function(e) {
      callback(this.error);
      e.preventDefault();
    };
  };
  function getRemoteSet(mount, callback) {
    var entries = {};

    IDBfs.getDB(mount.mountpoint, function(err, db) {
      if (err) return callback(err);

      var transaction = db.transaction([IDBfs.DB_STORE_NAME], 'readonly');
      transaction.onerror = function(e) {
        callback(this.error);
        e.preventDefault();
      };

      var store = transaction.objectStore(IDBfs.DB_STORE_NAME);
      var index = store.index('timestamp');

      index.openKeyCursor().onsuccess = function(event) {
        var cursor = event.target.result;

        if (!cursor) {
          return callback(null, { type: 'remote', db: db, entries: entries });
        }

        entries[cursor.primaryKey] = { timestamp: cursor.key };

        cursor.continue();
      };
    });
  };
  function loadRemoteEntry(store, path, callback) {
    var req = store.get(path);
    req.onsuccess = function(event) { callback(null, event.target.result); };
    req.onerror = function(e) {
      callback(this.error);
      e.preventDefault();
    };
  };
  function storeRemoteEntry(store, path, entry, callback) {
    var req = store.put(entry, path);
    req.onsuccess = function() { callback(null); };
    req.onerror = function(e) {
      callback(this.error);
      e.preventDefault();
    };
  };
  function removeRemoteEntry(store, path, callback) {
    var req = store.delete(path);
    req.onsuccess = function() { callback(null); };
    req.onerror = function(e) {
      callback(this.error);
      e.preventDefault();
    };
  };


// store as a parameter below becomes IDBfs.getDB('/WS')

/*  Example call
 var emTxt = encodeUtf8('George');
 var emContents = UTF8.getBytes(emTxt);
 // to go back
 var emTxt2 = UTF8.getString(emContents);
 var jsTxt = decodeUtf8(emTxt2);
 console.log('emTxt', emTxT, '; jsTxt', jsTxt);

 var EmFile = {
 timestamp: Date.now(),
 mode: 33206,
 contents: emContents
 };
 IDBfs.storeRemoteEntry(
 IDBfs.getDB('/WS'),
 '/WS/G4/entryname.txt',
 EmFile,
 function(err, result){ console.log('err',err, '; result', result);};
 );
 */


