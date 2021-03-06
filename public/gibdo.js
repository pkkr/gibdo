(function() {
  var $, Background, Column, Entity, Game, Hero, InputHandler, Monster, Sprite, SpriteImage, World,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $ = Zepto;

  $(function() {
    var game;
    game = new Game;
    return game.run();
  });

  Game = (function() {

    function Game() {
      this.main = __bind(this.main, this);
    }

    Game.prototype.run = function() {
      this.setup();
      this.reset();
      this.then = Date.now();
      return setInterval(this.main, 1);
    };

    Game.prototype.setup = function() {
      this.world = new World;
      return this.inputHandler = new InputHandler(this.world);
    };

    Game.prototype.reset = function() {
      return this.world.reset();
    };

    Game.prototype.main = function() {
      var delta, now;
      now = Date.now();
      delta = now - this.lastUpdate;
      this.lastUpdate = now;
      this.lastElapsed = delta;
      this.update(delta / 1000);
      return this.render();
    };

    Game.prototype.update = function(modifier) {
      return this.inputHandler.update(modifier);
    };

    Game.prototype.render = function() {
      return this.world.render(this.lastUpdate, this.lastElapsed);
    };

    return Game;

  })();

  World = (function() {

    World.prototype.width = 512;

    World.prototype.height = 480;

    World.prototype.viewWidth = 400;

    World.prototype.viewHeight = 300;

    World.prototype.sprites = [];

    function World() {
      this.ctx = this.createCanvas();
      this.hero = new Hero(this);
      this.column = new Column(this);
      this.sprites.push(new Background(this));
      this.sprites.push(new Monster(this));
      this.sprites.push(this.column);
      this.sprites.push(this.hero);
    }

    World.prototype.createCanvas = function() {
      var canvas;
      canvas = document.createElement("canvas");
      canvas.width = this.viewWidth;
      canvas.height = this.viewHeight;
      $(".container .game").append(canvas);
      return canvas.getContext("2d");
    };

    World.prototype.reset = function() {
      return this.hero.reset(this.width, this.height);
    };

    World.prototype.heroViewOffsetX = function() {
      return this.hero.viewOffsetX(this.viewWidth);
    };

    World.prototype.heroViewOffsetY = function() {
      return this.hero.viewOffsetY(this.viewHeight);
    };

    World.prototype.viewWidthLimit = function() {
      return this.width - this.viewWidth;
    };

    World.prototype.viewHeightLimit = function() {
      return this.height - this.viewHeight;
    };

    World.prototype.atViewLimitLeft = function() {
      return this.hero.x < this.heroViewOffsetX();
    };

    World.prototype.atViewLimitTop = function() {
      return this.hero.y < this.heroViewOffsetY();
    };

    World.prototype.atViewLimitRight = function() {
      return this.hero.x > this.viewWidthLimit() + this.heroViewOffsetX();
    };

    World.prototype.atViewLimitBottom = function() {
      return this.hero.y > this.viewHeightLimit() + this.heroViewOffsetY();
    };

    World.prototype.render = function(lastUpdate, lastElapsed) {
      var sprite, _i, _len, _ref;
      _ref = this.sprites;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sprite = _ref[_i];
        sprite.draw();
      }
      return this.renderDebugOverlay(lastElapsed);
    };

    World.prototype.renderDebugOverlay = function(lastElapsed) {
      this.ctx.save();
      this.ctx.fillStyle = "rgb(241, 241, 242)";
      this.ctx.font = "Bold 20px Monospace";
      this.ctx.fillText("" + (Math.round(1e3 / lastElapsed)) + " FPS", 10, 20);
      return this.ctx.restore();
    };

    World.prototype.up = function(mod) {
      return this.hero.up(mod);
    };

    World.prototype.down = function(mod) {
      return this.hero.down(mod, this.height);
    };

    World.prototype.left = function(mod) {
      return this.hero.left(mod);
    };

    World.prototype.right = function(mod) {
      return this.hero.right(mod, this.width);
    };

    World.prototype.collidableSprites = function() {
      var sprite, _i, _len, _ref, _results;
      _ref = this.sprites;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sprite = _ref[_i];
        if (sprite.collidable) _results.push(sprite);
      }
      return _results;
    };

    return World;

  })();

  InputHandler = (function() {

    InputHandler.prototype.keysDown = {};

    function InputHandler(world) {
      var _this = this;
      this.world = world;
      $("body").keydown(function(e) {
        return _this.keysDown[e.keyCode] = true;
      });
      $("body").keyup(function(e) {
        return delete _this.keysDown[e.keyCode];
      });
    }

    InputHandler.prototype.update = function(modifier) {
      if (38 in this.keysDown) this.world.up(modifier);
      if (40 in this.keysDown) this.world.down(modifier);
      if (37 in this.keysDown) this.world.left(modifier);
      if (39 in this.keysDown) return this.world.right(modifier);
    };

    return InputHandler;

  })();

  SpriteImage = (function() {

    SpriteImage.prototype.ready = false;

    SpriteImage.prototype.url = "images/sheet.png";

    function SpriteImage() {
      var image,
        _this = this;
      image = new Image;
      image.src = this.url;
      image.onload = function() {
        return _this.ready = true;
      };
      this.image = image;
    }

    return SpriteImage;

  })();

  Sprite = (function() {

    Sprite.prototype.sx = 0;

    Sprite.prototype.sy = 0;

    Sprite.prototype.sw = 0;

    Sprite.prototype.sh = 0;

    Sprite.prototype.dx = 0;

    Sprite.prototype.dy = 0;

    Sprite.prototype.dw = 0;

    Sprite.prototype.dh = 0;

    Sprite.prototype.x = 0;

    Sprite.prototype.y = 0;

    Sprite.prototype.image = new SpriteImage;

    Sprite.prototype.collidable = false;

    function Sprite(world) {
      this.world = world;
    }

    Sprite.prototype.drawImage = function(sx, sy, dx, dy) {
      if (this.image.ready) {
        return this.world.ctx.drawImage(this.image.image, sx, sy, this.sw, this.sh, dx, dy, this.dw, this.dh);
      }
    };

    return Sprite;

  })();

  Background = (function(_super) {

    __extends(Background, _super);

    function Background(world) {
      this.dw = world.viewWidth;
      this.dh = world.viewHeight;
      this.sw = world.viewWidth;
      this.sh = world.viewHeight;
      Background.__super__.constructor.call(this, world);
    }

    Background.prototype.draw = function() {
      var x, y;
      x = this.world.hero.x - this.world.heroViewOffsetX();
      y = this.world.hero.y - this.world.heroViewOffsetY();
      if (this.world.atViewLimitLeft()) x = 0;
      if (this.world.atViewLimitTop()) y = 0;
      if (this.world.atViewLimitRight()) x = this.world.viewWidthLimit();
      if (this.world.atViewLimitBottom()) y = this.world.viewHeightLimit();
      return this.drawImage(x, y, this.dx, this.dy);
    };

    return Background;

  })(Sprite);

  Entity = (function(_super) {

    __extends(Entity, _super);

    function Entity() {
      Entity.__super__.constructor.apply(this, arguments);
    }

    Entity.prototype.draw = function() {
      if (this.world.atViewLimitLeft()) this.dx = this.x;
      if (this.world.atViewLimitTop()) this.dy = this.y;
      if (this.world.atViewLimitRight()) {
        this.dx = this.x - this.world.viewWidthLimit();
      }
      if (this.world.atViewLimitBottom()) {
        this.dy = this.y - this.world.viewHeightLimit();
      }
      return this.drawImage(this.sx, this.sy, this.dx, this.dy);
    };

    return Entity;

  })(Sprite);

  Monster = (function(_super) {

    __extends(Monster, _super);

    function Monster() {
      Monster.__super__.constructor.apply(this, arguments);
    }

    Monster.prototype.x = 400;

    Monster.prototype.y = 400;

    Monster.prototype.sw = 30;

    Monster.prototype.sh = 32;

    Monster.prototype.dw = 30;

    Monster.prototype.dh = 32;

    Monster.prototype.sy = 480;

    Monster.prototype.collidable = true;

    Monster.prototype.draw = function() {
      this.dx = this.x - this.world.hero.x + this.world.heroViewOffsetX();
      this.dy = this.y - this.world.hero.y + this.world.heroViewOffsetY();
      return Monster.__super__.draw.apply(this, arguments);
    };

    return Monster;

  })(Entity);

  Column = (function(_super) {

    __extends(Column, _super);

    function Column() {
      Column.__super__.constructor.apply(this, arguments);
    }

    Column.prototype.x = 300;

    Column.prototype.y = 300;

    Column.prototype.sw = 32;

    Column.prototype.sh = 32;

    Column.prototype.dw = 32;

    Column.prototype.dh = 32;

    Column.prototype.sy = 544;

    Column.prototype.collidable = true;

    Column.prototype.draw = function() {
      this.dx = this.x - this.world.hero.x + this.world.heroViewOffsetX();
      this.dy = this.y - this.world.hero.y + this.world.heroViewOffsetY();
      return Column.__super__.draw.apply(this, arguments);
    };

    return Column;

  })(Entity);

  Hero = (function(_super) {

    __extends(Hero, _super);

    function Hero() {
      Hero.__super__.constructor.apply(this, arguments);
    }

    Hero.prototype.sw = 32;

    Hero.prototype.sh = 30;

    Hero.prototype.dw = 32;

    Hero.prototype.dh = 30;

    Hero.prototype.speed = 256;

    Hero.prototype.sy = 513;

    Hero.prototype.direction = 0;

    Hero.prototype.draw = function() {
      this.dx = this.world.heroViewOffsetX();
      this.dy = this.world.heroViewOffsetY();
      this.sx = Math.round(this.x + this.y) % 64 < 32 ? this.direction : this.direction + 32;
      return Hero.__super__.draw.apply(this, arguments);
    };

    Hero.prototype.velocity = function(mod) {
      return this.speed * mod;
    };

    Hero.prototype.collision = function(x, y) {
      var o, _i, _len, _ref;
      _ref = this.world.collidableSprites();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i];
        if (y > o.y - this.dh && y < o.y + o.dh && x > o.x - this.dw && x < o.x + o.dw) {
          return true;
        }
      }
      return false;
    };

    Hero.prototype.up = function(mod) {
      var y;
      this.direction = 64;
      y = this.y - this.velocity(mod);
      if (y > 0 && !this.collision(this.x, y)) return this.y -= this.velocity(mod);
    };

    Hero.prototype.down = function(mod, height) {
      var y;
      this.direction = 0;
      y = this.y + this.velocity(mod);
      if (y < height - this.dh && !this.collision(this.x, y)) {
        return this.y += this.velocity(mod);
      }
    };

    Hero.prototype.left = function(mod) {
      var x;
      this.direction = 128;
      x = this.x - this.velocity(mod);
      if (x > 0 && !this.collision(x, this.y)) return this.x -= this.velocity(mod);
    };

    Hero.prototype.right = function(mod, width) {
      var x;
      this.direction = 192;
      x = this.x + this.velocity(mod);
      if (x < width - this.dw && !this.collision(x, this.y)) {
        return this.x += this.velocity(mod);
      }
    };

    Hero.prototype.viewOffsetX = function(width) {
      return (width / 2) - (this.dw / 2);
    };

    Hero.prototype.viewOffsetY = function(height) {
      return (height / 2) - (this.dh / 2);
    };

    Hero.prototype.reset = function(width, height) {
      this.x = this.viewOffsetX(width);
      return this.y = this.viewOffsetY(height);
    };

    return Hero;

  })(Entity);

}).call(this);
