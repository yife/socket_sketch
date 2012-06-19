var app = require('express').createServer()
  , io = require('socket.io').listen(app);
app.listen(8124);

var active_user_list = [];
 
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});
 
io.sockets.on('connection', function (socket) {

    //新しいクライアントが接続してきたら
    console.log('client connected. His/Her id is ' + socket.id );
    //クライアントに、自身のIDを教える
    socket.emit('your_id', socket.id);
    //アクティブユーザ一覧に追加
    active_user_list.push(socket.id);
    //現在のアクティブユーザ一覧を表示
    console.log(active_user_list);
 
    // クライアントからメッセージ受信
    socket.on('clear send', function () {
 
        // 自分以外の全員に送る
        socket.broadcast.emit('clear user');
    });
 
    // クライアントからメッセージ受信
    socket.on('server send', function (msg) {

        //送ってきたクライアントのidを、アクティブユーザ一覧から見つけ、配列添え字を調べる
        var client_index;
        for(var i = 0; i < active_user_list.length; i++){
            if(msg['socket_id'] == active_user_list[i]){
                client_index = i;
            }
        }
        console.log("Hello there, my index is " + client_index);

        if( active_user_list.length == 1){ //配列の大きさが1だったら、自分しかいないのでなにもしない（受け取ったメッセージは破棄）
            console.log('Nobody is here but myself. every my voice step into nothingness...');
        }else if( client_index % 2 == 0 && active_user_list.length == (client_index + 1 ) ){ //添え字が偶数かつ配列の末尾のときは、やはり送る相手がいないのでなにもしない（受け取ったメッセージは破棄）
            console.log("Everyone is drawing happily, but I'm just a wallflower.");
        }else if( client_index % 2 == 0 ){ //送る相手がいる場合。自分が偶数なら、自分の添え字に1を足した相手に送る
            io.sockets.socket(active_user_list[ (client_index + 1) ]).emit('send user', msg);
            console.log("I'm even. My index is " + client_index );
        }else if( client_index % 2 == 1){ //送る相手がいる場合。自分が奇数なら、自分の添え字から1を引いた添え字の相手に送る
            io.sockets.socket(active_user_list[ (client_index - 1) ]).emit('send user', msg);
            console.log("I'm odd. My index is " + client_index );
        }else{
            console.log('something wrong');
        }
 
        // 自分以外の全員に送る
        //socket.broadcast.emit('send user', msg);
    });
 
    // 切断
    socket.on('disconnect', function () {
        io.sockets.emit('user disconnected');
        //切断したユーザidを表示
        console.log('a client(id was ' + socket.id + ') disconnected.' );
        //アクティブユーザ一覧から削除
        for(var i = 0; i < active_user_list.length; i++){
            if(socket.id == active_user_list[i]){
                active_user_list.splice(i, 1);
            }
        }
        //削除した後のアクティブユーザ一覧を表示
        console.log(active_user_list);    

    });
});