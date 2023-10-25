const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.tloczwa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const carsCollection = client.db("carsDB").collection("cars");

        // create data
        app.post('/cars', async (req, res) => {
            const newCars = req.body;
            console.log(newCars)
            const result = await carsCollection.insertOne(newCars);
            res.send(result)
        })

        // read data
        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // get data
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carsCollection.findOne(query);
            res.send(result)
        })

        //update data
        app.put('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateCar = req.body;
            const car = {
                $set: {
                    model: updateCar.model,
                    brand: updateCar.brand,
                    type: updateCar.type,
                    price: updateCar.price,
                    image: updateCar.image,
                    rating: updateCar.rating
                }
            }
            const result = await carsCollection.updateOne(query, car, options)
            res.send(result)
        })

        // delete data
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.deleteOne(query);
            res.send(result)
        })

        
        //cart items
        const cartCollection = client.db("carsDB").collection("cart")

        // add cart
        app.post('/cart/add', async (req, res) => {
            const selectedCar = req.body;
            const result = await cartCollection.insertOne(selectedCar);
            res.send(result)
        })

        // read data 
        app.get('/cart/add', async (req, res) => {
            const cursor = cartCollection.find();
            const result = await cursor.toArray()
            res.send(result);
        })

        // delete car from cart
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await cartCollection.deleteOne(query)
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Car Universe Server is Running...")
})

app.listen(port, () => {
    console.log(`Car Universe Server is Running on ${port}`);
})