import { state, statePropsEnum } from "../state/globalState";
import { k } from "../kaboomContext";

export function setBgColor(k, hexColorCode){
    k.add([
        k.rect(k.width(), k.height()),
        k.color(k.Color.fromHex(hexColorCode)),
        k.fixed(), // game object not affected by camera so doesnt move with camera
    ]);
}

export function setMapColliders(k, map, colliders){
    for(const collider of colliders){
        if(collider.polygon){
            const coordinates = [];
            for(const points of collider.polygon){
                coordinates.push(k.vec2(points.x, points.y));
            }

            map.add([ // adding a child game object to our parent game object which is the map
                k.pos(collider.x, collider.y),
                k.area({ // creates a hitbox for your object
                    shape : new k.Polygon(coordinates), // Polygon() constructor takes in array of vec2 only
                    collisionIgnore : ["collider"] // ignore collision with other collider
                }),
                k.body({ isStatic : true }),
                "collider",
                collider.type 
            ]);
            continue;
        }
        if(collider.name == "boss-barrier"){ 
            const bossBarrier = map.add([
                k.rect(collider.width, collider.height),
                k.color(k.Color.fromHex("#eacfba")),
                k.pos(collider.x, collider.y),
                k.area({
                    collisionIgnore : ["collider"],
                }),
                k.opacity(0),
                "boss-barrier",
                {
                    // using tweens boss barrier goes from invisible to visible
                    activate(){
                        k.tween(
                            this.opacity,
                            0.3,
                            1,
                            (val) => (this.opacity = val),
                            k.easings.linear
                        );

                        k.tween(
                            k.camPos().x,
                            collider.properties[0].value,
                            1,
                            (val) => k.camPos(val, k.camPos().y),
                            k.easings.linear
                        );
                    },
                    async deactivate(playerPosX){
                        k.tween(
                            this.opacity,
                            0,
                            1,
                            (val) => (this.opacity = val),
                            k.easings.linear
                        );
                        //moving camera to player position

                        await k.tween(
                            k.camPos().x,
                            playerPosX,
                            1,
                            (val) => k.camPos(val, k.camPos().y),
                            k.easings.linear
                        );

                        k.destroy(this);
                    }
                }
            ]);

            bossBarrier.onCollide("player", async (player) => {
                const currentState = state.current();
                if(currentState.isBossDefeated){
                    state.set(statePropsEnum.playerIsInBossFight, false);
                    bossBarrier.deactivate(player.pos.x);
                    return;
                }

                if(currentState.playerIsInBossFight) return;

                player.disableControls();
                player.play("idle");

                await k.tween(
                    player.pos.x,
                    player.pos.x + 25,
                    0.2,
                    (val) => (player.pos.x = val),
                    k.easings.linear
                );
                player.setControls();
            });

            bossBarrier.onCollideEnd("player", () => {
                const currentState = state.current();

                if(currentState.playerIsInBossFight || currentState.isBossDefeated) return;

                state.set(statePropsEnum.playerIsInBossFight, true);
                bossBarrier.activate();
                bossBarrier.use(k.body({ isStatic : true }));
            })
            continue;
        }

        map.add([
            k.pos(collider.x, collider.y),
            k.area({
                shape : new k.Rect(k.vec2(0), collider.width, collider.height),
                collisionIgnore : ["collider"]
            }),
            "collider",
            collider.type,
            k.body({ // can only be used when you have the area component defined, susceptible to gravity and physics
                isStatic : true // a wall
            })
        ])
    }
}

export function setCameraControls(k, player, map, roomData){
    k.onUpdate(() => {
        if(state.current().playerIsInBossFight) return;

        if(map.pos.x + 160 > player.pos.x){ // handling out of bound for camera movement
            k.camPos(map.pos.x + 160, k.camPos().y);
            return;
        }

        if(player.pos.x > map.pos.x + roomData.width * roomData.tilewidth - 160){ // handling out of bound for camera movement
            k.camPos(
                map.pos.x + roomData.width * roomData.tilewidth - 160,
                k.camPos().y
            );
            return;
        }

        k.camPos(player.pos.x, k.camPos().y) // if everything ok follow player on x axis
    })
}

export function setCameraZones(k, map, cameras){
    for(const camera of cameras){
        const cameraZone = map.add([ // game object of map
            k.area({
                shape : new k.Rect(k.vec2(0), camera.width, camera.height),
                collisionIgnore : ["collider"],
            }),
            k.pos(camera.x, camera.y),
        ])

        cameraZone.onCollide("player", () => {
            if(k.camPos().x != camera.properties[0].value){
                k.tween( // gradually chaging value of something by easing the mathematical values
                    k.camPos().y, // from
                    camera.properties[0].value, // to
                    0.8, // time
                    (val) => k.camPos(k.camPos().x, val), // what to do after
                    k.easings.linear
                )
            }
        })
    }
}

export function setExitZones(map, exits, destinationName){
    for(const exit of exits){
        const exitZone = map.add([
            k.pos(exit.x, exit.y),
            k.area({
                shape : new k.Rect(k.vec2(0), exit.width, exit.height),
                collisionIgnore : ["collider"]
            }),
            k.body({ isStatic : true }),
            exit.name
        ]);

        exitZone.onCollide("player", async () => {
            const background = k.add([ // to have a nice transition (rectangle that takes up the screen)
                k.pos(-k.width(), 0),
                k.rect(k.width(), k.height()),
                k.color("#20214a")
            ]);
            // moving the transition rectangle 
            await k.tween(
                background.pos.x,
                0,
                0.3,
                (val) => (background.pos.x = val),
                k.easings.linear
            );
            if(exit.name == "final-exit"){
                k.go("final-exit");
                return;
            }

            k.go(destinationName, { exitName : exit.name });
        })
    }
}