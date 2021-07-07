/**
 * Created by Jerome on 03-03-16.
 */
//noinspection JSCheckFunctionSignatures,JSCheckFunctionSignatures,JSCheckFunctionSignatures

var userData = {};
var stripe_key = "";
var device_token = '';
var isRewardReady = false;
var event_mode = false;
var event_data = {};

var target_width = 10;
var target_position = 0;
var item_type = -1;
var level = 0;
var elapsedTime = 0;
var point = 0;
var coin = 0;
var revive_count = 0;
var path_index = 0;
const config = {
    type: Phaser.WEBGL,
    scale: {
        parent: '#phaser-area',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1080,
        height: 1920
    },
    transparent: true,
    scene: [LoginScreen, HomeScreen, SettingScreen, GameScreen, EndScreen, RegisterScreen, StripeScreen, HelpScreen, ShopScreen ],
    dom: {
        createContainer: true
    },
};

var game = new Phaser.Game(config);

game.scene.start('LoginScreen');

function getTimeTextFromMs(msSec){
    let sec = Math.floor(msSec/1000);
    let ms = Math.floor((msSec%1000)/10);
    let min = Math.floor(sec/60);
    sec = sec%60;
    return [
        String(min).padStart(2, '0'),
        String(sec).padStart(2, '0'),
        String(ms).padStart(2, '0'),
      ].join(':');
}
function getDateTimeTextFromMs(msSec){
    let sec = Math.floor(msSec/1000);
    let min = Math.floor(sec/60);
    let hour = Math.floor(min/60);
    min = min%60;
    sec = sec%60;
    return [
        String(hour).padStart(2, '0'),
        String(min).padStart(2, '0'),
        String(sec).padStart(2, '0'),
      ].join(':');
}
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log("device ready");
    var push = PushNotification.init({
        android: {}
    });

    push.on('registration', function(data) {
        // data.registrationId
        device_token = data.registrationId;
        if(userData.username)
            Client.register_device();
        console.log(data.registrationId);
    });

    push.on('notification', function(data) {
        let activeScene = game.scene.getScenes(true)[0];
        toast_error(activeScene, data.title + '\n' + data.message);
    });

    push.on('error', function(e) {
        console.log(e.message)
    });
}