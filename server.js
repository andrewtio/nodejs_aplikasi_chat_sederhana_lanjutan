var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var diatas saling berhubungan satu sama lain lewat parameternya di paling belakang

// req & res merupakan callback
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

//---------- BACKEND ---------------//

// ==== MENAMBAHKAN USER=====
// Ini adalah fungsi untuk validasi apakah nama user yang diinput sudah ada atau belum
var users = {};
// users disimpan dalam bentuk objek, karena akan disimpan dalam key value yang unik (Namanya)

var usernames = [];
// Array usernames dibuat agar kita bisa deteksi nama value nya saja atau bisa pakai fungsi indexOf


// io.on('connection') adalah waktu pertama kali menerima koneksi
io.on('connection', function(socket){

    // ==== INFORMASI SAAT KONEK DAN DISKONEK
    // Memberikan respon ketika ada user
    // Caranya adalah dengan membroadcast
    // dengan broadcast (Bukan io) hanya akan terlihat oleh user-user lain, 
    // bukan oleh diri kita sendiri
    socket.broadcast.emit('newMessage', 'Ada seseorang yang bergabung'); 


    // ==== MENAMBAHKAN USER ========
    // Mendengarkan socket.emit ketika ada user yang daftar
    socket.on('registerUser', function(username){
        // menguji apakah namanya sudah ada atau belum
        // jika user yang dimasukan sudah ada di username
        // Maka akan mengembalikan nilai false yang berarti nama sudah ada sebelumnya
        // -1 akan keluar sebagai nilai jika tidak ditemukan username nya sehingga bisa daftar user baru
        if(usernames.indexOf(username) != -1){
            socket.emit('registerRespond', false);
        }else{
            users[socket.id] = username;
            // socket.id akan menggenerate id yang berbeda-beda untuk setiap username
            usernames.push(username);
            // karena usernames array biasa jadi didaftarkannya bisa pakai metode push
            
            socket.emit('registerRespond', true);

            // ====== DAFTAR USER ONLINE ======
            io.emit('addOnlineUsers', usernames);


            // ===== DEBUG KESALAHAN ======
            // cek nama user yang sudah terdaftar
            // console.log(users);
            // console.log('---------');
            // console.log(usernames);
            // console.log('            ');
        }
    });


    // kalo ada message baru, newMessage adalah parameter yang harus sama dengan frontend
    socket.on('newMessage', function(msg){
        io.emit('newMessage', msg);
        console.log('Chat baru: ' + msg);
    });

    // ===== KETIKA USER MENGETIK ========
    socket.on('newTyping', function(msg){
        io.emit('newTyping', msg);
    });


    // kalo user disconnect
    socket.on('disconnect', function(msg){
        // ==== INFORMASI SAAT KONEK DAN DISKONEK
        // console.log('user disconnected'); // ini kode dari tutorial sebelumnya
        socket.broadcast.emit('newMessage', 'Ada seseorang meninggalkan chat');

        // ====== DAFTAR USER ONLINE ==========
        // delete users[socket.id];
        // Kode diatas merupakan kesalahan

        // ====== KETIKA USER MENGETIK =========


        var index = usernames.indexOf(users[socket.id]);
        // indexOf melihat usernames ada di urutan ke berapa
        usernames.splice(index, 1);
        // metode splice digunakan untuk ngeluarin isinya (index) lalu ,1 berarti menghapus 1 elemen

        io.emit('addOnlineUsers', usernames);
    });
});

http.listen(3000, function(){
    console.log('listening on 3000...');
});