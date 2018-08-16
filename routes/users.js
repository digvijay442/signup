var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var jwt = require('jsonwebtoken');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/register', function(req, res, next){
  console.log('------register---------')
  console.log(req.body)
  addToDB(req, res);
})

async function addToDB(req, res){
  var user = new User({
    name: req.body.name,
    email: req.body.email,
    contact: req.body.contact,
    password: User.hashPassword(req.body.password),
    creation_dt: Date.now()
  })

  try{
    // doc = await user.save();
    // console.log(doc)
    // return res.json(doc); 
      User.find({email: user.email}, function(err, data){
        if(err) {res.json({'message': 'Please check database connection'}); return};
        if(data.length > 0){
          res.json({message: 'User already exists. Please enter unique email.', type: 'warn'})
        } else {
          user.save(function(err, data){
            obj = Object.assign({data}, {message: 'User registered successfully.', type: 'success'})
            console.log(obj)
            res.json(obj);
          })
        }
    })
  }
  catch(err){
    return res.status(501).json(err);
  }

}

router.post('/login', function(req, res, next){
  console.log(req.body.email)
  User.findOne({email: req.body.email}).exec()
  .then(function(doc){
    console.log('----------doc-----------')
    console.log(doc)
    if(doc){
      if(doc.isValid(req.body.password)){
        // generate token
        let token = jwt.sign({username: doc.name, email: doc.email, contact: doc.contact}, 'secret_hlfdjlsdkfj', {expiresIn: '3h'});
        return res.status(200).json(token);
      } else {
        return res.status(501).json({message: 'Invalid credentials'})
      }
    } else {
      return res.status(501).json({message: 'Invalid credentials'})
    }
  })
})

router.get('/home', isValidToken, function(req, res, next){
  console.log('decodedToken---------')
  console.log(decodedToken)
  return res.status(200).json({name: decodedToken.username, 
                              email: decodedToken.email,
                              contact: decodedToken.contact});
})


decodedToken = '';
function isValidToken(req, res, next){
  let token = req.query.tokenKey;
  console.log('token')
  console.log(token)
  jwt.verify(token, 'secret_hlfdjlsdkfj', function(err, tokenData){
    if(err){
      res.status(501).json({message: 'Unauthorized request.'})
    }
    if(tokenData){
      console.log('tokendata---')
      console.log(tokenData)
      decodedToken = tokenData;
      next();
    }

  })
}

module.exports = router;
