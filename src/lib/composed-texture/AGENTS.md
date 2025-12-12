# ComposedTexture Tutorial & Reference

## Quick Reference

**Core Classes:**

- `THREE.ComposedTexture` - Animated texture from multi-frame images (GIF, APNG)
- `THREE.SpriteTexture` - Animated texture from sprite sheets

**Essential Pattern:**

```javascript
// 1. Load animation data into container object
// 2. Create texture: new THREE.ComposedTexture(container) or await texture.assign(container)
// 3. Use in material: new THREE.MeshBasicMaterial({ map: texture })
// 4. Update in render loop: THREE.ComposedTexture.update(clock.getDelta())
```

## Overview

`ComposedTexture` is a Three.js texture class that enables playing multi-frame images (GIF, APNG, etc.) as textures. It composes frames on-demand rather than decoding every pixel per frame, making it efficient for large animations.

Key features:

- Optimized frame composition (not per-pixel decoding)
- Supports GIF and APNG formats
- Power-of-two canvas handling
- Sprite sheet generation via `toSheet()`
- `SpriteTexture` for sprite sheet playback

## Installation

Include the ComposedTexture script after Three.js:

```html
<script src="https://unpkg.com/three@0.142.0"></script>
<script src="./ComposedTexture.js"></script>
```

Or import in a module environment:

```javascript
import * as THREE from "three";
import "./ComposedTexture.js"; // Registers THREE.ComposedTexture and THREE.SpriteTexture
```

## Basic Usage

### Creating a ComposedTexture

```javascript
// Option 1: Create empty, assign later (recommended for async loading)
const texture = new THREE.ComposedTexture();
await texture.assign(container);

// Option 2: Create with container (assign called automatically, but not awaited)
const texture = new THREE.ComposedTexture(container);
// Note: assign() is async, so texture may not be ready immediately
// Use texture.addEventListener('ready', ...) or check texture.ready
```

**Constructor Parameters:** `(container?, mapping?, wrapS?, wrapT?, magFilter?, minFilter?, format?, type?, anisotropy?)`

### Container Structure

The container object defines the animation data:

```javascript
const container = {
  downscale: false,     // Optional: scale down to power-of-two (default: false = upscale)
  auto: true,           // Optional: handle via global update (default: true)
  autoplay: true,       // Optional: auto-start when ready (default: true)
  width: 512,          // Canvas width
  height: 256,         // Canvas height
  frames: [            // Array of frame objects
    {
      patch: new Uint8Array([...]),  // Uncompressed frame data (alternative to image)
      image: new Image(),            // Image element (alternative to patch)
      dims: {                        // Frame dimensions and position
        left: 0,
        top: 0,
        width: 512,
        height: 256
      },
      disposalType: 0,              // GIF disposal method (0-3)
      delay: 100,                    // Frame delay in milliseconds
      blend: 0                       // Optional: blend mode (0 = replace, 1 = blend)
    }
  ]
};
```

**Important:** Each frame must have either `patch` (Uint8Array) OR `image` (Image element), not both. If `patch` is provided, it will be converted to an Image automatically.

### Loading Formats

#### GIF Loading

