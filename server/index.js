const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const {User} = require("./models/User");
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose')
const config = require('./models/config/key')
const {auth} = require('./middleware/auth');


app.use(bodyParser.urlencoded({extended: true})); //urlencode 형식 

app.use(bodyParser.json()); //json 형식

app.use(cookieParser()); //쿠키 사용


mongoose.connect(config.mongoURI,{
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true,useFindAndModify:false
}).then(() => console.log('connect complete')) // 연결 성공시 해당 로그 찍기
.catch(err => console.log(err)) // 에러로그


app.get('/', (req, res) => res.send('Hello World!'))


app.post('/api/users/register',(req,res)=> {
    
    const user = new User(req.body)

    user.save((err,user)=>{

        if(err) return res.json({success:false, err});
        
        return res.status(200).json({
            sucess:true
        })
    })

})
// 로그인 
app.post('/api/users/login',(req,res) => {

    //요청된 이메일을 데이터베이스에서 매칭
    User.findOne({email:req.body.email},(err,user) => {
        if(!user){
            return res.json({
                loginSuceess: false,
                message:"해당 유저가 없습니다."
            })
        }
    

    //요청된 이메일이 데이터베이스에 있다면 비밀번호가 매칭이되는지 확인
    user.comparePassword(req.body.password,(err,isMatch)=>{
        if(!isMatch)
            return res.json({ loginSuceess:false, message:"비밀번호가 틀렸습니다" })
    
    //비밀번호 매칭이 된다면 토큰을 생성한다
    
        user.generateToken((err,user) => {
        if(err) return res.status(400).send(err);
            
        res.cookie("x_auth",user.token)
        .status(200)
        .json({loginSuceess:true, userId:user._id})
                
       })
    })
  })
})
//로그인 인증 (세션이랑비슷)
app.get('/api/users/auth',auth,(req,res) =>{
    //여기까지 미들웨어를 통과햇다는 얘기는 auth가 true 라는 말
    res.status(200).json({
        _id:req.user._id,
        isAdmin:req.user.role === 0 ? false:true,
        isAuth:true,
        email:req.user.email,
        name:req.user.name,
        lastname:req.user.lastname,
        role:req.user.role,
        image:req.user.image
    })
})

//로그아웃
app.get('/api/users/logout', auth , (req,res) => {

    User.findOneAndUpdate({_id:req.user._id},
        {token:""} , (err,user) =>{
            if(err) return res.json({success:false,err});
            return res.status(200).send({
                success:true
            })
        })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))