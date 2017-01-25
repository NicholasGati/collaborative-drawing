"use strict";

const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Calm Journey - The Collaborative Whiteboard' });
});

module.exports = router;
