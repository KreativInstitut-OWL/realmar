import { render, screen } from "@testing-library/react";
import { expect, describe, it } from "vitest";
import App from "./App";
import { LanguageProvider } from "./LanguageProvider";

describe("App", () => {
  it("renders the App component", () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const appText = screen.getByText("realm AR");
    expect(appText).not.toBeNull();
  });
});
