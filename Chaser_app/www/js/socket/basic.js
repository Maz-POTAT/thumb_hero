/**
 * Created by Jerome on 03-03-17.
 */

var Client = {};
// Client.socket = io("https://thumbhero.kings-guardians.com:5555/"
// //     , {
// //     withCredentials: true,
// //     extraHeaders: {
// //       "thumbhero-header": "secure"
// //     }
// //   }
//   );

Client.socket = io("https://thumbhero.kings-guardians.com:5555");

// Client.socket = io("http://192.168.104.74:5555/");
// Client.socket = io("https://thumbhero.kings-guardians.com:5555");

Client.login = function(username, password){
    Client.socket.emit('login', {username: username, password: password});
};

Client.event_start = function(){
    Client.socket.emit('event_start', {});
};

Client.join_event = function(){
    Client.socket.emit('join_event', {username: userData.username});
};

Client.register_device = function(){
    Client.socket.emit('register_device', {username: userData.username, device_token: device_token});
};

Client.guest = function(){
    Client.socket.emit('guest', {});
};

Client.logout = function(){
    Client.socket.emit('logout', {username: userData.username});
};

Client.register = function(username, email, password){
    Client.socket.emit('register', {username: username, email: email, password: password});
};

Client.ranking = function(){
    Client.socket.emit('ranking', {username: userData.username, game_type: event_mode? '24_event' : 'normal'});
}

Client.user_data = function(avatar){
    Client.socket.emit('user_data', {username: userData.username, avatar: avatar});
};

////////////////////////////////////////////////////////////////////////////

Client.socket.on('login',function(data){
    if(data.result)
    {
        userData = data.result;
        window.localStorage.setItem("UserName", userData.username);
        window.localStorage.setItem("Password", userData.password);
        stripe_key = data.stripe_key;
        if(device_token!='')
            Client.register_device();
        game.scene.stop('LoginScreen');
        game.scene.start('HomeScreen');
        AdMob.prepareRewardVideoAd({
            adId: admobid.interstitial,
            autoShow:false,
            user_id: userData.username,
        });
    
        console.log('success');
    }
    else
    {
        toast_error(game.scene.getScene('LoginScreen'), "Login Failed");
        console.log('failed');
    }
});

Client.socket.on('register',function(data){
    if(data.result)
    {
        game.scene.stop('RegisterScreen');
        game.scene.start('LoginScreen');
        toast_error(game.scene.getScene('LoginScreen'), "Registration Succeed");
        console.log('success');
    }
    else
    {
        toast_error(game.scene.getScene('RegisterScreen'), "Registration Failed");
        console.log('failed');
    }
});

Client.socket.on('update_userdata',function(data){
    userData = data.result;
    if(game.scene.isActive('HomeScreen'))
        game.scene.getScene('HomeScreen').updateUser();
    if(game.scene.isActive('GameScreen'))
        game.scene.getScene('GameScreen').updateUser();
    if(game.scene.isActive('SettingScreen'))
        game.scene.getScene('SettingScreen').updateUser();
    if(game.scene.isActive('EndScreen'))
        game.scene.getScene('EndScreen').updateUser();
});

Client.socket.on('ranking',function(data){
    if(data.result){
        event_data = data.event_data;
        userData = data.user;
        if(game.scene.isActive('HomeScreen'))
            game.scene.getScene('HomeScreen').updateRanking(data.my_rank, data.rank_list);
    }
    else{

    }
});

Client.socket.on('join_event',function(data){
    if(data.result == false){
        toast_error(game.scene.getScene('HomeScreen'), "You need at least 4000\ncoinsto enter\nevent!");
        return;
    }

    userData = data.userData;
    if(game.scene.isActive('HomeScreen'))
    {
        game.scene.stop('HomeScreen');
        game.scene.start('HomeScreen');
    }
});


