'use strict';
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();
const joi = require('joi');

const db = require('@arangodb').db;
const errors = require('@arangodb').errors;
const foxxColl = db._collection('myFoxxCollection');
const DOC_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;


module.context.use(router);

router
  .post("/login", function(req, res) {
    const user = users.firstExample({
      username: req.body.username
    });
    const valid = auth.verify(
      // Pretend to validate even if no user was found
      user ? user.password : {},
      req.body.password
    );
    if (!valid) res.throw("unauthorized");
    // Log the user in using the key
    // because usernames might change
    req.session.uid = user._key;
    req.sessionStorage.save(req.session);
    res.send({ username: user.username });
  })
  .body(
    joi
      .object({
        username: joi.string().required(),
        password: joi.string().required()
      })
      .required()
  );

router.get("/me", function(req, res) {
    try {
      const user = users.document(req.session.uid);
      res.send({ username: user.username });
    } catch (e) {
      res.throw("not found");
    }
  });
router.post("/logout", function(req, res) {
    if (req.session.uid) {
      req.session.uid = null;
      req.sessionStorage.save(req.session);
    }
    res.status("no content");
  });
  
router.get('/hello/:name', function (req, res) {
    res.send(`Hello ${req.pathParams.name}`);
  })
  .pathParam('name', joi.string().required(), 'Name to greet.')
  .response(['text/plain'], 'A personalized greeting.')
  .summary('Personalized greeting')
  .description('Prints a personalized greeting.');

router.post('/entries', function (req, res) {
    const data = req.body;
    const meta = foxxColl.save(req.body);
    res.send(Object.assign(data, meta));
  })
  .body(joi.object().required(), 'Entry to store in the collection.')
  .response(joi.object().required(), 'Entry stored in the collection.')
  .summary('Store an entry')
  .description('Stores an entry in the "myFoxxCollection" collection.');
  
router.get('/entries/:key', function (req, res) {
    try {
      const data = foxxColl.document(req.pathParams.key);
      res.send(data)
    } catch (e) {
      if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
        throw e;
      }
      res.throw(404, 'The entry does not exist', e);
    }
  })
  .pathParam('key', joi.string().required(), 'Key of the entry.')
  .response(joi.object().required(), 'Entry stored in the collection.')
  .summary('Retrieve an entry')
  .description('Retrieves an entry from the "myFoxxCollection" collection by key.');