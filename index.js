const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const {User} = require("./models/User");
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose')
const config = require('./config/key')


app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.use(cookieParser());


mongoose.connect(config.mongoURI,{
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true,useFindAndModify:false
}).then(() => console.log('connect complete'))
.catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World!'))


app.post('/register',(req,res)=> {
    
    const user = new User(req.body)

    user.save((err,userInfo)=>{

        if(err) return res.json({success:false, err})
        
        return res.status(200).json({
            sucess:true
        })
    })

})

app.post('./login',(req,res) =>{

    //요청된 이메일을 데이터베이스에서 매칭
    User.findOne({email:req.body.email},(err,user)=> {
        if(!user){
            return res.json({
                loginSuceess: false,
                message:"해당 유저가 없습니다."
            })
        }
    })

    //요청된 이메일이 데이터베이스에 있다면 비밀번호가 매칭이되는지 확인
    User.comparePassword(req.body.password,(err,isMatch)=>{
        if(!isMatch)
        return res.json({loginSuceess:false, message:"비밀번호가 틀렸습니다"
    
   
    })

    })
    //비밀번호 매칭이 된다면 토큰을 생성한다
    user.generateToken((err,user) => {


    })

})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))