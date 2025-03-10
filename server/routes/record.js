import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// This section will help you get a list of all the records.
router.get("/", async (req, res) => {
  let collection = await db.collection("records");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// This section will help you delete multiple records
router.delete("/bulk", async (req, res) => {
  try {
    const ids = req.body.ids; // Expect an array of ids in the request body
    
    if (!Array.isArray(ids)) {
      return res.status(400).send("Invalid input: ids must be an array");
    }

    const objectIds = ids.map(id => new ObjectId(id));
    const query = { _id: { $in: objectIds } };

    const collection = db.collection("records");
    const result = await collection.deleteMany(query);

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error performing bulk delete");
  }
});

// This section will help you get a single record by id
router.get("/:id", async (req, res) => {
  let collection = await db.collection("records");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// This section will help you create a new record.
router.post("/", async (req, res) => {
  try {
    let newDocument = {
      name: req.body.name,
      position: req.body.position,
      level: req.body.level,
    };
    let collection = await db.collection("records");
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
});

// This section will help you update a record by id.
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        name: req.body.name,
        position: req.body.position,
        level: req.body.level,
      },
    };

    let collection = await db.collection("records");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

// This section will help you delete a record
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection("records");
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

// This section will help you insert multiple records from Excel upload
router.post("/bulk-insert", async (req, res) => {
  try {
    const records = req.body.records;
    
    if (!Array.isArray(records)) {
      return res.status(400).send("Invalid input: records must be an array");
    }

    // Validate each record
    const validRecords = records.map(record => ({
      name: record.name,
      position: record.position,
      level: record.level,
    }));

    let collection = await db.collection("records");
    const result = await collection.insertMany(validRecords);
    
    res.status(200).json({
      message: `Successfully inserted ${result.insertedCount} records`,
      insertedIds: result.insertedIds
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error performing bulk insert");
  }
});

export default router;
