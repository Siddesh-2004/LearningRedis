import express from 'express';
import Redis  from 'ioredis';


const app = express();

app.use(express.json());

const redis=new Redis(process.env.REDIS_URL||'redis://localhost:6379');

const BANNER_KEY='app:banner';

app.post('/banner', async (req, res) => {
    const banner=req.body.message||'Welcome to my site';
    await redis.set(BANNER_KEY,banner);
    res.json({success:true});
});



app.get('/banner', async (req, res) => {
    const banner=await redis.get(BANNER_KEY);
    res.json({banner});
});


app.delete('/banner', async (req, res) => {
    await redis.del(BANNER_KEY);
    res.json({success:true});
});


app.get('/banner/exists', async (req, res) => { 
    const exists=await redis.exists(BANNER_KEY);
    res.json({exists:exists});
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});