Requires [gif.js](https://mevedia.com/share/gif.js):

```javascript
const GIFLoader = function (url, complete) {
  const fileLoader = new THREE.FileLoader();
  fileLoader.responseType = "arraybuffer";
  fileLoader.load(url, async function (data) {
    const gif = new GIF(data);
    const container = {
      downscale: false,
      width: gif.raw.lsd.width,
      height: gif.raw.lsd.height,
      frames: gif.decompressFrames(true),
    };
    complete(container);
  });
};

// Usage
GIFLoader("./animation.gif", async function (container) {
  const texture = new THREE.ComposedTexture(container);
  await texture.assign(container); // Process frames
});
```

#### APNG Loading

Requires [upng.js](https://mevedia.com/share/upng.js):

```javascript
const PNGLoader = function (url, complete) {
  const fileLoader = new THREE.FileLoader();
  fileLoader.responseType = "arraybuffer";
  fileLoader.load(url, async function (data) {
    const png = UPNG.decode(data);
    const frames = [];

    for (let src of png.frames) {
      if (!src.data) continue;

      frames.push({
        dims: {
          left: src.rect.x,
          top: src.rect.y,
          width: src.rect.width,
          height: src.rect.height,
        },
        patch: src.data,
        blend: src.blend,
        delay: src.delay,
        disposalType: src.dispose,
      });
    }

    const container = {
      downscale: false,
      width: png.width,
      height: png.height,
      frames: frames,
    };

    complete(container);
  });
};

// Usage
PNGLoader("./animation.png", async function (container) {
  const texture = new THREE.ComposedTexture(container);
});
```

### Using in Materials

```javascript
const material = new THREE.MeshBasicMaterial({
  map: texture,
  transparent: true,
  alphaTest: 0.1,
  side: THREE.DoubleSide,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

### Animation Control

```javascript
// Start playback (auto-starts if autoplay: true)
texture.play();

// Pause/resume
texture.pause();
texture.resume();

// Stop and reset to first frame
texture.stop();

// Manual frame control
texture.compose(frameIndex);
texture.setFrame(frameIndex);
```

### Animation Loop

Update all ComposedTextures in your render loop:

```javascript
const clock = new THREE.Clock();

function animate() {
  THREE.ComposedTexture.update(clock.getDelta());
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

## ComposedTexture API Reference

### Constructor

```javascript
THREE.ComposedTexture(container?, mapping?, wrapS?, wrapT?, magFilter?, minFilter?, format?, type?, anisotropy?)
```

### Properties

- `autoplay`: Boolean - Auto-start playback when ready (default: true)
- `auto`: Boolean - Handle globally via `THREE.ComposedTexture.update()` (default: true)
- `loop`: Boolean - Loop animation (default: true)
- `ready`: Boolean - True when all frames are processed
- `isPlaying`: Boolean - Current playback state
- `time`: Number - Current time in ms
- `duration`: Number - Total animation duration in ms
- `timeScale`: Number - Playback speed multiplier (default: 1.0)

### Methods

- `assign(container)`: Async - Assign container and process frames
- `update(deltaTime)`: Update animation (called automatically if auto: true)
- `play()`: Start playback (resets to frame 0)
- `pause()`: Pause playback
- `resume()`: Resume playback
- `stop()`: Stop and reset to first frame
- `reset()`: Reset to first frame without stopping (keeps isPlaying state)
- `compose(frameIndex)`: Render specific frame
- `setFrame(frameIndex)`: Set and render specific frame
- `seekFrameIndex(time)`: Find frame index for given time in ms (returns -1 if not found)
- `dispose()`: Clean up resources
- `toSheet(padding?, vertical?, maxResolution?, maxStripResolution?)`: Generate sprite sheet

## SpriteTexture

`SpriteTexture` uses pre-baked sprite sheets for efficient rendering of many instances.

### Creating from ComposedTexture

```javascript
const texture = new THREE.ComposedTexture(container);
await texture.assign(container);

// Generate sprite sheet
const spriteSheet = await texture.toSheet();

// Create SpriteTexture
const spriteTexture = new THREE.SpriteTexture(spriteSheet);
```

### Sprite Sheet Object Structure

```javascript
const spriteSheet = {
  texture: THREE.Texture, // The sprite sheet texture
  source: THREE.Source, // Shared texture source (R138+)
  atlasWidth: number, // Total atlas width
  atlasHeight: number, // Total atlas height
  tileWidth: number, // Frame width including padding
  tileHeight: number, // Frame height including padding
  frameWidth: number, // Frame width without padding
  frameHeight: number, // Frame height without padding
  padding: number, // Padding between frames
  frames: [
    // Frame definitions
    {
      left: number, // X offset in atlas
      top: number, // Y offset in atlas
      delay: number, // Frame delay in ms
    },
  ],
  duration: number, // Total duration
  layout: [columns, rows], // Atlas layout
  autoplay: boolean,
};
```

### Creating from Existing Sprite Sheet

```javascript
const textureLoader = new THREE.TextureLoader();
textureLoader.load("./spritesheet.png", function (texture) {
  const spriteTexture = new THREE.SpriteTexture({
    texture: texture,
    padding: 0,
    columns: 4,
    count: 16,
    delay: 100, // Or provide duration instead
  });
});
```

**Note:** SpriteTexture constructor also accepts standard Three.js texture parameters (mapping, wrapS, wrapT, etc.) but these are typically not needed.

### SpriteTexture API

Same animation interface as ComposedTexture:

- `play()`, `pause()`, `resume()`, `stop()`, `reset()`
- `setFrame(index)`, `compose(index)`, `seekFrameIndex(time)`
- `autoplay`, `loop`, `timeScale` properties
- `update(delta)` for manual control
- `copy(source)`: Copy texture and reset animation state

## Configuration

### Global Settings

```javascript
THREE.ComposedTexture.autoplay = true; // Default autoplay
THREE.ComposedTexture.auto = true; // Global update handling
THREE.ComposedTexture.MaxSpriteSheetResolution = 4096; // Max sprite sheet size
THREE.ComposedTexture.MaxStripResolution = 2048; // Max strip size before atlas
```

## Events

ComposedTexture extends THREE.EventDispatcher and emits:

- `'ready'` - Fired when all frames are processed
- `'dispose'` - Fired when texture is disposed

```javascript
texture.addEventListener("ready", () => {
  console.log("Animation ready to play");
});
```

## Implementation Notes

### Frame Processing

- Frames with `patch` (Uint8Array) are automatically converted to Image elements during `assign()`
- The `assign()` method is async and must be awaited if frames need processing
- Canvas dimensions are automatically adjusted to power-of-two (upscaled by default)

### Animation State

- `ready` property becomes `true` after all frames are processed
- `duration` is calculated automatically from frame delays
- `time` tracks current playback position in milliseconds
- `frameIndex` tracks current frame (0-based)

### Global Update System

- When `auto: true` (default), textures are registered in `THREE.ComposedTexture.index`
- Call `THREE.ComposedTexture.update(delta)` once per frame to update all textures
- Set `auto: false` to manage updates manually per texture

### Texture Sharing (R138+)

- `SpriteTexture` can share GPU texture via `source` property (Three.js R138+)
- Older versions fall back to per-instance textures
- Shared textures reduce memory usage for many instances

## Performance Notes

- Use `SpriteTexture` for many instances of the same animation
- `ComposedTexture` has fixed GPU memory usage (1 frame)
- Sprite sheets reduce draw calls but increase initial load time
- Progressive rendering handles complex frame disposal methods
- Frame composition happens on-demand, not pre-rendered

## Common Implementation Patterns

### Pattern 1: Load and Assign Separately

```javascript
const texture = new THREE.ComposedTexture();
// ... later ...
await texture.assign(container);
```

### Pattern 2: Constructor with Container

```javascript
const texture = new THREE.ComposedTexture(container);
// assign() is called automatically if container provided
```

### Pattern 3: Manual Frame Control

```javascript
texture.auto = false; // Disable automatic updates
// Manually control frames
texture.setFrame(5);
```

### Pattern 4: Multiple Instances with Shared Sprite Sheet

```javascript
const spriteSheet = await composedTexture.toSheet();
const texture1 = new THREE.SpriteTexture(spriteSheet);
const texture2 = new THREE.SpriteTexture(spriteSheet);
// Both share the same GPU texture (R138+)
```

## Troubleshooting

- **Black frames**: Check frame disposal types and progressive rendering
- **Memory issues**: Use sprite sheets for repeated animations
- **Playback speed**: Adjust `timeScale` or check delta time calculations
- **Power-of-two warnings**: Set `downscale: true` or ensure container dimensions are PoT
- **Animation not playing**: Ensure `THREE.ComposedTexture.update(delta)` is called in render loop, or set `auto: false` and call `texture.update(delta)` manually
- **Frames not loading**: Verify container structure matches expected format (width, height, frames array with dims, delay, etc.)
