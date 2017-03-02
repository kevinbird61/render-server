/* Mostly handle front-end render problem */
/* Parsing command from battle server log */
/* And Using Socket.io to update client   */
const express = require('express');
const app = express();
const fs = require('fs');
const url = require('url');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');
const jsfs = require('jsonfile');
/* core */
// const logger = require('./back-end/logger');
var player_channel = require('./server-service/core/player_channel.js');

/* table and queue */
var connection_list = [];
var battle_room = {};
var battle_recording = {};

const battle_record_storage = __dirname + '/server-service/battle-record';
/* Redirect views path */
app.set('views',path.join(__dirname,'client-service/views'));
/* Setting static directory - image use */
app.use(express.static('client-service/images'));
app.use(express.static('client-service/sound'));
app.use(express.static('client-service/js'));
app.use(bodyParser.urlencoded({extended: false}));
/* Setting view engine as ejs */
app.set('view engine','ejs');

const server = require('http').createServer(app);

/* Get start Command */
app.get('/game_start', function(req,res){
    console.log('[io.render] Game Start.');
    // using get parameter
    var players = url.parse(req.url , true);
    console.log('[io.render] Match Player 1: ' + players.query.p1 + "; Match Player 2: " + players.query.p2);
    res.render('arena_game',{
        p1: players.query.p1,
        p2: players.query.p2
    });
    /* If there have no room , create one for it */
    var create_time = moment().format('YYYY-MM-DD-hh-mm-ss-a');
    var cm = new player_channel(players.query.p1,players.query.p2,server,create_time,req.connection.remoteAddress);
    cm.cmd = 'start';
    cm.setup();
    connection_list.push(cm);

    // Register a room as record
    if(battle_room[players.query.p1+players.query.p2] != undefined){
        // already build
    }
    else{
        // Build a room for this pair
        battle_room[players.query.p1+players.query.p2] = create_time;
        var record_data = {
            content: []
        };
        console.log("Build room !");
        battle_recording[players.query.p1+players.query.p2] = record_data;
    }
});

/* Get Battle Command (In Game) */
app.get('/game_cmd', function(req,res){
    console.log('[io.render] Cmd send from battle server');
    var players = url.parse(req.url , true);
    console.log('[io.render] Denote: ' + players.query.p1+players.query.p2+ "; Cmd is " + players.query.cmd);
    /* Parsing command here */
    var json_obj = JSON.parse(players.query.cmd);
    /* Maintain Connection channel */
    connection_list.forEach(function(connection_node,index,object){
        // Also , check connection status , if useless, then remove it
        if(connection_node.active == false){
            object.splice(index,1);
            delete connection_node;
        }
        // Compare , if fit then feed command
        if(connection_node.find(players.query.p1+players.query.p2) == true){
            connection_node.get_cmd(json_obj);
            return;
        }
    });
    // Record the battle command in battle_recording
    battle_recording[players.query.p1+players.query.p2].content.push(json_obj);
    res.end("OK , command send");
});

app.get('/game_end', function(req,res){
    var players = url.parse(req.url , true);
    console.log('[io.render] Battle of ' + players.query.p1+players.query.p2+ " comes to an end.");
    // Cancel from room
    var battle_t = battle_room[players.query.p1+players.query.p2];
    battle_room[players.query.p1+players.query.p2] = undefined;
    // Write record into file
    var record_obj = battle_recording[players.query.p1+players.query.p2];
    jsfs.writeFileSync(battle_record_storage+'/'+battle_t+'_'+players.query.p1+'_'+players.query.p2+'_.battlelog',record_obj);
    battle_recording[players.query.p1+players.query.p2] = undefined;
});

/* Check connection status */
app.get('/check_connection', function(req,res){
    /* Update connection list */
    connection_list.forEach(function(connection_node,index,object){
        // Also , check connection status , if useless, then remove it
        if(connection_node.active == false){
            object.splice(index,1);
            delete connection_node;
        }
    });
    console.log('[io.render] Checking current connection !');
    res.render('connection_table',{
        title: 'Connection Table',
        col1: '標籤',
        col2: 'IP位置',
        col3: '建立時間',
        content: connection_list
    });
});

/* Replay mechanism */
app.get('/replay_list',function(req,res){
    /* Fetch replay directory */
    var record_list = fs.readdirSync(battle_record_storage);
    /* Render choosing page */
    res.render('replay_list',{
        title: 'Replay Lobby',
        col1: '戰鬥時間',
        col2: '對戰人員1',
        col3: '對戰人員2',
        content: record_list
    });
});

/* Get replay target */
app.get('/go_replay',function(req,res){
    /* Get target name */
    var info = url.parse(req.url , true);
    var target = info.query.replay;
    console.log('[io.render] Prepare replay record - ' + target);
    /* Fetch data */
    if(fs.existsSync(battle_record_storage+'/'+target)){
        var battle_log = jsfs.readFileSync(battle_record_storage+'/'+target);
        // FIXME : using replay message deliver
        // send total log , using player_channel
        var re = new player_channel(target,target,server,moment().format('YYYY-MM-DD-hh-mm-ss-a'),req.connection.remoteAddress);
        re.get_replay(battle_log);
        re.setup();
        res.render('arena_game_replay',{
            script: target,
            log: battle_log
        });
        // destroy this channel
        delete re;
    }
    else{
        res.end('Sorry , can\'t find your replay target. Please try again!');
    }
});

// Post method of game command
app.post('/game_cmd',function(req,res){
    var cmd = req.body.cmd;
    var player1 = req.body.p1;
    var player2 = req.body.p2;
    /* Parsing command here */
    var json_obj = {
        cmd: cmd,
        current_minion: JSON.parse(req.body.current_minion),
        new_minion: JSON.parse(req.body.new_minion),
        buildings: JSON.parse(req.body.buildings)
    }
    /* Maintain Connection channel */
    connection_list.forEach(function(connection_node,index,object){
        // Also , check connection status , if useless, then remove it
        if(connection_node.active == false){
            object.splice(index,1);
            delete connection_node;
        }
        // Compare , if fit then feed command
        if(connection_node.find(player1+player2) == true){
            console.log('[io.render] Cmd send from battle server');
            console.log('[io.render] Denote: ' + player1+player2);
            connection_node.get_cmd(json_obj);
            return;
        }
    });
    // Record the battle command in battle_recording
    battle_recording[player1+player2].content.push(json_obj);
    res.end("OK ! Get Command!");
})

// Post method of end command
app.post('/game_end', function(req,res){
    var player1 = req.body.p1;
    var player2 = req.body.p2;
    console.log('[io.render] Battle of ' + player1+player2+ " comes to an end.");
    // Cancel from room
    var battle_t = battle_room[player1+player2];
    battle_room[player1+player2] = undefined;
    // Write record into file
    var record_obj = battle_recording[player1+player2];
    jsfs.writeFileSync(battle_record_storage+'/'+battle_t+'_'+player1+'_'+player2+'_.battlelog',record_obj);
    battle_recording[player1+player2] = undefined;
});

// Listen url request
if(process.env.TRAVIS != "true"){
    server.listen(process.env.npm_package_config_portiorender, function(){
        var host = server.address().address;
        var port = server.address().port;
        // logger.record('io.render',"[io.render] Example app listening at "+host+" : "+port);
        console.log("[io.render] io.render server listening at "+host+" : "+port);
    });
}
