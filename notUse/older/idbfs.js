//this is from installs/emdsk_portable/emscripten/1.30.0/src/library_idbfs.js
  var IDBFS = {
    dbs: {},
    indexedDB: function() {
      if (typeof indexedDB !== 'undefined') return indexedDB;
      var ret = null;
      if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      assert(ret, 'IDBFS used, but indexedDB not supported');
      return ret;
    },
    DB_VERSION: 21,
    DB_STORE_NAME: 'FILE_DATA',
    getDB: function(name, callback) {
      // check the cache first
      var db = IDBFS.dbs[name];
      if (db) {
        return callback(null, db);
      }

      var req;
      try {
        req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
      } catch (e) {
        return callback(e);
      }
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        var transaction = e.target.transaction;

        var fileStore;

        if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
          fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
        } else {
          fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
        }

        if (!fileStore.indexNames.contains('timestamp')) {
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      req.onsuccess = function() {
        db = req.result;

        // add to the cache
        IDBFS.dbs[name] = db;
        callback(null, db);
      };
      req.onerror = function(e) {
        callback(this.error);
        e.preventDefault();
      };
    },
    getRemoteSet: function(mount, callback) {
      var entries = {};

      IDBFS.getDB(mount.mountpoint, function(err, db) {
        if (err) return callback(err);

        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
        transaction.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };

        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
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
    },
    loadRemoteEntry: function(store, path, callback) {
      var req = store.get(path);
      req.onsuccess = function(event) { callback(null, event.target.result); };
      req.onerror = function(e) {
        callback(this.error);
        e.preventDefault();
      };
    },
    storeRemoteEntry: function(store, path, entry, callback) {
      var req = store.put(entry, path);
      req.onsuccess = function() { callback(null); };
      req.onerror = function(e) {
        callback(this.error);
        e.preventDefault();
      };
    },
    removeRemoteEntry: function(store, path, callback) {
      var req = store.delete(path);
      req.onsuccess = function() { callback(null); };
      req.onerror = function(e) {
        callback(this.error);
        e.preventDefault();
      };
    }
  };

// store as a parameter below becomes IDBFS.getDB('/WS')

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
 IDBFS.storeRemoteEntry(
 IDBFS.getDB('/WS'),
 '/WS/G4/entryname.txt',
 EmFile,
 function(err, result){ console.log('err',err, '; result', result);};
 );
 */
