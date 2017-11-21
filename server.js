const express = require('express');
const app = express();

require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const url = process.env.MONGODB_URL;

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/getBookmarks', (req, res) => {
  MongoClient.connect(url, function(err, database) {
    let db = database.collection("bookmarks");
    db.find(ObjectId("5a12182af36d2815c109125d")).next(function(err, data) {
      res.send(data);
    });
  });
});

app.post('/addBookmark', (req, res) => {
  MongoClient.connect(url, function(err, database) {
    let db = database.collection("bookmarks");
    let data = req.body;

    let folder = data.folder;

    let bookmark = {
      title: data.title,
      url: data.url
    }

    db.update({
      _id: ObjectId("5a12182af36d2815c109125d")
    }, {
      $addToSet: {
        [folder]: bookmark
      }
    });

    if (folder === "Bookmarks") {
      res.send(bookmark);
    } else {
      db.find({
        [folder]: {
          $exists: true
        }
      }).next(function(err, data) {

        let NumberofItemsinFolder = data[folder].length;
        let BookmarkinFolderData = {
          title: bookmark.title,
          url: bookmark.url,
          folder: folder,
          itemsinFolder: NumberofItemsinFolder
        };

        res.send(BookmarkinFolderData);
      });
    }
  });
});

app.post('/addFolder', (req, res) => {
  let data = req.body;
  MongoClient.connect(url, function(err, database) {
    let db = database.collection("bookmarks");

    let folder = data.folder;

    db.find({
      [folder]: {
        $exists: true
      }
    }).next(function(err, data) {
      if (data) {
        res.send("already exists");
      } else if (!data) {
        db.update({
          _id: ObjectId("5a12182af36d2815c109125d")
        }, {
          $set: {
            [folder]: []
          }
        });

        let folderInfo = {
          title: folder
        };

        res.send(folderInfo);
      }
    });
  });
});

app.delete('/removeBookmark', (req, res) => {
  MongoClient.connect(url, function(err, database) {
    let db = database.collection("bookmarks");
    let data = req.body;
    let bookmark = {
      'title': data.title,
      'url': data.url
    }

    if (data.InFolder === 'true') {
      db.update({
        _id: ObjectId("5a12182af36d2815c109125d")
      }, {
        $pull: {
          [data.folder]: bookmark
        }
      });
      res.send(data.folder);
    } else {
      db.update({
        _id: ObjectId("5a12182af36d2815c109125d")
      }, {
        $pull: {
          Bookmarks: bookmark
        }
      });
      res.send("deleted");
    }

  });
});

app.listen(process.env.PORT, () => {
  console.log('app listening on port!');
});
