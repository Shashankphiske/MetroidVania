import { k } from "../kaboomContext";
import { state, statePropsEnum } from "../state/globalState";

export function makeCartridge(pos){
    const cartridge = k.make([
        k.sprite("cartridge", { anim : "default" }),
        k.area(),
        k.anchor("center"),
        k.pos(pos)
    ]);

    cartridge.onCollide("player", (player) => {
        if(player.hp() < state.current().maxPlayerHp){
            k.play("health", { volume : 0.5 });
            player.heal(1);
            k.destroy(cartridge);
            return;
        }
    });

    return cartridge;
}