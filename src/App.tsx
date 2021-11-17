import { IconCheck, IconCircle, IconX } from "@tabler/icons";
import { useMachine } from "@xstate/react";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import useSound from "use-sound";
import simonMachine, { ColorChoice } from "./machines/simon";
import hihat from "./sounds/hihat.wav";
import openHighHat from "./sounds/openHighHat.wav";
import kick from "./sounds/kick.wav";
import snare from "./sounds/snare.wav";

const App = () => {
  const [
    {
      context: { simon, user, highestLevel, level },
      matches,
    },
    send,
  ] = useMachine(simonMachine);

  const [snarePlay] = useSound(snare);
  const [kickPlay] = useSound(kick);
  const [hihatPlay] = useSound(hihat);
  const [openHighHatPlay] = useSound(openHighHat);

  const redButton = useRef<HTMLButtonElement>(null);
  const greenButton = useRef<HTMLButtonElement>(null);
  const blueButton = useRef<HTMLButtonElement>(null);
  const yellowButton = useRef<HTMLButtonElement>(null);

  const unBlurAll = () => {
    redButton.current?.blur();
    yellowButton.current?.blur();
    greenButton.current?.blur();
    blueButton.current?.blur();
  };

  const keydownEventListener = (e: KeyboardEvent) => {
    switch (e.key) {
      case "q":
        click("red");
        break;
      case "w":
        click("yellow");
        break;
      case "a":
        click("green");
        break;
      case "s":
        click("blue");
        break;
      case " ":
        send(matches("gameInProgress.roundOver") ? "RETRY" : "START");
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keydownEventListener);

    return () => {
      document.removeEventListener("keydown", keydownEventListener);
    };
  });

  useEffect(() => {
    if (matches("gameInProgress.simonTurn")) {
      unBlurAll();
      send("SIMON_CHOOSE");
      click(simon[simon.length - 1]);
    } else if (matches("gameInProgress.userTurn")) {
      unBlurAll();
    } else if (matches("gameInProgress.roundOver")) {
      unBlurAll();
    }
  }, [matches, simon, send]);

  const playSound = (color: ColorChoice) => {
    if (color === "red") {
      kickPlay();
    } else if (color === "yellow") {
      hihatPlay();
    } else if (color === "green") {
      snarePlay();
    } else if (color === "blue") {
      openHighHatPlay();
    }
  };

  const onClick = (color: ColorChoice) => {
    playSound(color);
    if (matches("gameInProgress.userTurn")) {
      send("USER_CHOOSE", { color });
    }
  };

  const getName = () => {
    switch (true) {
      case matches("gameInProgress.simonTurn"):
        return `Simon's turn`;
      case matches("gameInProgress.checking"):
      case matches("gameInProgress.userTurn"):
        return `Your turn`;
      case matches("gameInProgress.roundOver"):
        return `Game Over`;
      default:
        return `Simon`;
    }
  };

  const click = (color: ColorChoice) => {
    redButton.current?.blur();
    yellowButton.current?.blur();
    greenButton.current?.blur();
    blueButton.current?.blur();

    if (color === "red") {
      redButton.current?.focus();
      redButton.current?.click();
    } else if (color === "yellow") {
      yellowButton.current?.focus();
      yellowButton.current?.click();
    } else if (color === "green") {
      greenButton.current?.focus();
      greenButton.current?.click();
    } else if (color === "blue") {
      blueButton.current?.focus();
      blueButton.current?.click();
    }
  };

  const baseButtonStyles = [
    "outline-none",
    "transition-colors",
    "duration-150",
    "w-full",
    "h-full",
    "focus:border-8",
    "focus:border-white",
    "text-gray-700",
    "font-bold",
    "uppercase",
    "text-4xl",
    "tracking-wider",
  ];

  const simonChoice = simon[simon.length - 1];

  const renderStepIcons = simon.map((_, index) => {
    if (simon[index] === user[index]) {
      return <IconCheck key={index} className="inline-block stroke-current" />;
    } else if (index === user.length - 1 && user[index] !== simon[index]) {
      return <IconX key={index} className="inline-block stroke-current" />;
    } else {
      return <IconCircle key={index} className="inline-block stroke-current" />;
    }
  });

  return (
    <div className="max-w-[548px] mx-auto text-center px-6">
      {/* HEADER */}
      <section className="my-8">
        {/* TITLE */}
        <h1 className="text-6xl font-display text-yellow-100 uppercase">
          {getName()}
        </h1>

        {/* SCORES */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex">
            <div className="flex flex-col items-start mr-4">
              <h2 className="text-xs text-yellow-100 font-bold uppercase tracking-wider">
                Highest
              </h2>
              <h3 className="text-xl text- text-yellow-100 font-bold uppercase tracking-wider">
                {highestLevel}
              </h3>
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-xs text-yellow-100 font-bold uppercase tracking-wider">
                Current
              </h2>
              <h3 className="text-xl text-yellow-100 font-bold uppercase tracking-wider">
                {level}
              </h3>
            </div>
          </div>
          <div className="flex">
            {matches("idle") ? (
              <button
                className="bg-yellow-100 px-4 py-2 font-bold uppercase tracking-wider text-gray-800"
                onClick={() => send("START")}
              >
                Start Game
              </button>
            ) : matches("gameInProgress.roundOver") ? (
              <button
                className="bg-yellow-100 px-4 py-2 font-bold uppercase tracking-wider text-gray-800"
                onClick={() => send("RETRY")}
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* STEP ICONS */}
      <section className="w-full my-8 grid grid-cols-12 gap-1 justify-items-center grid-flow-row text-yellow-100">
        {renderStepIcons}
      </section>

      {/* BUTTONS */}
      <section className="grid grid-cols-2 grid-rows-2 gap-8">
        <div className="aspect-w-16 aspect-h-16">
          <button
            ref={redButton}
            className={clsx(baseButtonStyles, "bg-red-400 focus:bg-red-500", {
              "pointer-events-none": matches("gameInProgress.simonTurn"),
              "opacity-25":
                matches("gameInProgress.simonTurn") && simonChoice !== "red",
            })}
            onClick={() => onClick("red")}
          >
            Q
          </button>
        </div>
        <div className="aspect-w-16 aspect-h-16">
          <button
            ref={yellowButton}
            className={clsx(
              baseButtonStyles,
              "bg-yellow-400 focus:bg-yellow-500",
              {
                "pointer-events-none": matches("gameInProgress.simonTurn"),
                "opacity-25":
                  matches("gameInProgress.simonTurn") &&
                  simonChoice !== "yellow",
              }
            )}
            onClick={() => onClick("yellow")}
          >
            W
          </button>
        </div>
        <div className="aspect-w-16 aspect-h-16">
          <button
            ref={greenButton}
            className={clsx(
              baseButtonStyles,
              "bg-green-400 focus:bg-green-500",
              {
                "pointer-events-none": matches("gameInProgress.simonTurn"),
                "opacity-25":
                  matches("gameInProgress.simonTurn") &&
                  simonChoice !== "green",
              }
            )}
            onClick={() => onClick("green")}
          >
            A
          </button>
        </div>
        <div className="aspect-w-16 aspect-h-16">
          <button
            ref={blueButton}
            className={clsx(baseButtonStyles, "bg-blue-400 focus:bg-blue-500", {
              "pointer-events-none": matches("gameInProgress.simonTurn"),
              "opacity-25":
                matches("gameInProgress.simonTurn") && simonChoice !== "blue",
            })}
            onClick={() => onClick("blue")}
          >
            S
          </button>
        </div>
      </section>
    </div>
  );
};

export default App;
