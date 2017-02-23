/* Mostly handle front-end render problem */
/* Parsing command from battle server log */
/* And Using Socket.io to update client   */
const express = require('express');
const app = express();
const url = require('url');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');
const jsfs = require('jsonfile');
/* core */
// const logger = require('./back-end/logger');
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
var player_channel = require('./player_channel.js');
/* Battle command */
var battle_cmd = '';
var cmd_flag = false;

app.post('/socket_test',function(req,res){
    /* Handle command from battle server */
    // logger.record('io.render','[io.render] Get Battle server request.');
    console.log('[io.render] Get Battle server request.');
    /* FIXME Parsing the command from battle server, and then pack them to render log */
    battle_cmd = req.body;
    /* emit socket once */
    cmd_flag = true;
    /* Send back message to battle server */
    res.end('OK, Server get: '+JSON.stringify(battle_cmd));
});

app.get('/pixi',function(req,res){
    /* Use for Testing Pixi */
    // logger.record('io.render','[io.render] Get Pixi test.');
    console.log('[io.render] Get Pixi test.');
    res.render('pixi',{
    });
});

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
    var cm = new player_channel(players.query.p1,players.query.p2,server,moment().format(),req.connection.remoteAddress);
    cm.cmd = 'start';
    cm.setup();
    connection_list.push(cm);

    // Register a room as record
    if(battle_room[players.query.p1+players.query.p2] != undefined){
        // already build
    }
    else{
        // Build a room for this pair
        battle_room[players.query.p1+players.query.p2] = moment().format();
        var record_data = {
            content: []
        };
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
    jsfs.writeFileSync(battle_record_storage+'/'+'['+ battle_t +']'+players.query.p1+'?'+players.query.p2+'.battlelog',record_obj);
    battle_recording[players.query.p1+players.query.p2] = undefined;
});

/* Check connection status */
app.get('/check_connection', function(req,res){
    /* Update connection list */
    connection_list.forEach(function(connection_node,index,object){
        // Also , check connection status , if useless, then remove it
        if(connection_node.active == false){
            object.splice(index,1);
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

// Listen url request
server.listen(process.env.npm_package_config_portiorender, function(){
    var host = server.address().address;
    var port = server.address().port;
    // logger.record('io.render',"[io.render] Example app listening at "+host+" : "+port);
    console.log("[io.render] Example app listening at "+host+" : "+port);
});
