const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
// const cookieParser = require('cookie-parser'); // replaced with cookie session
const bcrypt = require("bcryptjs");
//app.use(cookieParser()); // replaced with cookie session
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // EJS engine
const salt = bcrypt.genSaltSync(10);
const { findUserByEmail } = require("./helper")

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt),
  },
};


const generateRandomString = () => { // generates 6 alpha numeric characters random Id;
  return (Math.random() + 1).toString(36).substring(6);
};


 const findUserId = function (users, email) { // checks if user ID exists in users object
  for (let userId in users) {
    if (users[userId].email === email) {
     return userId; 
    }
  }
 }

 const checkPassword = function (users, email, password) {
  for (let userId in users) {
    if (users[userId].email === email && bcrypt.compareSync(password, users[userId].password )) {
     return true; 
    }
  }
 }

 const urlsForUser = function (id) {
  
  let urlsObject = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlsObject[key] = urlDatabase[key].longURL;
    }
  }
  return urlsObject;
 }

app.use(express.urlencoded({ extended: true })); // express library, decodes req.body (key=value) to {key: value}

app.get("/urls", (req, res) => { // renders index page with all URLs
  if (!req.session.user_id) { // redirection if user logged in
    return res.send("<html><body>You<b>MUST</b>log in or register to shorten URL!!! <a href='http://localhost:8080/login'>Login here</a> <a href='http://localhost:8080/register'>Register here</a></body></html>\n");
  }
  let userUrls = urlsForUser(req.session.user_id)
  const templateVars = { 
    urls: userUrls, 
    user: users[req.session.user_id]
   };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) { // redirection if user logged in
    return res.send("<html><body>You<b>MUST</b>log in to shorten URL!!!</body></html>\n");
  }
  let userId = req.session.user_id;
  let randomId = generateRandomString(); // called function generartes ramdom short URL
  let userLongUrl = req.body.longURL; // long URL input from user;
  urlDatabase[randomId] = {
    longURL: userLongUrl,
    userID: userId
  }; // added new key value pair to URL database
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${randomId}`); // redirect to a page with a newly created URL
});

app.get("/", (req, res) => { // root rout, shows "Hello"
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => { // shows database in browser as JSON
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => { // placeholder route
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => { // renders a page to create a new URL
  if (!req.session.user_id) { // redirects if is not logged in
    return res.redirect('/login');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { // shows page dedicated to one short URL
  if (!req.session.user_id) { // redirection if user logged in
    return res.send("<html><body>You<b>MUST</b>log in or register to view shortened URL!!! <a href='http://localhost:8080/login'>Login here</a> <a href='http://localhost:8080/register'>Register here</a></body></html>\n");
  }

  const shortUrlId = req.params.id; // parameter of request;
  if(urlDatabase[shortUrlId].userID !== req.session.user_id) {
    return res.send("<html><body>You<b>DONT</b>own this URL, log in or register to view shortened URL!!! <a href='http://localhost:8080/login'>Login here</a> <a href='http://localhost:8080/register'>Register here</a></body></html>\n");
  }
  const templateVars = { 
    id: shortUrlId, 
    longURL: urlDatabase[shortUrlId].longURL, 
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/", (req, res) => { // updates the existing long URL
  const shortUrlId = req.params.id;
  let userLongUrl = req.body.longURL;
  urlDatabase[shortUrlId].longURL = userLongUrl;
  res.redirect('/urls'); 
});

app.get("/u/:id", (req, res) => { // when a user clicks a short URL they're being redirected to long URL
  const shortUrlId = req.params.id; // parameter of request;
  let longURL = urlDatabase[shortUrlId].longURL;
  if (!longURL) {
    res.send('URL does not exist');
  } else {
    res.redirect(longURL);
  }
});

app.post("/urls/:id/delete", (req, res) => { // delete button
  if (!req.session.user_id) { // redirection if user logged in
    return res.send("<html><body>You<b>MUST</b>log in to delete shorten URL!!!</body></html>\n");
  }
  const shortUrlId = req.params.id;
  delete urlDatabase[shortUrlId]; // deletees URL
  res.redirect('/urls'); // redirect to URL (home)) page
});


app.post("/logout", (req, res) => { // logout button
  req.session = null;
  res.redirect('/urls'); // redirect to URL (home)) page
});

app.get("/register", (req, res) => { // registration form
  
  if (req.session.user_id) { // redirection if user logged in
    return res.redirect('/urls');
  }

  const templateVars = {
    user: users[req.session.user_id]
  }; 
  res.render("register", templateVars);
});


app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  
  if (!email || !password ) {
    res.status(400).send('Invalid email or password');
  } else {
    if (findUserByEmail(users, email)) {
       return res.status(400).send('User with this email already exists');
    }

    users[id] = { // add new user object to global users object
      id, 
      email, 
      password: bcrypt.hashSync(password, salt)
    };
    console.log(users);
    req.session.user_id = id; // cookie session is being set
    res.redirect('/urls');
    }
    
});


app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password; 
  let id = findUserId(users, email);
  
  if (!findUserByEmail(users, email)) {
    res.status(403).send('This email is not registered');
 } else if (!checkPassword(users, email, password)) {
    res.status(403).send('Wrong password');
 } else {
  req.session.user_id = id; // cookie session is being set
  res.redirect('/urls');
 }
});

app.get("/login", (req, res) => { // registration form
   
  if (req.session.user_id) { // redirection if user logged in
    return res.redirect('/urls');
  }
  
  const templateVars = {
    user: users[req.session.user_id]
  }; 
  res.render("login", templateVars);

});

app.listen(PORT, () => { // server listens to user's input
  console.log(`Example app listening on port ${PORT}!`);
});