const express = require("express");
const cors = require("cors");
require('dotenv').config()
const brands = require("./brands.json");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.yh8qk3b.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db("productsDB").collection("products");
    const cartCollection = client.db("cartDB").collection("cart");
    
    app.get("/cart", async (req, res) => {
      const products = cartCollection.find();
      const result = await products.toArray();
      res.send(result);
    });

    //products
    app.get("/products", async (req, res) => {
      const products = productsCollection.find();
      const result = await products.toArray();
      res.send(result);
    });
    app.get("/products/:name", async (req, res) => {
      const name = req.params.name;
      const query = { brand: name };
      const products = productsCollection.find(query);
      const result = await products.toArray();
      res.send(result);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateProduct = {
        $set : {
          name : update.name,
          brand : update.brand,
          type : update.type,
          price : update.price,
          photo : update.photo,
          discription : update.discription,
          rating : update.rating,
        }
      }
      const result = await productsCollection.updateOne(filter, updateProduct);
      res.send(result);
    });

    //cart
    app.post("/cart", async (req, res) => {
      const product = req.body;
      const result = await cartCollection.insertOne(product);
      res.send(result);
    });
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
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

app.get("/", (req, res) => {
  res.send("stylePulse server is running");
});

app.get("/brands/:name", (req, res) => {
  const name = req.params.name;
  const brand = brands.brands.find((brand) => brand.name === name);
  const brandName = brand;
  res.send(brandName);
});
app.get("/brands", (req, res) => {
  res.send(brands);
});

app.listen(port, () => {
  console.log(`stylePuls server running port ${port}`);
});
