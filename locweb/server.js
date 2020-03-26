const http = require('http');
const fs = require('fs');
const WebSocketServer = new require('ws');
const webSocketServer = new WebSocketServer.Server({
  port: 8081
});

console.log("Сервер запустился http://localhost:8000/");
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

let users = [];

let out_message = {
	users_s: [null,null],
	progress_id: null,
	win_id: null,
	code: null	
};

Array.prototype.remove = function(value) {
    var idx = this.indexOf(value);
    if (idx != -1) {
        return this.splice(idx, 1);
    }
    return this;
}

webSocketServer.on('connection', function(ws) {
 
  if (users.length < 2){
	users.push(ws);
	switch(users.length){
		//отправляем код ноль, только один игрок подключился
		case 1:
			out_message.code = 0;
			ws.send(JSON.stringify(out_message));
			break;
		//отправляем код 1, началтеый счёт и кто ходит, два игрока подключены можно начинать игру
		case 2:
			out_message.code = 1;
			out_message.users_s = [1,1];
			out_message.progress_id = 0;
			users[0].send(JSON.stringify(out_message));
			out_message.progress_id = 1;
			users[1].send(JSON.stringify(out_message));
			break;
	}
  } else {
	//отправляем код 2, уже достаточно игроков
	out_message.code = 2;
	ws.close(1000, JSON.stringify(out_message));
  };
  
  ws.on('message', function(message) {
	  //получили сообщение от пользователя заканчиваем его игру стартуем игру второго и смотит нет ли ещё победы
	  message = JSON.parse(message);
	  if (Number (message.users_s[0]) >= 41){
		  let users_c = users;
		  users = [];
		  message.code = 4;
		  message.win_id = 0;
		  ws.close(1000, JSON.stringify(message));
		  message.win_id = 1;
		  users_c.remove(ws);
		  users_c[0].close(1000, JSON.stringify(message));
	  } else {
		message.progress_id = 1;
		ws.send(JSON.stringify(message));
		message.progress_id = 0;
		message.users_s = message.users_s.reverse()
		if (users.indexOf(ws) == 0){
		  users[1].send(JSON.stringify(message));
		} else {
		  users[0].send(JSON.stringify(message));
		};
	  }
  });

  ws.on('close', function() {
	    flag = users.includes(ws)
		users.remove(ws);
		if (users.length == 1 && flag){
			//отправляем код 3, второй игрок отключился во время игры
			out_message.code = 3;
			users[0].close(1000, JSON.stringify(out_message));
		}
	});

});