const findUserByEmail = function (users, email) { // checks is email already exist in users object
  for (let userName in users) {
    if (users[userName].email === email) {
     return users[userName]; 
    }
  }
 } 

 module.exports = { findUserByEmail };