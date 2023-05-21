const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};

/* const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
}; */

//* middlewares
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
// app.use(cors());
app.use(express.json());
// app.use(cors(corsOptions));

//* integrating with mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ketp048.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("kidduDB");
    const toysCollection = database.collection("toys");
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "ToyName" };
    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    /* ---------------------------------------------------------------
                      All Get Request
    --------------------------------------------------------------- */

    //! get req from search field in all toys page
    app.get("/searchByToyName/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toysCollection
        .find({ toyName: { $regex: text, $options: "i" } })
        .toArray();
      res.send(result);
    });
    //! get req from shop by category section
    app.get("/toys_category", async (req, res) => {
      const result = await toysCollection.find(req.query).toArray();
      res.send(result);
    });

    //! get req from trending section
    app.get("/trending_toys", async (req, res) => {
      const result = await toysCollection
        .find({ trending: !!req.query.trending })
        .toArray();
      res.send(result);
    });

    //! get req from all toys page
    app.get("/toys", async (req, res) => {
      const result = await toysCollection.find().limit(20).toArray();
      res.send(result);
    });

    //! get req from single toy details route
    app.get("/toy/:id", async (req, res) => {
      const result = await toysCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    //! get req from my toys page
    app.get("/my_toys", async (req, res) => {
      const result = await toysCollection.find(req.query).toArray();
      res.send(result);
    });

    /* ---------------------------------------------------------------
                      All Post Request
    --------------------------------------------------------------- */

    //! post req from add a toy page
    app.post("/toys", async (req, res) => {
      const result = await toysCollection.insertOne(req.body);
      console.log(result);
    });

    /* ---------------------------------------------------------------
                      All Put Request
    --------------------------------------------------------------- */

    //! put req from my toys page
    app.put("/my_toys/:id", async (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) };
      const updateDoc = {
        $set: {
          ...req.body,
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
      console.log(result);
    });

    /* ---------------------------------------------------------------
                      All Delete Request
    --------------------------------------------------------------- */

    //! delete req from my toys page
    app.delete("/my_toys/:id", async (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) };
      const result = await toysCollection.deleteOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//* initial get request for testing server
app.get("/", (req, res) => {
  res.send("Toys are playing around here!");
});

//* testing the server whether it's running properly on the port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
