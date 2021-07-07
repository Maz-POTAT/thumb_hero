const stripe = require('stripe')('sk_test_51IhyPDAWkB06UtUHrj9tcPEAlpW08bJB0CUcrRRUd3Sz2lMFMhl4yT59nT6vJhXZkVQ4SloqaMDs4Y8PNLjDss7W00QrMmpJZB'); // Add your Secret Key Here
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
let { ObjectId } = require('mongodb');

const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const payPalClient = require('../payPalClient');

const exportedMethods = {
    async getAllUsers() {
        const userCollection = await users();
        const result = await userCollection.find().toArray();
        return result;
    },

    async guestlogin() {

        const userCollection = await users();

        for(let i=0; i<1000; i++){
            var date = new Date();
            var milisec = date.getTime();
            var username = 'G'+milisec;
            const user = await userCollection.findOne({ username: username });
            if (!user) {
                let result = await this.addUser({username:username, password:username, email:''});
                if(result) {
                    const user = await userCollection.findOne({ username: username });
                    if(user)
                        return user;
                }
            }
        }
        return undefined;
    },

    async getUserByName(username, password) {
        if (!username || !password) {
            // console.log('Error: username or password is not referred while getUserByName');
            return undefined;
        }

        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });

        if (!user) {
            // console.log(`Error: user "${username}" not exist while getUserByName`);
            return undefined;
        }

        if (user.password != password) {
            // console.log(`Error: user "${username}" password is not correct while getUserByName`);
            return undefined;
        }

        return user;
    },

    async getUserInfo(username) {
        if (!username) {
            // console.log('Error: username is not referred while getUserInfo');
            return false;
        }

        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });

        if (!user) {
            // console.log(`Error: user "${username}" not exist while getUserInfo`);
            return false;
        }

        return user;
    },

    async joinEvent(username) {
        if (!username) {
            // console.log('Error: username is not referred while getUserInfo');
            return false;
        }

        const userCollection = await users();
        let user = await userCollection.findOne({ username: username });

        if (!user) {
            // console.log(`Error: user "${username}" not exist while getUserInfo`);
            return false;
        }

        if(user.coin > 4000){
            user.coin -= 4000;
            user.event_joined = true;
            let updatedInfo = await userCollection.updateOne({ _id: user._id }, { $set: user });

            if (updatedInfo.modifiedCount === 0) {
                console.log('could not update UserValue successfully');
                return false;
            }
        } else {
            return false;
        }
        return user;
    },

    async addUser(data) {
        if (data.username === undefined || data.password === undefined || data.email === undefined) {
            // console.log("Failed in AddUser! Username or Password is undefined");
            return false;
        }

        const userCollection = await users();

        const newuser = {
            username: data.username.trim(),
            password: data.password,
            email: data.email,
            avatar: 0,
            heart: 3,
            coin: 20000,
            revive: 24,
            remove_admob: 0,
            level: 0,
            point: 0,
            level_24: 0,
            point_24: 0,
            device_token:'',
            event_joined: false,
        };

        const newInsertInformation = await userCollection.insertOne(newuser);
        if (newInsertInformation.insertedCount === 0) {
            // console.log('Could not add user');
            return false;
        }
        return true;
    },

    async addUserValue(username, game_type, data, event_data) {
        if (!username || !data) {
            console.log('ReferenceError: Username is not supplied while addUserValue');
            return false;
        }

        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });

        if (!user) {
            // console.log(`Error: user "${username}" not exist while addUserValue`);
            return false;
        }

        if(event_data.active == true  && game_type == '24_event' && !user.event_joined)
            return;

        const updateduserData = user;

        if (data.coin) updateduserData.coin = Number.parseInt(updateduserData.coin) + data.coin;
        if(game_type == 'normal'){
            if (data.level > updateduserData.level && data.point>0){
                updateduserData.level = data.level;
                updateduserData.point = data.point;
            } 
            else if (data.level == updateduserData.level && data.point < updateduserData.point && data.point>0){
                updateduserData.point = data.point;
            }
        }
        else if(game_type == '24_event'){
            if (data.level > updateduserData.level_24 && data.point>0){
                updateduserData.level_24 = data.level;
                updateduserData.point_24 = data.point;
            } 
            else if (data.level == updateduserData.level_24 && data.point < updateduserData.point_24 && data.point>0){
                updateduserData.point_24 = data.point;
            }
        }
        if (data.heart!=0)
        {
            updateduserData.heart += data.heart;
            var date = new Date();
            var hour = date.getHours();
            updateduserData.revive = hour;
        } 
        if (updateduserData.heart > 3) updateduserData.heart = 3;

        const updatedInfo = await userCollection.updateOne({ _id: user._id }, { $set: updateduserData });

        if (updatedInfo.modifiedCount === 0) {
            console.log('could not update UserValue successfully');
            return false;
        }

        return updateduserData;
    },

    async register_device(username, device_token) {
        if (!username || !device_token) {
            console.log('ReferenceError: Username is not supplied while device register');
            return false;
        }

        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });

        if (!user) {
            // console.log(`Error: user "${username}" not exist while addUserValue`);
            return false;
        }

        const updateduserData = user;

        updateduserData.device_token = device_token;
        const updatedInfo = await userCollection.updateOne({ _id: user._id }, { $set: updateduserData });

        if (updatedInfo.modifiedCount === 0) {
            console.log('could not register device successfully');
            return false;
        }

        console.log(updateduserData);
        return updateduserData;
    },

    async changeUser(username, avatar) {
        if (!username) {
            console.log('ReferenceError: Username is not supplied while addUserValue');
            return false;
        }

        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });

        if (!user) {
            // console.log(`Error: user "${username}" not exist while addUserValue`);
            return false;
        }

        const updateduserData = user;

        updateduserData.avatar = avatar;
        const updatedInfo = await userCollection.updateOne({ _id: user._id }, { $set: updateduserData });

        if (updatedInfo.modifiedCount === 0) {
            console.log('could not update UserValue successfully');
            return false;
        }

        return true;
    },

    async purchaseCoin(username, tokenId, method, socket) {
        console.log(tokenId.id)
        if (!username || !tokenId) {
            console.log('ReferenceError: Username is not supplied while addUserValue');
            socket.emit('purchase_coin', {result: false});
            return false;
        }
        console.log('stage1')
        const userCollection = await users();
        console.log('stage2')
        const user = await userCollection.findOne({ username: username });
        console.log(user)
        if (!user) {
            // console.log(`Error: user "${username}" not exist while addUserValue`);
            socket.emit('purchase_coin', {result: false});
            return false;
        }

        try {
            let purchase_amount = 0;
            let purchase_description = "";
            if(method == 0){
                purchase_amount = 299;
                purchase_description = "Line_chaser Remove Admob for this month";
            }
            else if(method == 1){
                purchase_amount = 99;
                purchase_description = "Line_chaser Purchase 1000 Coin";
            }
            else if(method == 2){
                purchase_amount = 299;
                purchase_description = "Line_chaser Purchase 10000 Coin";
            }
            console.log("--------------we are here for stripe!")
            stripe.customers.create({
                name: user.username,
                email: user.email,
                source: tokenId.id
              })
              .then(customer => {
                  console.log("we are here for stripe!")
                  stripe.charges.create({
                    amount: purchase_amount,
                    currency: "gbp",
                    customer: customer.id,
                    description: purchase_description,
                  })
              }
              )
              .then(async () => {
                    const updateduserData = user;
                    if(method == 2)
                        updateduserData.coin += 10000;
                    else if(method == 1)
                        updateduserData.coin += 1000;
                    else if(method == 0){
                        var date = new Date();
                        var month = date.getMonth();
                        updateduserData.remove_admob = month;
                    }
                    const updatedInfo = await userCollection.updateOne({ _id: user._id }, { $set: updateduserData });
            
                    if (updatedInfo.modifiedCount === 0) {
                        console.log('could not update UserValue successfully');
                    }
                    socket.emit('update_userdata', {result: updateduserData});
                    socket.emit('purchase_coin', {result: "Purchase Succeed"});
                })
                .catch((err) =>{
                    socket.emit('purchase_coin', {result: false});
                    console.log(err)
                });
            } catch (err) {
            console.log(err)
        }


        return true;
    },

    async purchaseCoin_paypal(username, orderId, method, socket) {
        if (!username || !orderId) {
            console.log('ReferenceError: Username is not supplied while addUserValue');
            socket.emit('purchase_coin', {result: false});
            return false;
        }
        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });
        console.log(user)
        if (!user) {
            // console.log(`Error: user "${username}" not exist while addUserValue`);
            socket.emit('purchase_coin', {result: false});
            return false;
        }

        try {
            let request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId);
            let order;
            try {
              order = await payPalClient.client().execute(request);
            } catch (err) {
          
              // 4. Handle any errors from the call
              console.error(err);
              socket.emit('purchase_coin', {result: false});
            }

            // 5. Validate the transaction details are as expected
            if (order.result.purchase_units[0].amount.value <= 0) {
                socket.emit('purchase_coin', {result: false});
            }

            const updateduserData = user;
            if(method == 2)
                updateduserData.coin += 10000;
            else if(method == 1)
                updateduserData.coin += 1000;
            else if(method == 0){
                var date = new Date();
                var month = date.getMonth();
                updateduserData.remove_admob = month;
            }
            const updatedInfo = await userCollection.updateOne({ _id: user._id }, { $set: updateduserData });
    
            if (updatedInfo.modifiedCount === 0) {
                console.log('could not update UserValue successfully');
            }
            socket.emit('update_userdata', {result: updateduserData});
            socket.emit('purchase_coin', {result: "Purchase Succeed"});
                
        } catch (err) {
            socket.emit('purchase_coin', {result: false});
        }

        return true;
    },

    async ranking(username, game_type, event_data) {
        if (!username) {
            console.log('ReferenceError: Username is not supplied while addUserValue');
            return false;
        }

        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });
        const my_rank = await userCollection.aggregate(
            { $sort : game_type == 'normal' ? {"level": -1, "point" : 1} : {"level_24": -1, "point_24" : 1}},
            {
                "$group": {
                    "_id": false,
                    "users": {
                        "$push": game_type == 'normal' ? {
                            "_id": "$_id",
                            "username": "$username",
                            "level": "$level",
                            "point": "$point"
                        } : {
                            "_id": "$_id",
                            "username": "$username",
                            "level_24": "$level_24",
                            "point_24": "$point_24"
                        }
                    }
                }
            },
            {
                "$unwind": {
                    "path": "$users",
                    "includeArrayIndex": "ranking"
                }
            },
            {
                "$match": game_type == 'normal' ? {
                    "users.username": username
                } : {
                    "users.username": username,
                    "users.event_joined": true
                }
            },
            { $sort : {"ranking" : 1}}).toArray();

        let rank_list = [];
        if(game_type != 'normal')
            rank_list = await userCollection.find({event_joined:true}).sort({level_24: -1, point_24:1}).limit(10).toArray();
        else
            rank_list = await userCollection.find().sort({level: -1, point:1}).limit(10).toArray();
        return {user: user, my_rank: my_rank, rank_list: rank_list};
    },
};

module.exports = exportedMethods;