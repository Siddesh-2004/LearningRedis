import express from "express";
import Redis from "ioredis";

const app = express();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.use(express.json());

//normal way to store user profile

app.post("/user/:id/json", async (req, res) => {
  await redis.set(`user:${req.params.id}`, JSON.stringify(req.body));
  res.json({
    message: "Saved as json",
  });
});

app.get("/user/:id/json", async (req, res) => {
  if (!(await redis.exists(`user:${req.params.id}`))) {
    res.status(404).json({
      message: "User not found",
    });
    return;
  }
  const userData = await redis.get(`user:${req.params.id}`);
  res.json({
    message: "Fetched as json",
    data: JSON.parse(userData),
  });
});


app.post("/user/:id/hash", async (req, res) => {
    await redis.hset(`user:${req.params.id}`, req.body);
    res.json({
        message:"Saved as hash"
    });
});


app.get("/user/:id/hash", async (req, res)=>{
    if(!(await redis.exists(`user:${req.params.id}`))){
        res.status(404).json({
            message:"User not found"
        });
        return;
    }
    const userData=await redis.hgetall(`user:${req.params.id}`);
    res.json({
        message:"Fetched as hash",
        data:userData
    }); 
})


app.delete("/user/:id/delete", async (req, res) => {
  await redis.del(`user:${req.params.id}`);
  res.json({
    message: "Deleted",
  });
}); 
 

app.listen(3000, () => {
  console.log("listening on port 3000");
});     