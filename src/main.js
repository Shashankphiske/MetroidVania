import { k, scale } from "./kaboomContext";
import { room1 } from "./scenes/room1";
import { room2 } from "./scenes/room2";
import { setBgColor } from "./scenes/roomUtils";
import { makeNotificationBox } from "./ui/notificationBox";

async function main() {
  const roomData1 = await (await fetch("/maps/room1.json")).json();
  const roomData2 = await (await fetch("/maps/room2.json")).json();

  k.scene("room1", (previousData) => {
    room1(roomData1, previousData);
  });

  k.scene("room2", (previousData) => {
    room2(roomData2, previousData);
  });
}

main();

k.scene("intro", () => {
  setBgColor(k, "#20214a");
  k.add(
    makeNotificationBox(
      "Escape The Factory!\nUse arrow keys to move or a and d, space to jump, shift or z to attack,\n\nPress Enter To Start"
    )
  );
  k.onKeyPress("enter", () => {
    k.go("room1", { exitName : null });
  })
});

k.scene("final-exit", () => {
  setBgColor(k, "#20214a");
  k.add(
    makeNotificationBox(
      "You Escaped The Factory!\n The End. Thank You For Playing."
    )
  );
});

k.go("intro");