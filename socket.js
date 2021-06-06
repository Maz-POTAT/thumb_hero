const data = require('./data');
const gcm = require('node-gcm'); //Google Cloud Messaging
const gcmKey = 'AAAAkjV9r0s:APA91bGH95ayi0TGgKSIybhQG_qu1fJfWrQgcfTqqS0YJ0qCHtpPrmtnTq5YmD5-tjIotWFfnAwcsAES5tbS17RuzM3wwap3yWb0vLAbS9IXr-4G6mZvyw2nmqPFk3WStFa6R8RyQJvF'; // Your gcm key in quotes
const sender = new gcm.Sender(gcmKey);

const users = data.users;

const players = {};

const exportedMethods = {
    async onTimeInteval(io) {
        var date = new Date();
        var hour = date.getHours();
        var minute = date.getMinutes();
        let result = await users.getAllUsers();
        if (result)
            result.map((user, index) => {
                if (hour == 0 && minute == 38){
                    users.ranking(user.username).then((result) => {
                        if(result){
                            var message = new gcm.Message();
                            message.addData({
                              title: 'New Rank',
                              body: 'Your current rank is ' + result.my_rank[0].ranking,
                              otherProperty: true,
                            });
                            sender.send(message, {registrationIds: [result.user.device_token]}, (err) => {
                              if (err) {
                                console.error(err);
                              }
                              else {
                                console.log('Sent');
                              }
                            });
                        }
                    });
                }
                if (user.heart < 3 && (user.revive>hour || (hour-user.revive) >1)) {
                    const info = users.addUserValue(user.username, { heart: 3 });
                    if (!info) console.log('Error occured whild addHeart');
                    else{
                        if(players[user.username])
                            io.to(players[user.username]).emit('update_userdata', {result: info});
                        if(user.device_token)
                        {
                            var message = new gcm.Message();
                            message.addData({
                                title: 'Life Recharged',
                                body: 'Your life\'s are now full.',
                                otherProperty: true,
                            });
                            sender.send(message, {registrationIds: [user.device_token]}, (err) => {
                                if (err) {
                                console.error(err);
                                }
                                else {
                                console.log('Sent');
                                }
                            });
                        }
                    }
                }
            });
        console.log('Hearts supplied.');
    },

    async useSocket(io) {

        io.on('connection', socket => {
            console.log('a user connected');
            if (socket.handshake.session.username) {
                const username = socket.handshake.session.username;
                players[username] = socket.id;
            }

            socket.on('disconnect', () => {
                console.log('user disconnected');
                if (socket.handshake.session.username) {
                    const username = socket.handshake.session.username;
                    players[username] = undefined;
                }
            });

            socket.on('login', (data) => {
                // console.log('login request recevied');
                if(!players[data.username] || players[data.username] == socket.id)
                    users.getUserByName(data.username, data.password).then((result) => {
                        if (result) {
                            players[data.username] = socket.id;
                            socket.handshake.session.username = data.username;
                            socket.handshake.session.save();
                            // socket.emit('login', { result: result, stripe_key: "pk_live_51IhyPDAWkB06UtUHCSbOqJu4pYMzAsSXYeJGtrDhysU5OudjQOPedGAhQqhxciNvabMSgdaPjcqaSPEA91Th8Mk900qzAdTxkd"});
                            socket.emit('login', { result: result, stripe_key: "pk_test_51IhyPDAWkB06UtUHhIqCmHf2Yj9XfljP2HmhYgTMXaa3MZGhAHtyUHqJuXtOL1sAwaSvdKPyaIJx0Ki45UleW5xu00ieI01k3E"});
                        } else {
                            socket.emit('login', { result: false });
                        }
                    });
                else {
                    console.log(`${data.username} is already logged in`);
                    socket.emit('login', {result: false});
                }
            });

            socket.on('guest', () => {
                users.guestlogin().then((result) => {
                    if (result) {
                        players[result.username] = socket.id;
                        socket.handshake.session.username = result.username;
                        socket.handshake.session.save();
                        // socket.emit('login', { result: result, stripe_key: "pk_live_51IhyPDAWkB06UtUHCSbOqJu4pYMzAsSXYeJGtrDhysU5OudjQOPedGAhQqhxciNvabMSgdaPjcqaSPEA91Th8Mk900qzAdTxkd"});
                        socket.emit('login', { result: result, stripe_key: "pk_test_51IhyPDAWkB06UtUHhIqCmHf2Yj9XfljP2HmhYgTMXaa3MZGhAHtyUHqJuXtOL1sAwaSvdKPyaIJx0Ki45UleW5xu00ieI01k3E"});
                    } else {
                        socket.emit('login', { result: false });
                    }
                });
            });

            socket.on('logout', (data) => {
                // REQUIRE INFO: data.username
                console.log('logout request recevied');
                // Set PLAYERS value of this user as 'undefined' to remove the user from PLAYERS Object
                socket.handshake.session.username = undefined;
                socket.handshake.session.save();
                players[data.username] = undefined;
            });

            socket.on('register', async(data) => {
                console.log('register request is received');
                if(!data.username) {
                    console.log('username is not supplied while register');
                    socket.emit('register', {result: false, error: 'Username must be supplied'});
                    return;
                }
                users.getUserInfo(data.username).then((result) => {
                    if(result) {
                        console.log(`${data.username} is already registered while register`);
                        socket.emit('register', {result: false, error: `${data.username} is already registered`});
                    } else {
                        users.addUser(data).then((result) => {
                            if(result) {
                                socket.emit('register', {result: true, error: ''});
                            } else {
                                socket.emit('register', {result: false, error: `Error occurred while register user in db`});
                            }
                        });
                    }
                });
            });

            socket.on('register_device', (data) => {
                console.log('register device request recevied : ', data);
                users.register_device(data.username, data.device_token).then((result) => {
                });
            });

            socket.on('level_end', (data) => {
                console.log('level_end request recevied : ', data);
                users.addUserValue(data.username, data.result).then((result) => {
                });
            });

            socket.on('user_data', (data) => {
                console.log('userdata request recevied : ', data);
                users.changeUser(data.username, data.avatar).then((result) => {
                });
            });

            socket.on('purchase_coin', (data) => {
                console.log('purchase_coin request recevied : ', data);
                users.purchaseCoin(data.username, data.tokenId, data.method, socket).then((result) => {
                });
            });

            socket.on('purchase_coin_paypal', (data) => {
                console.log('purchase_coin_paypal request recevied : ', data);
                users.purchaseCoin_paypal(data.username, data.orderId, data.method, socket).then((result) => {
                });
            });

            socket.on('ranking', (data) => {
                console.log('ranking request recevied : ', data);
                users.ranking(data.username).then((result) => {
                    if(result){
                        socket.emit('ranking', {result: true, my_rank: result.my_rank[0], rank_list:result.rank_list});
                    } else {
                        socket.emit('ranking', {result: false, error: `Error occurred while get ranking in db`});
                    }
                });
            });
        });
    },
};

module.exports = exportedMethods;