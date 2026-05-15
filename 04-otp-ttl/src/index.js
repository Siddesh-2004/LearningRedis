import express from 'express';
import Redis  from 'ioredis';

const app = express();

const redis=new Redis(process.env.REDIS_URL||'redis://localhost:6379');

app.use(express.json());

function generateOtpKey(phoneNumber){
    return `otp:${phoneNumber}`;
}

function generateOtp(){
    return Math.floor(100000+Math.random()*900000);
}


app.post('/otp', async (req, res) => {
    const phoneNumber=req.body.phoneNumber;
    const otp=generateOtp();
    const otpKey=generateOtpKey(phoneNumber);
    await redis.set(otpKey,otp,'EX',30);//valid for 30 seconds
    res.json({message:"OTP sent successfully",otp,otpKey});
});

app.post('/otp/verify', async (req, res) => {
    const phoneNumber=req.body.phoneNumber;
    const otp=req.body.otp;
    const otpKey=generateOtpKey(phoneNumber);
    const checkOtpExists=await redis.exists(otpKey);
    if(!checkOtpExists){
        res.status(400).json({message:"OTP expired or not found"});             
        return ;
    }
    const storedOtp=await redis.get(otpKey);

    if(storedOtp===otp.toString()){
        await redis.del(otpKey);
        res.json({message:"OTP verified successfully"});
    }else{
        res.status(400).json({message:"Invalid OTP"});
    }
});


app.get('/otp/:phoneNumber', async (req, res)=>{
    const otpKey=generateOtpKey(req.params.phoneNumber);
    console.log(phoneNumber)
    const ttl=await redis.ttl(otpKey);
    res.json({ttl,otpKey});
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});