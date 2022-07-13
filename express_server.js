const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser()); // use cookies;
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // EJS engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = () => { // generates 6 alpha numeric characters random Id;
  return (Math.random() + 1).toString(36).substring(6);
};

const findUserByEmail = function (users, email) { // checks is email already exist in users object
  for (let userName in users) {
    if (users[userName].email === email) {
     return users[userName]; 
    }
  }
 } 

app.use(express.urlencoded({ extended: true })); // express library, decodes req.body (key=value) to {key: value}

app.get("/urls", (req, res) => { // renders index page with all URLs
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let randomId = generateRandomString(); // called function generartes ramdom short URL
  let userLongUrl = req.body.longURL; // long URL input from user;
  urlDatabase[randomId] = userLongUrl; // added new key value pair to URL database
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
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { // shows page dedicated to one short URL
  const shortUrlId = req.params.id; // parameter of request;
  const templateVars = { 
    id: shortUrlId, 
    longURL: urlDatabase[shortUrlId], 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/", (req, res) => { // updates the existing long URL
  const shortUrlId = req.params.id;
  let userLongUrl = req.body.longURL;
  urlDatabase[shortUrlId] = userLongUrl;
  res.redirect('/urls'); 
});

app.get("/u/:id", (req, res) => { // when a user clicks a short URL they're being redirected to long URL
  const shortUrlId = req.params.id; // parameter of request;
  let longURL = urlDatabase[shortUrlId];
  if (!longURL) {
    res.send('URL does not exist');
  } else {
    res.redirect(longURL);
  }
});

app.post("/urls/:id/delete", (req, res) => { // delete button
  const shortUrlId = req.params.id;
  delete urlDatabase[shortUrlId]; // deletees URL
  res.redirect('/urls'); // redirect to URL (home)) page
});

app.post("/login", (req, res) => { // login button
  const login = req.body.username; // username input by user in the login form
  res.cookie('user_id', login) // records cookie to browser (dev tools - application - cookies - local host)
  res.redirect('/urls'); // redirect to URL (home)) page
});

app.post("/logout", (req, res) => { // logout button
  res.clearCookie('user_id');
  res.redirect('/urls'); // redirect to URL (home)) page
});

app.get("/register", (req, res) => { // registration form
  const templateVars = {
    user: users[req.cookies["user_id"]]
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
      password
    };
    console.log(users);
    res.cookie("user_id", id); 
    res.redirect('/urls');
    }
    
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;    
});

app.get("/login", (req, res) => { // registration form
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }; 
  res.render("login", templateVars);
});

app.listen(PORT, () => { // server listens to user's input
  console.log(`Example app listening on port ${PORT}!`);
});