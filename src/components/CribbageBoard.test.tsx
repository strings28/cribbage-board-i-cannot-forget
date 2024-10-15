import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CribbageBoard from "./CribbageBoard";

// Mock the react-confetti module
jest.mock("react-confetti", () => () => <div data-testid="confetti" />);

// Add this mock at the top of your file
const mockWindowDimensions = { width: 1024, height: 768 };
Object.defineProperty(window, "innerWidth", {
  value: mockWindowDimensions.width,
});
Object.defineProperty(window, "innerHeight", {
  value: mockWindowDimensions.height,
});

describe("CribbageBoard", () => {
  beforeEach(() => {
    render(<CribbageBoard />);
  });

  const addPlayer = (name: string) => {
    const input = screen.getByPlaceholderText("Enter player name");
    fireEvent.change(input, { target: { value: name } });
    fireEvent.click(screen.getByText("Add Player"));
  };

  test("adds a player", () => {
    addPlayer("Test Player");
    expect(screen.getByText("Test Player")).toBeInTheDocument();
  });

  test("increments player score", () => {
    addPlayer("Test Player");
    const incrementButton = screen.getAllByText("+")[0];
    fireEvent.click(incrementButton);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("decrements player score", () => {
    addPlayer("Test Player");
    const incrementButton = screen.getAllByText("+")[0];
    fireEvent.click(incrementButton);
    const decrementButton = screen.getAllByText("-")[0];
    fireEvent.click(decrementButton);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("does not allow score below 0", () => {
    addPlayer("Test Player");
    const decrementButton = screen.getAllByText("-")[0];
    fireEvent.click(decrementButton);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("does not allow score above 121", () => {
    addPlayer("Test Player");
    const incrementButton = screen.getAllByText("+")[0];
    for (let i = 0; i < 122; i++) {
      fireEvent.click(incrementButton);
    }
    expect(screen.getByText(/win/i)).toBeInTheDocument();
  });

  test("declares winner when score reaches 121", () => {
    addPlayer("Test Player");
    const incrementButton = screen.getAllByText("+")[0];
    for (let i = 0; i < 121; i++) {
      fireEvent.click(incrementButton);
    }
    expect(screen.getByText(/win/i)).toBeInTheDocument();
    expect(screen.queryByText("121")).not.toBeInTheDocument();
  });

  test("resets game", () => {
    addPlayer("Player 1");
    addPlayer("Player 2");
    const incrementButton = screen.getAllByText("+")[0];
    fireEvent.click(incrementButton);
    fireEvent.click(screen.getByText("New Game"));
    expect(screen.getAllByText("0").length).toBe(2);
  });

  test("increments games won count", () => {
    addPlayer("Test Player");
    const incrementButton = screen.getAllByText("+")[0];
    for (let i = 0; i < 121; i++) {
      fireEvent.click(incrementButton);
    }
    fireEvent.click(screen.getByText("New Game"));
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  test("removes player", () => {
    addPlayer("Test Player");
    const removeButton = screen.getByText("X");
    fireEvent.click(removeButton);
    expect(screen.queryByText("Test Player")).not.toBeInTheDocument();
  });

  test("resets game, increments winner's games won count, and removes winner banner", () => {
    addPlayer("Player 1");
    addPlayer("Player 2");
    const player1IncrementButton = screen.getAllByText("+")[0];
    for (let i = 0; i < 121; i++) {
      fireEvent.click(player1IncrementButton);
    }
    expect(screen.getByText(/Player 1 wins!/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("New Game"));
    expect(screen.queryByText(/Player 1 wins!/i)).not.toBeInTheDocument();
    expect(screen.getAllByText("0").length).toBe(2);
    expect(screen.getByText("(1)")).toBeInTheDocument();
    expect(screen.getByText("(0)")).toBeInTheDocument();
  });

  test("highlights current player", () => {
    addPlayer("Player 1");
    addPlayer("Player 2");
    const players = screen.getAllByText(/Player \d/);
    expect(players[0]).toHaveClass("current-player");
    expect(players[1]).not.toHaveClass("current-player");
  });

  test("changes current player on click", () => {
    addPlayer("Player 1");
    addPlayer("Player 2");
    const players = screen.getAllByText(/Player \d/);
    fireEvent.click(players[1]);
    expect(players[0]).not.toHaveClass("current-player");
    expect(players[1]).toHaveClass("current-player");
  });

  test("changes current player with arrow keys", () => {
    addPlayer("Player 1");
    addPlayer("Player 2");
    const board = screen.getByText("Cribbage Board").parentElement;
    if (!board) throw new Error("Board not found");

    const players = screen.getAllByText(/Player \d/);

    fireEvent.keyDown(board, { key: "ArrowRight" });
    expect(players[0]).not.toHaveClass("current-player");
    expect(players[1]).toHaveClass("current-player");

    fireEvent.keyDown(board, { key: "ArrowLeft" });
    expect(players[0]).toHaveClass("current-player");
    expect(players[1]).not.toHaveClass("current-player");
  });

  test("changes score with up and down arrow keys", () => {
    addPlayer("Player 1");
    addPlayer("Player 2");
    const board = screen.getByText("Cribbage Board").parentElement;
    if (!board) throw new Error("Board not found");

    const players = screen.getAllByText(/Player \d/);
    const player1Score = players[0].nextElementSibling?.querySelector("span");
    const player2Score = players[1].nextElementSibling?.querySelector("span");

    if (!player1Score || !player2Score)
      throw new Error("Player scores not found");

    // Increase Player 1's score
    fireEvent.keyDown(board, { key: "ArrowUp" });
    expect(player1Score).toHaveTextContent("1");
    expect(player2Score).toHaveTextContent("0");

    // Decrease Player 1's score
    fireEvent.keyDown(board, { key: "ArrowDown" });
    expect(player1Score).toHaveTextContent("0");
    expect(player2Score).toHaveTextContent("0");

    // Switch to Player 2 and increase score
    fireEvent.keyDown(board, { key: "ArrowRight" });
    fireEvent.keyDown(board, { key: "ArrowUp" });
    expect(player1Score).toHaveTextContent("0");
    expect(player2Score).toHaveTextContent("1");

    // Switch back to Player 1 and decrease score
    fireEvent.keyDown(board, { key: "ArrowLeft" });
    fireEvent.keyDown(board, { key: "ArrowDown" });
    expect(player1Score).toHaveTextContent("0");
    expect(player2Score).toHaveTextContent("1");
  });

  test("shows confetti when a player wins", () => {
    addPlayer("Test Player");
    const incrementButton = screen.getAllByText("+")[0];
    for (let i = 0; i < 121; i++) {
      fireEvent.click(incrementButton);
    }
    expect(screen.getByText(/Test Player wins!/i)).toBeInTheDocument();
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
  });

  test("hides confetti when starting a new game", () => {
    addPlayer("Test Player");
    const incrementButton = screen.getAllByText("+")[0];
    for (let i = 0; i < 121; i++) {
      fireEvent.click(incrementButton);
    }
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
    fireEvent.click(screen.getByText("New Game"));
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
  });

  test("shows confetti with correct props when a player wins", () => {
    addPlayer("Test Player");
    const incrementButton = screen.getAllByText("+")[0];
    for (let i = 0; i < 121; i++) {
      fireEvent.click(incrementButton);
    }
    expect(screen.getByText(/Test Player wins!/i)).toBeInTheDocument();
    const confetti = screen.getByTestId("confetti");
    expect(confetti).toBeInTheDocument();
    expect(confetti).toHaveAttribute(
      "width",
      mockWindowDimensions.width.toString()
    );
    expect(confetti).toHaveAttribute(
      "height",
      mockWindowDimensions.height.toString()
    );
  });
});
