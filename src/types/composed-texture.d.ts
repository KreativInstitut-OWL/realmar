/* eslint-disable @typescript-eslint/no-explicit-any */
// Type augmentation for ComposedTexture - kept simple with any types
declare global {
  namespace THREE {
    class ComposedTexture {
      static update(delta: number): void;
      static index: any[];
      static auto: boolean;
      static autoplay: boolean;

      container: any;
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      ready: boolean;
      isPlaying: boolean;
      time: number;
      duration: number;
      frameIndex: number;
      frameTime: number;

      constructor(container?: any);
      assign(container: any): Promise<void>;
      play(): this;
      pause(): this;
      resume(): this;
      stop(): this;
      reset(): this;
      compose(frameIndex: number): void;
      setFrame(frameIndex: number): void;
      dispose(): void;
    }
  }
}

export {};
