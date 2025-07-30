import { k } from "../kaboomContext";

export async function makeBlink(entity, timeSpan = 0.1){
    // making entities blink when hit
    await k.tween(
        entity.opacity,
        0,
        timeSpan,
        (val) => (entity.opacity = val),
        k.easings.linear
    );

    k.tween(
        entity.opacity,
        1,
        timeSpan,
        (val) => ( entity.opacity = val ),
        k.easings.linear
    );
    
}