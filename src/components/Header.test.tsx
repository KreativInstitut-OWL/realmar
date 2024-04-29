import { render, screen } from "@testing-library/react";
import Header from "./Header";

test("renders header", () => {
  render(<Header />);
  const headerElement = screen.getByAltText("KIO Logo");
  expect(headerElement).toBeInTheDocument();
});
