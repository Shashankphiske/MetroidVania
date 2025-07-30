import { k } from "../kaboomContext";

export function makeDrone(intialPos){
    return k.make([
        k.pos(intialPos),
        k.sprite("drone", { anim : "flying" }),
        k.area({ shape : new k.Rect(k.vec2(0), 12, 12) }),
        k.anchor("center"),
        k.body({ gravityScale : 0 }), // no effect of gravity
        k.offscreen({ distance : 400 }), // if the player gets away from the following drone (if the distance is >= 400 between them repositon drone to original position)
        k.state("patrol-right", ["patrol-right", "patrol-left", "alert", "attack", "retreat"]),
        k.health(1),
        "drone",

        // drone ai coding
        {
            speed : 100,
            pursuitSpeed : 150,
            range : 100,
            setBehavior(){
                const player = k.get("player", { recursive : true })[0];

                this.onStateEnter("patrol-right", async () => {
                    await k.wait(3); // wait 3 seconds before executing
                    if(this.state == "patrol-right") this.enterState("patrol-left");
                })

                this.onStateUpdate("patrol-right", () => { // will run everytime 60 frames when in this state
                    if(this.pos.dist(player.pos) < this.range){
                        this.enterState("alert");
                        return;
                    }

                    this.flipX = false;
                    this.move(this.speed, 0);
                })

                this.onStateEnter("patrol-left", async () => {
                    await k.wait(3);
                    if(this.state == "patrol-left") this.enterState("patrol-right");
                })

                this.onStateUpdate("patrol-left", () => {
                    if(this.pos.dist(player.pos) < this.range){
                        this.enterState("alert");
                        return;
                    }

                    this.flipX  = true;
                    this.move(-this.speed, 0);
                })

                this.onStateEnter("alert", async () => {
                    await k.wait(1);

                    if(this.pos.dist(player.pos) < this.range){
                        this.enterState("attack");
                        return;
                    }

                    this.enterState("patrol-right");
                });

                this.onStateUpdate("attack", () => {
                    if(this.pos.dist(player.pos) > this.range) {
                        this.enterState("alert");
                        return;
                    }

                    this.flipX = player.pos.x <= this.pos.x;
                    this.moveTo(k.vec2(player.pos.x, player.pos.y + 12), this.pursuitSpeed); // position and speed
                });
            },
            setEvents(){
                const player = k.get("player", { recursive : true })[0];

                this.onCollide("player", () => {
                    if(player.isAttacking) return;

                    this.hurt(1);
                    player.hurt(1);
                });

                this.onAnimEnd((anim) => {
                    if(anim == "explode"){
                        k.destroy(this);
                    }
                });

                this.on("explode", () => {
                    k.play("boom");
                    this.collisionIgnore = ["player"]; // no more collisions with player after first collison
                    this.unuse("body");
                    this.play("explode");
                });

                this.onCollide("sword-hitbox", () => {
                    this.hurt(1);
                });

                this.on("hurt", () => {
                    if(this.hp() == 0){
                        this.trigger("explode");
                    }
                });

                this.onExitScreen(() => {
                    this.pos = intialPos; // respawn when player is offscreen with distance of 400
                })
            }
        }
    ])
}