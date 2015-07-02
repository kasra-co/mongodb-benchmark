import koa from 'koa';
import logger from 'koa-logger';
import responseTime from 'koa-response-time';
import koaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose'

const app = koa();
const router = koaRouter();
const env = process.env.NODE_ENV || 'development';

// Load config for MongoDB and koa
const config = require(__dirname + "/config.js")

const mongoUrl = process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db;
mongoose.connect(mongoUrl, {server: {poolSize: 5000}});

app.use(responseTime());
app.use(logger());
app.use(bodyParser());

const ArticleSchema = new mongoose.Schema({
    title: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
      index: 1
    }
  });

const Article = mongoose.model('article', ArticleSchema);


router.get('/articles', function * (next) {
  yield next;
  // try {
  const result = yield Article.find({}).limit(20).sort('-createdAt').exec();
  return this.body = result;
  // } catch (error) {
  //   return this.body = error;
  // }
});

router.post('/articles', function * (next) {
  yield next;
  var article = new Article(this.request.body);
  const result = yield article.save();
  return this.body = result;
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 3000;
app.listen(port);

console.log(`Application started on port ${port}`);
if (process.send) {
  process.send('online');
}