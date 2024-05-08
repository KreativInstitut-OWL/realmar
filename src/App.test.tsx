import { render, screen } from "@testing-library/react";
import App from "./App";
import { LanguageProvider } from "./LanguageProvider";

describe("App", () => {
  it("renders the App component", () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>,
    );
    const appText = screen.getByText("BundlAR");
    expect(appText).toBeInTheDocument();
  });
});
