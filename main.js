// pm2 start main.js --watch
//pm2 log
//pm2 monit
//pm2 stop main
//refactoring  코드를 효율적으로 수정하는 행위
var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

function updateform(title, description) {
  console.log(title, description);
  form = `<form action="/update_process" method="post">
  <input type="hidden" name="id" value="${title}">
<p><input type="text" name="title" placeholder="title" value=${title} /></p>
<p>
  <textarea name="description" placeholder="${description}" value=${description} /></textarea>
</p>
<p><input type="submit" /></p>
</form>`;
  return form;
}
var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.id;
  var createform = `<form action="/create_process" method="post">
  <p><input type="text" name="title" placeholder="title"/></p>
  <p>
    <textarea name="description" placeholder="description"></textarea>
  </p>
  <p><input type="submit" /></p>
</form>`;
  var control = `<a href="/create">create</a>  <a href="/update?id=${title}">update</a>
  <form action="/delete_process" method="post">
  <input type="hidden" name="id" value="${title}">
  <input type="submit" value="delete">
  </form>`;

  if (pathname === '/') {
    if (title === undefined) {
      var title = 'Welcome';
      var control = `<a href="/create">create</a>`;
    }
    fs.readdir('./data', function (err, filelist) {
      var filteredId = path.parse(title).base;
      fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var list = template.list(filelist);
        var sanitizedTitle = sanitizeHtml(title);
        var sanitiezedDescription = sanitizeHtml(description);
        var html = template.html(
          sanitizedTitle,
          list,
          control,
          `<h2>${sanitizedTitle}</h2>${sanitiezedDescription}`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === '/create') {
    fs.readdir('./data', function (err, filelist) {
      var title = 'create';
      var list = template.list(filelist);
      var html = template.html(title, list, createform, control);
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathname === '/create_process') {
    var body = '';
    request.on('data', function (data) {
      body = body + data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.writeHead(302, {
          Location: `/?id=${title}`,
        });
        response.end('success');
      });
    });
  } else if (pathname === '/update') {
    fs.readdir('./data', function (err, filelist) {
      var filteredId = path.parse(title).base;
      fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var list = template.list(filelist);
        var sanitizedTitle = sanitizeHtml(title);
        var sanitiezedDescription = sanitizeHtml(description);
        var html = template.html(
          title,
          list,
          updateform(sanitizedTitle, sanitiezedDescription),
          control
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === '/update_process') {
    var body = '';
    request.on('data', function (data) {
      body = body + data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var title = post.title;
      var id = post.id;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
          response.writeHead(302, {
            Location: `/?id=${title}`,
          });
          response.end('success');
        });
      });
    });
  } else if (pathname === '/delete_process') {
    var body = '';
    request.on('data', function (data) {
      body = body + data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function (error) {
        response.writeHead(302, {
          location: `/`,
        });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end('Not Found');
  }
});
app.listen(3000);
