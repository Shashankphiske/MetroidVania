import { state, statePropsEnum } from "../state/globalState";
import { k } from "../kaboomContext";
import { makeBlink } from "./entitySharedLogic";
import { healthBar } from "../ui/healthBar";

export function makePlayer(){
    return k.make([
        k.pos(),
        k.sprite("player"),
        k.area({ shape : new k.Rect(k.vec2(0, 18), 12, 12) }), // offset of 0,18 and h and w of 12
        k.anchor("center"), // to determine from where the sprite is drawned or centered (for default top left corner 0,0)
        k.body({ mass : 100, jumpForce : 320 }), // affected by gravity
        k.doubleJump(state.current().isDoubleJumpUnlocked ? 2 : 1),
        k.opacity(), // when we want to control the players opacity when the player performs something in the game
        k.health(state.current().playerHp), // kaboom component to manage health
        "player",
        {
            speed : 150,
            isAttacking : false,
            setPosition(x, y){
                this.pos.x = x;
                this.pos.y = y;
            },
            disableControls(){
                for(const handler of this.controlHandlers){
                    handler.cancel();
                }
            },
            respawn(bound, destinationName, previousSceneData =  { exitName : null }){
                k.onUpdate(() => {
                    if(this.pos.y > bound){
                        k.go(destinationName, previousSceneData);
                    }
                })
            },
            enablePassThrough(){
                this.onBeforePhysicsResolve((collision) => {
                    if(collision.target.is("passthrough") && this.isJumping()){
                        collision.preventResolution(); // prevents collision
                    }
                })
            },
            setControls(){
                this.controlHandlers = [];
                this.controlHandlers.push(
                    k.onKeyPress((key) => {
                        if(key == "space"){
                            if(this.curAnim() != "jump") this.play("jump");
                            this.doubleJump();
                        }

                        if(key == "z" && this.curAnim() != "attack" && this.isGrounded()){
                            this.isAttacking = true;
                            this.add([ // hitbox for sword attack
                                k.pos(this.flipX ? -25 : 0, 10), // flipX allows a sprite to flip in mirror
                                k.area({
                                    shape : new k.Rect(k.vec2(0), 25, 10),
                                }),
                                "sword-hitbox"
                            ]);
                            this.play("attack"),
                            this.onAnimEnd((anim) => {
                                if(anim == "attack"){
                                    const swordHitBox = k.get("sword-hitbox", { recursive : true })[0]; // because this sword-hitbox is a child of another object then recursive : true
                                    if(swordHitBox) k.destroy(swordHitBox);
                                    this.isAttacking = false;
                                    this.play("idle");
                                }
                            })
                        }
                    })
                ),
                this.controlHandlers.push(
                    k.onKeyDown((key) => {
                        if(key == "left" && !this.isAttacking){
                            if(this.curAnim() != "run" && this.isGrounded()){
                                this.play("run");
                            }
                            this.flipX = true; // we want the player to flip when pressed the left key, so the sprite flips to its mirror image in left
                            this.move(-this.speed, 0);
                            return;
                        }
                    }),
                    k.onKeyDown((key) => {
                        if(key == "right" && !this.isAttacking){
                            if(this.curAnim() != "run" && this.isGrounded()){
                                this.play("run");
                            }
                            this.flipX = false; // original facing position of sprite
                            this.move(this.speed, 0);
                            return; 
                        }
                    })
                ),
                this.controlHandlers.push(
                    k.onKeyRelease(() => {
                        if(this.curAnim() != "idle" && this.curAnim() != "attack" && this.curAnim() != "jump" && this.curAnim() != "fall"){
                            this.play("idle");
                        }
                    })
                )
            },
            setEvents(){
                this.onFall(() => {
                    this.play("fall");
                });

                this.onFallOff(() => {
                    this.play("fall");
                });

                this.onGround(() => {
                    this.play("idle");
                });

                this.onHeadbutt(() => { // when player hits obstacle with head
                    this.play("fall");
                });

                this.on("heal", () => {
                    state.set(statePropsEnum.playerHp, this.hp());
                    healthBar.trigger("update");
                });

                this.on("hurt", () => {
                    makeBlink(this);
                    if(this.hp() > 0){
                        state.set(statePropsEnum.playerHp, this.hp());
                        healthBar.trigger("update");
                        return;
                    }

                    // so the player died
                    state.set(statePropsEnum.playerHp, state.current().maxPlayerHp);
                    k.play("boom");
                    this.play("explode");
                });

                this.onAnimEnd((anim) => {
                    if(anim == "explode"){
                        k.go("room1");
                    }
                })
            },
            enableDoubleJump(){
                this.numJumps = 2;
            }
        },
    ])
}