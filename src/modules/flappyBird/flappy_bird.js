// 可以自定义游戏速度
let gameSpeed = 200
// 管道中间的空隙
const gap = 150

function init() {
  const game = new window.Phaser.Game(288, 505, window.Phaser.CANVAS, 'game')
  // 场景对象
  game.States = {}

  // 适配屏幕, 加载loading图片,并跳转到preload场景
  game.States.boot = {
    preload: function() {
      // 适配
      if (!game.device.desktop) {
        this.scale.scaleMode = window.Phaser.ScaleManager.EXACT_FIT
        this.scale.forcePortrait = true
        this.scale.refresh()
      }
      game.load.image('loading', require('./assets/preloader.gif'))
    },
    create: function() {
      game.state.start('preload')
    }
  }

  // 显示loading图片,预加载资源的场景, 加载完成后跳转到menu场景
  game.States.preload = {
    preload: function() {
      const preloadSprite = game.add.sprite(34, game.height / 2, 'loading')
      game.load.setPreloadSprite(preloadSprite)
      game.load.image('background', require('./assets/background.png'))
      game.load.image('ground', require('./assets/ground.png'))
      game.load.image('title', require('./assets/title.png'))
      game.load.spritesheet('bird', require('./assets/bird.png'), 34, 24, 3)
      game.load.image('btn', require('./assets/start-button.png'))
      game.load.spritesheet('pipe', require('./assets/pipes.png'), 54, 320, 2)
      game.load.bitmapFont(
        'flappy_font',
        require('./assets/fonts/flappyfont/flappyfont.png'),
        require('./assets/fonts/flappyfont/flappyfont.fnt')
      )
      game.load.audio('fly_sound', require('./assets/flap.wav'))
      game.load.audio('score_sound', require('./assets/score.wav'))
      game.load.audio('hit_pipe_sound', require('./assets/pipe-hit.wav'))
      game.load.audio('hit_ground_sound', require('./assets/ouch.wav'))
      game.load.image('ready_text', require('./assets/get-ready.png'))
      game.load.image('play_tip', require('./assets/instructions.png'))
      game.load.image('game_over', require('./assets/gameover.png'))
      game.load.image('score_board', require('./assets/scoreboard.png'))
    },
    create: function() {
      game.state.start('menu')
    }
  }

  // 菜单界面
  game.States.menu = {
    create: function() {
      game.add.tileSprite(0, 0, game.width, game.height, 'background').autoScroll(-10, 0)
      game.add.tileSprite(0, game.height - 112, game.width, 112, 'ground').autoScroll(-100, 0)
      const titleGroup = game.add.group()
      titleGroup.create(0, 0, 'title')
      titleGroup
        .create(190, 10, 'bird')
        .animations.add('fly')
        .play(12, true)
      titleGroup.x = 35
      titleGroup.y = 100
      game.add.tween(titleGroup).to({ y: 120 }, 1000, null, true, 0, -1, true)
      game.add
        .button(game.width / 2, game.height / 2, 'btn', function() {
          game.state.start('play')
        })
        .anchor.setTo(0.5, 0.5)
    }
  }

  // 玩
  game.States.play = {
    create: function() {
      this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'background')
      this.pipeGroup = game.add.group()
      this.pipeGroup.enableBody = true
      this.ground = game.add.tileSprite(0, game.height - 112, game.width, 112, 'ground')
      this.bird = game.add.sprite(50, 150, 'bird')
      this.bird.animations.add('fly').play(12, true)
      this.bird.anchor.setTo(0.5, 0.5)
      // 开启bird的物理引擎
      game.physics.enable(this.bird, window.Phaser.Physics.ARCADE)
      this.bird.body.gravity.y = 0
      // 开启ground的物理引擎,并设置为不可移动
      game.physics.enable(this.ground, window.Phaser.Physics.ARCADE)
      this.ground.body.immovable = true
      this.soundFly = game.add.sound('fly_sound')
      this.soundScore = game.add.sound('score_sound')
      this.soundHitPipe = game.add.sound('hit_pipe_sound')
      this.soundHitGround = game.add.sound('hit_ground_sound')
      this.scoreText = game.add.bitmapText(game.world.centerX - 20, 30, 'flappy_font', '0', 36)
      this.readyText = game.add.image(game.width / 2, 40, 'ready_text')
      this.readyText.anchor.setTo(0.5, 0)
      this.playTip = game.add.image(game.width / 2, 300, 'play_tip')
      this.playTip.anchor.setTo(0.5, 0)
      this.hasStarted = false
      // 增加定时事件, 随机生成管道
      game.time.events.loop(900, this.generatePipes, this)
      game.time.events.stop(false)
      // 增加点击开始的事件,只生效一次
      game.input.onDown.addOnce(this.startGame, this)
    },
    update: function() {
      if (!this.hasStarted) return
      game.physics.arcade.collide(this.bird, this.ground, this.hitGround, null, this)
      // 小鸟和管道的碰撞检测
      game.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this)
      // 检测小鸟是否不在游戏内部,或者与边界相交, 触发撞击边界事件
      if (!this.bird.inWorld) this.hitCeil()
      // 随飞行调整小鸟角度
      if (this.bird.angle < 90) this.bird.angle += 2.5
      // 对存在的管道进行计分
      this.pipeGroup.forEachExists(this.checkScore, this)
    },
    // 生成随机长度的管道
    generatePipes: function() {
      const difficulty = 100 // difficulty瓒婂ぇ瓒婄畝鍗�
      const position = 50 + Math.floor((505 - 112 - difficulty - gap) * Math.random())
      const topPipeY = position - 320
      const bottomPipeY = position + gap
      // 一屏最多展示4管, resetpipe是复用kill掉的pipe, 没有可复用的就需要创建
      if (this.resetPipe(topPipeY, bottomPipeY)) return
      // 上管道
      game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup)
      // 下管道
      game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup)
      // 检测边界, 和下面的联合使用
      this.pipeGroup.setAll('checkWorldBounds', true)
      // 超出边界就销毁掉
      this.pipeGroup.setAll('outOfBoundsKill', true)
      this.pipeGroup.setAll('body.velocity.x', -gameSpeed)
    },
    // 开始游戏, 初始化变量,绑定事件, 开启定时器
    startGame: function() {
      gameSpeed = 200
      this.gameIsOver = false
      this.hasHitGround = false
      this.hasStarted = true
      this.score = 0
      this.bg.autoScroll(-(gameSpeed / 10), 0)
      this.ground.autoScroll(-gameSpeed, 0)
      this.bird.body.gravity.y = 1150
      this.readyText.destroy()
      this.playTip.destroy()
      game.input.onDown.add(this.fly, this)
      game.time.events.start()
    },
    // 停止所有运动和事件
    stopGame: function() {
      this.bg.stopScroll()
      this.ground.stopScroll()
      this.pipeGroup.forEachExists(function(pipe) {
        pipe.body.velocity.x = 0
      }, this)
      this.bird.animations.stop('fly', 0)
      game.input.onDown.remove(this.fly, this)
      game.time.events.stop(true)
    },
    // 设置垂直的速度, 以及小鸟向上的动画, 每点击一次执行一次此函数
    fly: function() {
      this.bird.body.velocity.y = -350
      game.add.tween(this.bird).to({ angle: -30 }, 100, null, true, 0, 0, false)
      this.soundFly.play()
    },
    // inworld为false触发,游戏结束
    hitCeil: function() {
      this.soundHitPipe.play()
      this.gameOver()
    },
    // 撞击管道, 游戏结束
    hitPipe: function() {
      if (this.gameIsOver) return
      this.soundHitPipe.play()
      this.gameOver()
    },
    // 撞击地面,游戏结束
    hitGround: function() {
      if (this.hasHitGround) return
      this.hasHitGround = true
      this.soundHitGround.play()
      this.gameOver(true)
    },
    gameOver: function(show_text) {
      this.gameIsOver = true
      this.stopGame()
      if (show_text) this.showGameOverText()
    },
    // 游戏结束,展示分数及开始新游戏按钮并绑定事件
    showGameOverText: function() {
      this.scoreText.destroy()
      game.bestScore = game.bestScore || 0
      if (this.score > game.bestScore) game.bestScore = this.score
      this.gameOverGroup = game.add.group()
      this.gameOverGroup.create(game.width / 2, 0, 'game_over').anchor.setTo(0.5, 0)
      this.gameOverGroup.create(game.width / 2, 70, 'score_board').anchor.setTo(0.5, 0)
      game.add.bitmapText(game.width / 2 + 60, 105, 'flappy_font', this.score + '', 20, this.gameOverGroup)
      game.add.bitmapText(game.width / 2 + 60, 153, 'flappy_font', game.bestScore + '', 20, this.gameOverGroup)
      game.add
        .button(
          game.width / 2,
          210,
          'btn',
          function() {
            game.state.start('play')
          },
          this,
          null,
          null,
          null,
          null,
          this.gameOverGroup
        )
        .anchor.setTo(0.5, 0)
      this.gameOverGroup.y = 30
    },
    // 将已经kill掉的管道重新设置位置, 进行复用
    resetPipe: function(topPipeY, bottomPipeY) {
      let i = 0
      this.pipeGroup.forEachDead(function(pipe) {
        if (pipe.y <= 0) {
          // 上管道
          pipe.reset(game.width, topPipeY)
          pipe.hasScored = false
        } else {
          // 下管道
          pipe.reset(game.width, bottomPipeY)
        }
        pipe.body.velocity.x = -gameSpeed
        i++
      }, this)
      return i === 2
    },
    // 计分
    checkScore: function(pipe) {
      // 上下两个管道记一分, 所以我们只记上面的管道为1分
      if (!pipe.hasScored && pipe.y <= 0 && pipe.x <= this.bird.x - 54) {
        pipe.hasScored = true
        this.scoreText.text = ++this.score
        this.soundScore.play()
        return true
      }
      return false
    }
  }

  game.state.add('boot', game.States.boot)
  game.state.add('preload', game.States.preload)
  game.state.add('menu', game.States.menu)
  game.state.add('play', game.States.play)

  game.state.start('boot')
}

export default init
