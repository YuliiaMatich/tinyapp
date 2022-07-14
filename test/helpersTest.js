const { assert } = require('chai');

const { findUserByEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID) ;
  });

  it('should return undefined if users email does not exist in the database', function() {
    const user = findUserByEmail(testUsers, "user@example.co")
    assert.equal(user, undefined);
  });
});