import { createMachine, assign } from "xstate";

export type ColorChoice = "red" | "blue" | "green" | "yellow";

interface Context {
  level: number;
  highestLevel: number;
  simon: Array<ColorChoice>;
  user: Array<ColorChoice>;
}

const chooseRandomColor = (): ColorChoice => {
  const choices: ColorChoice[] = ["red", "blue", "green", "yellow"];
  return choices[Math.floor(Math.random() * 4)];
};

/**
 * events:
 *  - user presses any key
 *  - simon shows next button
 *  - user clicks correct button
 *  - user clicks incorrect button
 *  - keypress to restart game
 *
 * states:
 *  - gameInProgress
 *    - simonTurn
 *    - userTurn
 *  - gameOver
 */
const simonMachine = createMachine<Context>(
  {
    id: "simon",
    initial: "idle",
    context: {
      level: 0,
      highestLevel: 0,
      simon: [],
      user: [],
    },
    states: {
      idle: {
        on: {
          START: "gameInProgress",
        },
      },
      gameInProgress: {
        initial: "simonTurn",
        type: "compound",
        states: {
          simonTurn: {
            entry: ["chooseNextColor", "increaseLevel", "setHighestLevel"],
            after: {
              1000: "userTurn",
            },
          },
          userTurn: {
            on: {
              USER_CHOOSE: {
                target: "checking",
                actions: ["addToUserArray"],
              },
            },
          },
          checking: {
            after: [
              { delay: 0, target: "userTurn", cond: "isCorrect" },
              { delay: 0, target: "roundOver", cond: "isNotCorrect" },
              { delay: 1000, target: "simonTurn", cond: "isCorrectAndFinal" },
            ],
          },
          roundOver: {
            on: {
              RETRY: {
                target: "simonTurn",
                actions: ["reset"],
              },
            },
          },
        },
        onDone: "gameOver",
      },
      gameOver: {
        type: "final",
      },
    },
  },
  {
    actions: {
      addToUserArray: assign({
        user: (context, event) => [...context.user, event.color],
      }),
      chooseNextColor: assign({
        simon: (context) => [...context.simon, chooseRandomColor()],
        user: (_context) => [],
      }),
      increaseLevel: assign({
        level: (context) => context.level + 1,
      }),
      setHighestLevel: assign({
        highestLevel: (context) =>
          context.level > context.highestLevel
            ? context.level
            : context.highestLevel,
      }),
      reset: assign({
        level: (_context) => 0,
        simon: (_context) => [],
        user: (_context) => [],
      }),
    },
    guards: {
      isCorrectAndFinal: (context, event) => {
        const latestUserInput = context.user.length - 1;
        const isCorrect =
          context.user[latestUserInput] === context.simon[latestUserInput];
        const isFinal = context.user.length === context.simon.length;

        return isCorrect && isFinal;
      },
      isCorrect: (context, event) => {
        const isFinal = context.user.length === context.simon.length;
        const latestUserInput = context.user.length - 1;
        const isCorrect =
          context.user[latestUserInput] === context.simon[latestUserInput];

        return isCorrect && !isFinal;
      },
      isNotCorrect: (context, event) => {
        const latestUserInput = context.user.length - 1;
        const isCorrect =
          context.user[latestUserInput] === context.simon[latestUserInput];

        return !isCorrect;
      },
    },
  }
);

export default simonMachine;
