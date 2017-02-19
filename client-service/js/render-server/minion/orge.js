/* Declare Orge minion */
var ORGE = function( char_w,char_h, object_No ,max_w,max_h){
    // Measurement by manual => FIXME automatical
    this.src_frame_w = 96;
    this.src_frame_h = 96;
    this.picture_frame = 7;
    this.scale = 2;
    this.boundary_x = max_w;
    this.boundary_y = max_h;
    //
    this.direction = -1; // Stop
    this.vx = 0;
    this.vy = 0;
    this.object_No = object_No; // Use for detective ( Convenience to distinguish )

    var texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
    texture.frame = (new PIXI.Rectangle(0,0,this.src_frame_w,this.src_frame_h));
    var result = new PIXI.Sprite(texture);
    result.width = char_w*this.scale;
    result.height = char_h*this.scale;
    result.x = 0;
    result.y = 0;
    this.basic_velocity = 1;
    this.obj = result;
}

ORGE.prototype.walking = function(current_tick){
    // FIXME if change picture, Custom Here (change source picture index)
    switch (this.direction) {
        case 0:
            // Left
            var left_texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
            left_texture.frame = (new PIXI.Rectangle((this.src_frame_w)*(current_tick%this.picture_frame),this.src_frame_h*this.picture_frame,this.src_frame_w,this.src_frame_h));
            this.obj.setTexture(left_texture);
            // and change velocity
            this.vx = (-1)*this.basic_velocity;
            this.vy = 0;
            break;
        case 1:
            // Right
            var right_texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
            right_texture.frame = (new PIXI.Rectangle(0+(this.src_frame_w)*(current_tick%this.picture_frame),0,this.src_frame_w,this.src_frame_h));
            this.obj.setTexture(right_texture);
            // change velocity
            this.vx = this.basic_velocity;
            this.vy = 0;
            break;
        case 2:
            // Top
            var top_texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
            top_texture.frame = (new PIXI.Rectangle(0+(this.src_frame_w)*(current_tick%this.picture_frame),this.src_frame_h,this.src_frame_w,this.src_frame_h));
            this.obj.setTexture(top_texture);
            // change velocity
            this.vx = 0;
            this.vy = (-1)*this.basic_velocity;
            break;
        case 3:
            // Down
            var down_texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
            down_texture.frame = (new PIXI.Rectangle(0+(this.src_frame_w)*(current_tick%this.picture_frame),4*this.src_frame_h,this.src_frame_w,this.src_frame_h));
            this.obj.setTexture(down_texture);
            // change velocity
            this.vx = 0;
            this.vy = this.basic_velocity;
            break;
        case 4:
            // Left + Top
            var lt_texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
            lt_texture.frame = (new PIXI.Rectangle((this.src_frame_w)*(current_tick%this.picture_frame),3*this.src_frame_h,this.src_frame_w,this.src_frame_h));
            this.obj.setTexture(lt_texture);
            // change velocity
            this.vx = (-0.707)*this.basic_velocity;
            this.vy = (-0.707)*this.basic_velocity;
            break;
        case 5:
            // Left + down
            var ld_texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
            ld_texture.frame = (new PIXI.Rectangle((this.src_frame_w)*(current_tick%this.picture_frame),6*this.src_frame_h,this.src_frame_w,this.src_frame_h));
            this.obj.setTexture(ld_texture);
            // change velocity
            this.vx = (-0.707)*this.basic_velocity;
            this.vy = (0.707)*this.basic_velocity;
            break;
        case 6:
            // Right + Top
            var rt_texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
            rt_texture.frame = (new PIXI.Rectangle((this.src_frame_w)*(current_tick%this.picture_frame),2*this.src_frame_h,this.src_frame_w,this.src_frame_h));
            this.obj.setTexture(rt_texture);
            // change velocity
            this.vx = (0.707)*this.basic_velocity;
            this.vy = (-0.707)*this.basic_velocity;
            break;
        case 7:
            // Right + down
            var rd_texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
            rd_texture.frame = (new PIXI.Rectangle((this.src_frame_w)*(current_tick%this.picture_frame),5*this.src_frame_h,this.src_frame_w,this.src_frame_h));
            this.obj.setTexture(rd_texture);
            // change velocity
            this.vx = (0.707)*this.basic_velocity;
            this.vy = (0.707)*this.basic_velocity;
            break;
        case 8:
            /* Attack */

            break;
        case 9:
            /* Stop (face right) */
            var right_texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
            right_texture.frame = (new PIXI.Rectangle(0+(this.src_frame_w)*(current_tick%this.picture_frame),0,this.src_frame_w,this.src_frame_h));
            this.obj.setTexture(right_texture);
            this.vx = 0;
            this.vy = 0;
            break;
        case 10:
            /* Stop (face left) */
            var left_texture = new PIXI.Texture(PIXI.BaseTexture.fromImage("minion/orge.png"));
            left_texture.frame = (new PIXI.Rectangle((this.src_frame_w)*(current_tick%this.picture_frame),this.src_frame_h*this.picture_frame,this.src_frame_w,this.src_frame_h));
            this.obj.setTexture(left_texture);
            this.vx = 0;
            this.vy = 0;
            break;
        default:
            // None, just stop and do nothing
            this.vx = 0;
            this.vy = 0;
            break;
    }
}

ORGE.prototype.change_direction = function(new_direction){
    // Moving x
	if(this.obj.x+this.obj.width >= this.boundary_x){
		this.obj.x -= 5;
    }
	else if(this.obj.x <= 0){
		this.obj.x += 5;
    }
	// Moving y
	if(this.obj.y+this.obj.height >= this.boundary_y){
        this.obj.y -= 5;
    }
	else if(this.obj.y <= 0){
		this.obj.y += 5;
    }
    this.direction = new_direction;
}

ORGE.prototype.setpos = function( x,y ){
    this.obj.position.set(x,y);
}

ORGE.prototype.check_boundary = function(){
    // x
	if(this.obj.x+this.obj.width >= this.boundary_x){
		this.vx = 0;
        this.direction = -1;
    }
	else if(this.obj.x <= 0){
		this.vx = 0;
        this.direction = -1;
    }
	// y
	if(this.obj.y+this.obj.height >= this.boundary_y){
		this.vy = 0;
        this.direction = -1;
    }
	else if(this.obj.y <= 0){
		this.vy = 0;
        this.direction = -1;
    }
}
