import { makeBoss } from "../entities/enemyBoss";
import { makeDrone } from "../entities/enemyDrone";
import { makePlayer } from "../entities/player";
import { k } from "../kaboomContext";
import { setBgColor, setCameraControls, setCameraZones, setExitZones, setMapColliders } from "./roomUtils";
import { state, statePropsEnum } from "../state/globalState";
import { makeCartridge } from "../entities/healthCartridge";
import { healthBar } from "../ui/healthBar";

export function room1(data, previousData = { exitName : null }){
    k.add([ // game object : array of components (we can use add method or make method, make methods create the game obj but doesnt add it to the scene)

    ]);

    setBgColor(k, "#a2aed5");

    // camera operation
    k.camScale(4);
    k.camPos(170, 100);
    k.setGravity(1000);

    const roomLayers = data.layers;

    const map = k.add([
        k.pos(0,0),
        k.sprite("room1"),
    ]);
    const positions = [];
    const colliders = [];
    const cameras = [];
    const exits = [];


    for(const layer of roomLayers){
        if(layer.name == "positions"){
            positions.push(...layer.objects);
            continue;
        }
        if(layer.name == "cameras"){
            cameras.push(...layer.objects);
            continue;
        }
        if(layer.name == "colliders"){
            colliders.push(...layer.objects);
            continue;
        }
        if(layer.name == "exits"){
            exits.push(...layer.objects);
            continue;
        }
    }

    setMapColliders(k, map, colliders);
    setCameraZones(k, map, cameras);

    const player = map.add(makePlayer());
    setCameraControls(k, player, map, data);    

    setExitZones(map, exits, "room2");

    for(const pos of positions){
        if(pos.name == "player" && !previousData.exitName){
            player.setPosition(pos.x, pos.y);
            player.setControls();
            player.setEvents();
            player.enablePassThrough();
            player.respawn(1000, "room1");
            continue;
        }
        if(pos.name == "entrance-1" && previousData.exitName == "exit-1"){
            player.setPosition(pos.x, pos.y);
            player.setControls();
            player.setEvents();
            player.enablePassThrough();
            player.respawn(1000, "room1");
            k.camPos(player.pos);
            continue;
        }
        if(pos.name == "entrance-2" && previousData.exitName == "exit-2"){
            player.setPosition(pos.x, pos.y);
            player.setControls();
            player.setEvents();
            player.enablePassThrough();
            player.respawn(1000, "room1");
            k.camPos(player.pos);
            continue;
        }
        if(pos.type == "drone"){
            const drone = map.add(makeDrone(k.vec2(pos.x, pos.y)));
            drone.setBehavior();
            drone.setEvents();
            continue;
        }
        if(pos.name == "boss" && !state.current().isBossDefeated){
            const boss = map.add(makeBoss(k.vec2(pos.x, pos.y)));
            boss.setBehaviour();
            boss.setEvents();
            continue;
        }
        if(pos.type == "cartridge"){
            map.add(makeCartridge(k.vec2(pos.x, pos.y)));
        }
    }

    k.add(healthBar);
    healthBar.setEvents();
    healthBar.trigger("update");
}