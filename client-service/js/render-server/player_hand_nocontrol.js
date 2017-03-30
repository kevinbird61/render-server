// Dealing with player hand render job
/*
    When using this object , it represent a hand of current game (so it will have 2 as maximum in one game)
    Constructor :
                Initialize "current hand" , with length 0;
                Initialize PIXI.Container as attributes
                And setup (Initialize) the stage (PIXI) of hand (prepare for drawing card picture later)
    update :
                Compare input array and previous array (checkout what's different and change card picture)
*/
var PLAYER_HAND = function(belong,max_w,max_h,battle_stage){
    // Create new stage
    this.stage = new PIXI.Container();
    // Load all image source into PLAYER_HAND
    this.texture_map = {};
    // Load elf
    this.texture_map['elf_archer'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/elf/elf_archer_mugshot.png"));
    this.texture_map['elf_wisp'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/elf/elf_wisp_mugshot.png"));
    this.texture_map['elf_giant'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/elf/elf_rock_giant_mugshot.png"));
    this.texture_map['elf_dancer'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/elf/elf_dancer_mugshot.png"));
    // Load human
    this.texture_map['human_knight'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/human/human_knight_mugshot.png"));
    this.texture_map['human_priest'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/human/human_priest_mugshot.png"));
    this.texture_map['human_thief'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/human/human_thief_mugshot.png"));
    this.texture_map['human_piper'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/human/human_piper_mugshot.png"));
    // Load siege
    this.texture_map['sgram'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/siege/sgram_mugshot.png"));
    // Load undead
    this.texture_map['undead_samurai'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/undead/undead_samurai_mugshot.png"));
    this.texture_map['undead_alchemist'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/undead/undead_alchemist_mugshot.png"));
    // Load waling pic
    var walking_texture = {};
    walking_texture['elf_archer'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/elf/elf_archer.gif"));
    walking_texture['elf_giant'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/elf/elf_rock_giant.gif"));
    walking_texture['elf_dancer'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/elf/elf_dancer.gif"));
    walking_texture['elf_wisp'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/elf/elf_wisp.gif"));
    walking_texture['human_knight'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/human/human_knight.gif"));
    walking_texture['human_piper'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/human/human_piper.gif"));
    walking_texture['human_priest'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/human/human_priest.gif"));
    walking_texture['human_theif'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/human/human_thief.gif"));
    walking_texture['sgram'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/siege/sgram.gif"));
    walking_texture['undead_samurai'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/undead/undead_samurai.gif"));
    walking_texture['undead_alchemist'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/undead/undead_alchemist.gif"));
    walking_texture['unknown'] = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/unknown.png"));
    /* Create 4 sprite */
    this.sprite = {};
    this.sprite[0] = this.init_obj(belong,0,max_w,max_h,'human_priest',walking_texture,battle_stage);
    this.sprite[1] = this.init_obj(belong,1,max_w,max_h,'elf_archer',walking_texture,battle_stage);
    this.sprite[2] = this.init_obj(belong,2,max_w,max_h,'undead_samurai',walking_texture,battle_stage);
    this.sprite[3] = this.init_obj(belong,3,max_w,max_h,'sgram',walking_texture,battle_stage);

    this.stage.addChild(this.sprite[0].obj);
    this.stage.addChild(this.sprite[1].obj);
    this.stage.addChild(this.sprite[2].obj);
    this.stage.addChild(this.sprite[3].obj);

    // var result = new PIXI.Sprite(texture);
    this.stage_width = max_w;
    this.stage_height = max_h;
}

PLAYER_HAND.prototype.init_obj = function(belong,loc,max_w,max_h,type,walking_texture,battle_stage){
    /* Create sprite object:
        obj: load sprite
        belong: record owner
        width,height: record obj size
        userdata: record type
        texture_map: maintain walking texture
        underdeck: true if this sprite is in player deck
        main_stage: record main_stage (battlefield container)
        prev_stage: record current stage (player card deck container)
        mugshot: record mugshot texture of current sprite
        loc_x,loc_y: record recover location (for drag and drop recovery)
        bound_x,bound_y: record boundary of card deck
    */
    var result = {
        obj: new PIXI.Sprite(this.texture_map[type])
    }
    result.obj.belong = belong;
    result.obj.width = max_w;
    result.obj.height = max_w;
    result.obj.userdata = type;
    result.obj.texture_map = walking_texture;
    result.obj.underdeck = true;
    result.obj.main_stage = battle_stage;
    result.obj.prev_stage = this.stage;
    result.obj.mugshot = this.texture_map[type];
    result.obj.x = 0;
    result.obj.loc_x = 0;
    switch (loc) {
        case 0:
            result.obj.y = max_h/2 - 2*max_w;
            result.obj.loc_y = max_h/2 - 2*max_w;
            break;
        case 1:
            result.obj.y = max_h/2 - max_w;
            result.obj.loc_y = max_h/2 - max_w;
            break;
        case 2:
            result.obj.y = max_h/2;
            result.obj.loc_y = max_h/2;
            break;
        case 3:
            result.obj.y = max_h/2 + max_w;
            result.obj.loc_y = max_h/2 + max_w;
            break;
        default:
    }
    result.obj.bound_x = max_w;
    result.obj.bound_y = max_h;

    return result;
}

PLAYER_HAND.prototype.update = function(new_arr){
    // Using new received array to update player's hand
    for(var index in new_arr){
        this.sprite[index].obj.setTexture(this.texture_map[new_arr[index].name]);
        this.sprite[index].obj.userdata = new_arr[index].name;
        this.sprite[index].obj.mugshot = this.texture_map[new_arr[index].name];
    }
}
