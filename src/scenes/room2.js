import { setBgColor, setCameraControls, setCameraZones, setExitZones, setMapColliders } from "./roomUtils";
import { k } from "../kaboomContext";
import { state, statePropsEnum } from "../state/globalState";
import { makePlayer } from "../entities/player";
import { makeDrone } from "../entities/enemyDrone";
import { makeBoss } from "../entities/enemyBoss";
import { makeCartridge } from "../entities/healthCartridge";
import { healthBar } from "../ui/healthBar";

export function room2(data, previousData){
    setBgColor(k, "#a2aed5");

    k.camScale(4);
    k.camPos(170, 100);
    k.setGravity(1000);

    const roomLayers = data.layers;
    const map = k.add([
        k.pos(0,0),
        k.sprite("room2")
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

    setExitZones(map, exits, "room1");

    for(const pos of positions){

        if(pos.name == "entrance-1" && previousData.exitName == "exit-1"){
            player.setPosition(pos.x, pos.y);
            player.setControls();
            player.setEvents();
            player.enablePassThrough();
            k.camPos(player.pos);
            continue;
        }
        if(pos.name == "entrance-2" && previousData.exitName == "exit-2"){
            player.setPosition(pos.x, pos.y);
            player.setControls();
            player.setEvents();
            player.enablePassThrough();
            player.respawn(1000, "room2", { exitName : "exit-2" });
            k.camPos(player.pos);
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

