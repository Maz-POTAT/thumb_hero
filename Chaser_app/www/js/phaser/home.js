/*
 * Author: Jerome Renaux
 * E-mail: jerome.renaux@gmail.com
 */

class HomeScreen extends Phaser.Scene{
    constructor(){
        super({key: "HomeScreen"});
    }

    preload() {
        this.textures.remove('Avatar');
        this.load.image("Avatar", "./images/avatar/" + userData.avatar + ".png");

        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    create() {
        this.panel = this.add.image(540,200,'Panel');
        this.avatar = this.add.image(165,200,'Avatar').setScale(0.5);

        this.userNameText = this.add.text(450, 150, userData.username, { fixedWidth: 300, fixedHeight: 70 })
        .setStyle({
            fontSize: '64px',
            fontFamily: 'RR',
            fontWeight: 'bold',
            color: '#ffffff',
        })
        .setOrigin(0.5,0.5);


        this.hearts = [];
        for(let i=0; i<3; i++)
        {
            let heart = this.add.image(350 + i*105 , 250, 'Heart');
            if(i+1 > userData.heart)
                heart.setVisible(false);
            this.hearts.push(heart);
        }

        this.coin = this.add.image(700,140,'Coin').setScale(0.15);
        this.coinText = this.add.text(900, 140, userData.coin, { fixedWidth: 300})
        .setStyle({
            fontSize: '40px',
            fontFamily: 'RR',
            fontWeight: 'bold',
            align: "center",
            color: '#ffff00',
        })
        .setOrigin(0.5,0.5);

        // this.point = this.add.image(700,260,'Point').setScale(0.15);
        this.pointText = this.add.text(850, 260, 'Lv:' + userData.level + '(' + getTimeTextFromMs(userData.point)+ ')', { fixedWidth: 400})
        .setStyle({
            fontSize: '40px',
            fontFamily: 'RR',
            fontWeight: 'bold',
            align: "center",
            color: '#ffff00',
        })
        .setOrigin(0.5,0.5);

        this.play = this.add.image(245,450,'Play');
        this.play.setInteractive().on('pointerdown', () => {

            target_width = 20;
            // target_position = Math.floor(Math.random() * 280) + 40;
            target_position = 320;
            path_index = 0;
            level = 1;
            elapsedTime = 0;
            revive_count = 0;
            // //For Test
            // level = 50;
            // userData.heart = 3;
            // if(level>5){
            //     target_position = Math.floor(Math.random() * 280) + 40;
            // }
            // if(level>20)
            // {
            //     if(level<=50){
            //         path_index = (level - 20);
            //     }
            //     else{
            //         path_index = Math.floor(Math.random() * 31);
            //     }
            // }
            // if(level>40){
            //     if(level>50)
            //         target_width = 10;
            //     else
            //         target_width = 20-(level-40);
            // }
            // //Test End
            game.domContainer.style.display = 'block';

            game.scene.stop('HomeScreen');
            game.scene.start('GameScreen');
        });

        if(event_mode && !userData.event_joined){
            this.play.setAlpha(0.5).disableInteractive();
        }

        this.setting = this.add.image(675,450,'Setting');
        this.setting.setInteractive().on('pointerdown', () => {
            game.domContainer.style.display = 'block';
            game.scene.stop('HomeScreen');
            game.scene.start('SettingScreen');
        });

        this.help = this.add.image(965,500,'Help');
        this.help.setInteractive().on('pointerdown', () => {
            game.domContainer.style.display = 'block';
            game.scene.stop('HomeScreen');
            game.scene.start('HelpScreen');
        });

        this.admobButton = this.add.image(245,575,'ReviveAdmob').setScale(0.6);
        this.admobButton.setInteractive().on('pointerdown', () => {
            var date = new Date();
            var month = date.getMonth();
            if(!isRewardReady){
                toast_error(this, 'Reward Video is not ready');
            }
            if(userData.remove_admob != month && isRewardReady){
                AdMob.showRewardVideoAd();
                AdMob.prepareRewardVideoAd({
                    adId: admobid.interstitial,
                    autoShow:false,
                    user_id: userData.username,
                });
            }
            if(userData.remove_admob == month || isRewardReady){
                isRewardReady = false;
                if(userData.remove_admob == month)
                {
                    userData.heart = (Number.parseInt(userData.heart) + 3) > 3 ? 3 : (Number.parseInt(userData.heart) + 3);
                    Client.level_end(3, 0, 0, 0);
                    if(event_mode == false || userData.event_joined == true){
                        this.play.setInteractive();
                        this.play.setAlpha(1);
                    }
                    for(let i=0; i<3; i++)
                    {
                        if(i+1 > userData.heart)
                            this.hearts[i].setVisible(false);
                        else
                            this.hearts[i].setVisible(true);
                    }
                }
            }
        });
        this.coinButton = this.add.image(675,575,'ReviveCoin').setScale(0.6);
        this.coinButton.setInteractive().on('pointerdown', () => {
            userData.coin = Number.parseInt(userData.coin) - 1000;
            userData.heart = (Number.parseInt(userData.heart) + 3) > 3 ? 3 : (Number.parseInt(userData.heart) + 3);
            Client.level_end(3, -1000, 0, 0);
            if(event_mode == false || userData.event_joined == true){
                this.play.setInteractive();
                this.play.setAlpha(1);
            }
            for(let i=0; i<3; i++)
            {
                if(i+1 > userData.heart)
                    this.hearts[i].setVisible(false);
                else
                    this.hearts[i].setVisible(true);
            }
            this.coinText.setText(userData.coin);
            if(Number.parseInt(userData.coin)<1000){
                this.coinButton.disableInteractive();
                this.coinButton.setAlpha(0.5);
            }
        });
        if(Number.parseInt(userData.coin)<1000){
            this.coinButton.disableInteractive();
            this.coinButton.setAlpha(0.5);
        }

        this.waitingText = this.add.text(540, 900, 'Fetching Ranking From Server...', { fixedWidth: 1000, fixedHeight: 200 })
        .setStyle({
            fontSize: '64px',
            fontFamily: 'RR',
            fontWeight: 'bold',
            align: "center",
            fill: '#fa5c00',
        })
        .setOrigin(0.5,0.5);
        this.waitingText.stroke = "#f0fafe";
        this.waitingText.strokeThickness = 32;
        //  Apply the shadow to the Stroke and the Fill (this is the default)
        this.waitingText.setShadow(10, 10, "#333333", 10, true, true);
        Client.ranking();
        if(userData.heart == 0)
        {
            this.play.disableInteractive();
            this.play.setAlpha(0.5);
            toast_error(this, 'Please Revive by\nadmob or coin.');
            // this.tweens.add({targets:this.setting, duration:1000, loop: -1, alpha: 0.5, ease: 'Linear', yoyo: true});
        }
    }
    
    update(){
        // this.coinText.setText(userData.coin);
        // this.lifeText.setText(userData.heart);
        // this.points.setText(userData.point);
    }
    
    updateRanking(my_rank, rank_list){
        if(this.waitingText)
        {
            this.waitingText.destroy();
            
            let footerObject;
            if(event_mode == false && userData.username == 'admin')
            {
                footerObject = this.add.container(0,0).setSize(1000,100).setDepth(1);
                this.startButton = this.add.image(-200,0,'24EventStart').setDepth(1).setScale(0.5);
                this.startButton.setInteractive().on('pointerdown', () => {
                    Client.event_start();
                    this.startButton.setAlpha(0.5).disableInteractive();
                });
                footerObject.add(this.startButton);
                let toButton = this.add.image(200,0,'24EventTo').setDepth(1).setScale(0.5);
                toButton.setInteractive().on('pointerdown', () => {
                    event_mode = true;
                    game.scene.stop('HomeScreen');
                    game.scene.start('HomeScreen');
                });
                footerObject.add(toButton);
                if(event_data.active == true){
                    this.startButton.setAlpha(0.5).disableInteractive();
                }
            } else if (event_mode == false){
                footerObject = this.add.image(0,0,'24EventTo').setDepth(1).setScale(0.5);
                footerObject.setInteractive().on('pointerdown', () => {
                    event_mode = true;
                    game.scene.stop('HomeScreen');
                    game.scene.start('HomeScreen');
                });
            } else {
                footerObject = this.add.container(0,0).setSize(1000,100).setDepth(1);
                this.joinButton = this.add.image(-200,0,'24EventJoin').setDepth(1).setScale(0.5);
                this.joinButton.setInteractive().on('pointerdown', () => {
                   Client.join_event();
                });
                footerObject.add(this.joinButton);
                let outbutton = this.add.image(200,0,'24EventOut').setDepth(1).setScale(0.5);
                outbutton.setInteractive().on('pointerdown', () => {
                    event_mode = false;
                    game.scene.stop('HomeScreen');
                    game.scene.start('HomeScreen');
                });
                footerObject.add(outbutton);
                if(event_data.active == false || userData.event_joined)
                {
                    this.joinButton.setAlpha(0.5).disableInteractive();
                    // toast_error(this, "You are now joined to 24 Event");
                }
                else {
                    // toast_error(this, "You are not joined to 24 Event");
                }
            }
    
            this.headObject = this.add.text(0, 0, event_mode? '24 Event Ranking' : 'Live Ranking', { fixedWidth: 1000, fixedHeight: 100 })
            .setStyle({
                fontSize: '64px',
                fontFamily: 'RR',
                fontWeight: 'bold',
                align: "center",
                fill: '#fa5c00',
            }).setDepth(1)
            .setOrigin(0.5,0.5);

            this.rank_list = this.rexUI.add.scrollablePanel({
                x: 540,
                y: 1250,
                width: 1000,
                height: 1200,
    
                scrollMode: 0,
    
                background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0x4e342e),
    
                panel: {
                    child: this.rexUI.add.fixWidthSizer({
                        space: {
                            left: 10,
                            right: 10,
                            top: 10,
                            bottom: 10,
                            item: 16,
                            line: 16,
                        }
                    }),
    
                    mask: {
                        padding: 1
                    },
                },
    
                slider: {
                    track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x260e04),
                    thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0x7b5e57),
                    input: 'drag',
                    position: 0,
                },
    
                scroller:{
                    threshold: 0,
                },
    
                clamplChildOY : true,
    
                space: {
                    left: 30,
                    right: 30,
                    top: 30,
                    bottom: 30,
    
                    panel: 30,

                    header: 10,
                },

                header: this.headObject,

                footer: footerObject,

                expand: {
                    header: true,
                    footer: false,
                },

                align: {
                    header: 'center',
                    footer: 'center',
                },
            });
        }
        var sizer = this.rank_list.getElement('panel');
        sizer.clear(true);

        let bInRanking = false;
        for(let i=0; i<rank_list.length; i++){
            if(rank_list[i].username == userData.username)
            {
                sizer.add(this.add.text(0, 0, (i+1) + ' - ' + rank_list[i].username + ' (Lv:' + (event_mode ? rank_list[i].level_24 : rank_list[i].level) + ',' + getTimeTextFromMs(event_mode ? rank_list[i].point_24 : rank_list[i].point) + ')', { fixedWidth: 900, fixedHeight: 80 })
                .setStyle({
                    fontSize: '48px',
                    fontFamily: 'RR',
                    fontWeight: 'bold',
                    color: '#1fbae1',
                }));
                bInRanking = true;
            }
            else{
                sizer.add(this.add.text(0, 0, (i+1) + ' - ' + rank_list[i].username + ' (Lv:' + (event_mode ? rank_list[i].level_24 : rank_list[i].level) + ',' + getTimeTextFromMs(event_mode ? rank_list[i].point_24 : rank_list[i].point) + ')', { fixedWidth: 900, fixedHeight: 80 })
                .setStyle({
                    fontSize: '48px',
                    fontFamily: 'RR',
                    fontWeight: 'bold',
                    color: '#ffffff',
                }));
            }
        }
        if(!bInRanking){
            if(!event_mode && !userData.event_joined){
                if(my_rank.ranking > 10){
                    sizer.add(this.add.text(0, 0, '   ...   ', { fixedWidth: 900, fixedHeight: 80 })
                    .setStyle({
                        fontSize: '48px',
                        fontFamily: 'RR',
                        fontWeight: 'bold',
                        color: '#ffffff',
                    }));
                }
                sizer.add(this.add.text(0, 0, (my_rank.ranking+1) + ' - ' + userData.username + ' (Lv:' + (event_mode ? userData.level_24 : userData.level)  + ',' + getTimeTextFromMs(event_mode ? userData.point_24 : userData.point) + ')', { fixedWidth: 900, fixedHeight: 80 })
                .setStyle({
                    fontSize: '48px',
                    fontFamily: 'RR',
                    fontWeight: 'bold',
                    color: '#1fbae1',
                }));
            }
        }
        this.rank_list.layout();
        this.rank_list.setSliderEnable(true);
        this.rank_list.setScrollerEnable(true);
        game.domContainer.style.display = 'none';
        if(event_mode && event_data.active){
            this.timer = this.time.addEvent({
                delay: 1000,
                callback: this.updateTimer,
                args: [this],
                loop: true
            });
        }
    }

    updateTimer(scene){
        let currentTime = new Date();
        let end_time = new Date(event_data.end_time);
        if(end_time <= currentTime)
            scene.headObject.setText('24 Event Ranking ( Closed )');
        else{
            scene.headObject.setText('24 Event Ranking ( ' + getDateTimeTextFromMs(end_time.getTime() - currentTime.getTime()) + ')');
        }
    }

    updateUser(){
        for(let i=0; i<3; i++)
        {
            if(i+1 > userData.heart)
                this.hearts[i].setVisible(false);
            else
                this.hearts[i].setVisible(true);
        }
        this.coinText.setText(userData.coin);
        this.pointText.setText('Lv:' + userData.level + '(' + getTimeTextFromMs(userData.point)+ ')');
        if(userData.heart == 0)
        {
            this.play.disableInteractive();
            this.play.setAlpha(0.5);
        }
        else
        {
            if(event_mode == false || userData.event_joined == true){
                this.play.setInteractive();
                this.play.setAlpha(1);
            }
        }
    }
}
