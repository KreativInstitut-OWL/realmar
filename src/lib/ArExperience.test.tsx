import { ArExperience } from "./ArExperience";
import { render, screen } from "@testing-library/react";
import { getPositions } from "./getPositions";

describe("ArExperience", () => {
  it("should generate correct HTML content for given files", () => {
    const files = [
      { name: "file1.jpg", type: "image/jpg" } as File,
      { name: "file2.png", type: "image/png" } as File,
      { name: "file3.mp4", type: "video/mp4" } as File,
    ];
    const sizes = [
      { width: 100, height: 200 },
      { width: 300, height: 400 },
      { width: 500, height: 600 },
    ];
    const meta = [
      { rotation: 0, faceCam: true, spacing: 10 },
      { rotation: 45, faceCam: false, spacing: 20 },
      { rotation: 90, faceCam: true, spacing: 30 },
    ];

    render(<ArExperience files={files} sizes={sizes} meta={meta} />, {});

    // Check that image assets are present and of the correct type
    expect(screen.getByTestId("asset0")).toBeInTheDocument();
    expect(screen.getByTestId("asset1")).toBeInTheDocument();
    expect(screen.getByTestId("asset2")).toBeInTheDocument();

    const img0 = screen.getByTestId("asset0") as HTMLImageElement;
    const img1 = screen.getByTestId("asset1") as HTMLImageElement;
    const video = screen.getByTestId("asset2") as HTMLVideoElement;

    expect(img0.tagName).toBe("IMG");
    expect(img1.tagName).toBe("IMG");
    expect(video.tagName).toBe("VIDEO");

    // Check meta data (rotation, faceCam, spacing)
    const positions = getPositions(meta);

    const plane0 = screen.getByTestId("plane0");
    const plane1 = screen.getByTestId("plane1");
    const plane2 = screen.getByTestId("plane2");

    expect(plane0.getAttribute("position")).toBe(`0 0 ${positions[0]}`);
    expect(plane0.getAttribute("rotation")).toBe("0 0 0");
    expect(plane0.getAttribute("width")).toBe("100");
    expect(plane0.getAttribute("height")).toBe("200");
    expect(plane0.getAttribute("look-at")).toBe("camera");

    expect(plane1.getAttribute("position")).toBe(`0 0 ${positions[1]}`);
    expect(plane1.getAttribute("rotation")).toBe("45 0 0");
    expect(plane1.getAttribute("width")).toBe("300");
    expect(plane1.getAttribute("height")).toBe("400");
    expect(plane1.getAttribute("look-at")).toBeNull();

    expect(plane2.getAttribute("position")).toBe(`0 0 ${positions[2]}`);
    expect(plane2.getAttribute("rotation")).toBe("90 0 0");
    expect(plane2.getAttribute("width")).toBe("500");
    expect(plane2.getAttribute("height")).toBe("600");
    expect(plane2.getAttribute("look-at")).toBe("camera");
  });
});
