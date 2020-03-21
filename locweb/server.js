const http = require('http');
const fs = require('fs');
const parser = require('./parser');
const WebSocketServer = new require('ws');
const webSocketServer = new WebSocketServer.Server({
  port: 8081
});

console.log("Сервер запустился http://localhost:8000/");
const users = new Set();
let html;

fs.readFile('./main.html', function (err, data) {
    if (err) {
        throw err; 
    }
	html = data;
});

http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();
    }).listen(8000);

webSocketServer.on('connection', function(ws) {
  if (users.size < 2) {
	users.add(ws);
	if (users.size == 1){ws.send("0");}
	if (users.size == 2){
		let id_g = 0;
		for (let value of users) {
			value.send("1_"+String(id_g)+"_1_1");
			id_g++;
		}
	}
  }else{
	ws.close(1000, "2");	
  }
  ws.on('message', function(message) {
    let dat = parser.par_i(message);
	if (Number(dat[0])>=41){
		let ws1;
		for (let value of users) {
			if (value != ws){ws1=value;}
		}
		users.clear();
		ws.close(1000,"4_0");
		ws1.close(1000,"4_1");
	}else{
	ws.send('1_1_'+message);
	for (let value of users) {
			if (value != ws){value.send('1_0_'+dat[1]+'_'+dat[0]);}
		}
	}
  });

  ws.on('close', function() {
	i = users.size;
    users.delete(ws);
	j = users.size;
	if (i==2 && j==1){
		for (let value of users) {
			value.close(1000, "3");
			users.delete(value);
		}
	}
	});

});