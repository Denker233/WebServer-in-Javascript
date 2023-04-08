const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');
// const { scheduler } = require('timers/promises');

const port = 9001;
http.createServer(function(req, res) {
  var q = url.parse(req.url, true);
  if (q.pathname === '/') {
    indexPage(req, res);
  }
  else if (q.pathname === '/index.html') {
    indexPage(req, res);
  }
  else if (q.pathname === '/schedule.html') {
    sendSchedule(req, res);
  }
  else if(q.pathname.startsWith('/getSchedule')){
    getSchedule(req,res);
  }
  else if (q.pathname === '/addEvent.html') {
    addEvent(req, res);
  }
  else if(q.pathname === '/postEventEntry'){
    postEvent(req,res);
  }
  else if(q.pathname === '/eventInterferes'){
    eventInterferes(res, req)
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    return res.end("404 Not Found");
  }
}).listen(port);


function indexPage(req, res) {
  fs.readFile('client/index.html', (err, html) => {
    if (err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function sendSchedule(req, res) {
  fs.readFile('client/schedule.html', (err, html) => {
    if (err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();

  });}
  
function addEvent(req, res) {
  fs.readFile('client/addEvent.html', (err, html) => {
    if (err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();

  });
}

function getSchedule(req, res) {
  const day = req.url.split('?')[1];
  fs.readFile('schedule.json', (err, data) => {
    if (err) {
      throw err;
    }
    
    const schedule = JSON.parse(data);
    const events = schedule[day];
    // console.log(JSON.stringify(events));
    events.sort((a, b) => new Date(`1970-01-01T${a.start}Z`) - new Date(`1970-01-01T${b.start}Z`));
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    // res.write(data);
    // console.log(JSON.stringify(events));
    res.write(JSON.stringify(events));
    res.end();
    // res.end(JSON.stringify(events));

  });}

  function postEvent(req, res) {
  let body = '';
  req.on('data', field => {
    body += field.toString();
  });
  req.on('end', () => {
    const event = qs.parse(body);
    
    fs.readFile('schedule.json', (err, data) => {
      if (err) {
        throw err;
      }
      const schedule = JSON.parse(data);
      const newEvent = {
        name: event.event,
        start: event.start,
        end: event.end,
        phone: event.phone,
        location: event.location,
        info: event.info,
        url: event.url
      };

      let day = (event.day).toLowerCase();
      var events =schedule[day];
      events.push(newEvent);
      events.sort((a, b) => new Date(`1970-01-01T${a.start}Z`) - new Date(`1970-01-01T${b.start}Z`));
      fs.writeFile('schedule.json', JSON.stringify(schedule, null, "  "), err => {
        if (err) {
          throw err;
        }
        res.writeHead(302, { 'Location': '/schedule.html'});
        res.end();
      });
    });
  });
}

function eventInterferes(res, req){
  fs.readFile('schedule.json', (err, data) => {
    if (err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.write(data);
    res.end();
  }); 
} 



