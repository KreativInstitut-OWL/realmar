// Copyright Mevedia UG - All Rights Reserved
// Author: Fyrestar <info@mevedia.com>
// Release 2

(function (THREE) {
  /* Container, frames can be from any source, their structure is:

	frames
		Either patch or image, if a arraybuffer is provided it will be converted to an Image
		- patch (uncompressed Uint8Array)
		- image (Image element)

		- dims (left, top, width, height)
		- disposalType (number 0-3)
		- delay (number ms)

	*/

  const rev = parseInt(THREE.REVISION);

  const MathUtils = THREE.Math || THREE.MathUtils;
  const Source =
    THREE.Source ||
    function Source(data) {
      this.data = data;
    };

  const Animation = {
    time: 0.0,
    timeScale: 1.0,
    duration: 0.0,
    loop: true,
    auto: true,
    ready: false,
    autoplay: true,
    isPlaying: false,

    seekFrameIndex: function (time) {
      let t = 0.0;

      for (let i = 0, l = this.frames.length; i < l; i++) {
        const frame = this.frames[i];

        if (time >= t && t <= time + frame.delay) return i;

        t += frame.delay;
      }

      return -1;
    },

    pause: function () {
      this.isPlaying = false;

      return this;
    },

    resume: function () {
      this.isPlaying = true;

      return this;
    },

    reset: function () {
      this.time = 0;
      this.frameIndex = 0;
      this.frameTime = 0;

      this.setFrame(this.frameIndex);

      return this;
    },

    play: function () {
      this.time = 0;
      this.frameIndex = 0;
      this.frameTime = 0;
      this.isPlaying = true;

      if (this.auto) {
        const i = THREE.ComposedTexture.index.indexOf(this);
        if (i === -1) THREE.ComposedTexture.index.push(this);
      }

      return this;
    },

    stop: function () {
      this.time = 0;
      this.frameIndex = 0;
      this.frameTime = 0;
      this.isPlaying = false;

      this.setFrame(this.frameIndex);

      if (this.auto) {
        const i = THREE.ComposedTexture.index.indexOf(this);
        if (i > -1) THREE.ComposedTexture.index.splice(i, 1);
      }

      return this;
    },
  };

  function ComposedTexture(
    container,
    mapping,
    wrapS,
    wrapT,
    magFilter,
    minFilter,
    format,
    type,
    anisotropy
  ) {
    this.container = null;
    this.canvas = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "canvas"
    );
    this.ctx = this.canvas.getContext("2d");

    if (container) this.assign(container);

    THREE.CanvasTexture.call(
      this,
      this.canvas,
      mapping,
      wrapS,
      wrapT,
      magFilter,
      minFilter,
      format,
      type,
      anisotropy
    );

    this.version = 0;
  }

  ComposedTexture.auto = true;
  ComposedTexture.autoplay = true;
  ComposedTexture.MaxSpriteSheetResolution = 4096; // May be set by renderer.capabilities.maxTextureSize (recommend default unless needed), sheets going above will be scaled down to it
  ComposedTexture.MaxStripResolution = 2048; // Sprite-sheets below this resolution will be a stripe which is more reasonable for uneven number of frames
  ComposedTexture.copyCanvas = (function () {
    let canvas, ctx;

    return {
      canvas: null,

      dispose: function () {
        this.canvas = canvas = ctx = null;
      },

      dataToImage: async function (data, width, height) {
        if (!canvas) {
          this.canvas = canvas = document.createElementNS(
            "http://www.w3.org/1999/xhtml",
            "canvas"
          );
          ctx = canvas.getContext("2d");
        }

        if (width !== canvas.width || height !== canvas.height) {
          canvas.width = width;
          canvas.height = height;
        }

        const imageData = ctx.getImageData(0, 0, width, height);

        const buffer = imageData.data;

        for (let i = 0, l = buffer.length; i < l; i++) buffer[i] = data[i];

        ctx.putImageData(imageData, 0, 0);

        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);

            const image = new Image();

            image.onload = function () {
              image.onload = null;

              URL.revokeObjectURL(url);

              resolve(image);
            };

            image.src = url;
          }, "image/png");
        });
      },
    };
  })();
  ComposedTexture.index = [];
  ComposedTexture.update = function (delta) {
    for (let texture of this.index) texture.update(delta);
  };

  Object.assign(
    ComposedTexture.prototype,
    THREE.EventDispatcher.prototype,
    THREE.Texture.prototype,
    THREE.CanvasTexture.prototype,
    {
      isCanvasTexture: true,
      isComposedTexture: true,

      constructor: ComposedTexture,

      frameTime: 0,
      frameIndex: 0,
      framePreviousIndex: -1,
      disposalType: 0,
      progressive: false,

      ...Animation,

      autoplay: ComposedTexture.autoplay,

      dispose: function () {
        this.ready = false;
        this.container = this.ctx = this.canvas = null;

        if (this.auto) {
          const i = THREE.ComposedTexture.index.indexOf(this);
          if (i > -1) THREE.ComposedTexture.index.splice(i, 1);
        }

        this.dispatchEvent({ type: "dispose" });
      },

      update: function (delta) {
        if (this.isPlaying) {
          const container = this.container;

          const frame = container.frames[this.frameIndex];

          const t = delta * 1000 * this.timeScale;

          this.frameTime += t;
          this.time = Math.min(this.duration, this.time + t);

          if (this.frameTime >= frame.delay) {
            this.frameTime = 0;

            if (this.frameIndex < container.frames.length - 1) {
              this.frameIndex++;
            } else {
              if (this.loop) {
                this.time = 0;
                this.frameIndex = 0;
              } else {
                this.pause();
              }
            }

            this.compose(this.frameIndex);
          }
        }
      },

      assign: async function (container) {
        this.stop();

        this.auto =
          container.auto !== undefined ? container.auto : ComposedTexture.auto;
        this.duration = 0;
        this.frameIndex = 0;
        this.framePreviousIndex = -1;
        this.disposalType = 0;
        this.progressive = true;
        this.ready = false;
        this.autoplay =
          container.autoplay !== undefined ? container.autoplay : this.autoplay;

        // Auto playback for all textures

        if (this.auto && ComposedTexture.index.indexOf(this) == -1)
          ComposedTexture.index.push(this);

        let { width, height } = container;

        const powerOfTwo = container.downscale
          ? MathUtils.floorPowerOfTwo
          : MathUtils.ceilPowerOfTwo;

        if (!MathUtils.isPowerOfTwo(container.width))
          width = powerOfTwo(container.width);

        if (!MathUtils.isPowerOfTwo(container.height))
          height = powerOfTwo(container.height);

        this.canvas.width = width;
        this.canvas.height = height;

        this.container = container;

        // Process frames

        for (let frame of container.frames) {
          this.duration += frame.delay;

          if (frame.disposalType > 1) this.progressive = false;

          if (!frame.image)
            frame.image = await ComposedTexture.copyCanvas.dataToImage(
              frame.patch,
              frame.dims.width,
              frame.dims.height
            );
        }

        this.ready = true;

        this.dispatchEvent({ type: "ready" });

        if (this.autoplay) this.play();
      },

      setFrame: function (index) {
        this.compose(index);
      },

      // Vertical only relevant if a stripe is used
      // maxResolution - ensures to not generate a texture larger than this, frames will be scaled down to fit
      // maxStripSize - if frames stacked are larger than this, an atlas layout is used instead a strip

      toSheet: async function (
        padding = 0,
        vertical = false,
        maxResolution = ComposedTexture.MaxSpriteSheetResolution,
        maxStripResolution = ComposedTexture.MaxStripResolution
      ) {
        const { container } = this;

        let { width, height } = this.canvas;

        const srcWidth = width;
        const srcHeight = height;

        const frameCount = container.frames.length;

        const canvas = document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "canvas"
        );

        // Layout - either use stripes or atlas layout
        // Atlas on even frame count or if stripde exceeds optimal texture size, however, uneven frames means there can be unsed slots

        let asAtlas =
          frameCount % 2 === 0 ||
          Math.max(
            frameCount * width + frameCount * padding,
            frameCount * height + frameCount * padding
          ) > maxStripResolution;

        const layout = vertical ? [1, frameCount] : [frameCount, 1];

        if (asAtlas) {
          const columns = Math.floor(maxStripResolution / width);
          const rows = Math.ceil(frameCount / columns);

          layout[0] = columns;
          layout[1] = rows;
        }

        // Prevent unreasonable large texture likely not supported by most GPU or any

        let atlasWidth = layout[0] * width + layout[0] * padding;
        let atlasHeight = layout[1] * height + layout[1] * padding;
        let scale = 1.0;

        if (Math.max(atlasWidth, atlasHeight) > maxResolution) {
          scale = maxResolution / Math.max(atlasWidth, atlasHeight);

          atlasWidth = Math.ceil(atlasWidth * scale);
          atlasHeight = Math.ceil(atlasHeight * scale);
        }

        width = Math.floor(width * scale);
        height = Math.floor(height * scale);

        padding = Math.floor(padding * scale); // May degenerate if small and scaled down due maxResolution exceeded as above

        canvas.width = atlasWidth;
        canvas.height = atlasHeight;

        const frames = [];

        const image = new Image();
        const texture = new THREE.Texture();

        texture.needsUpdate = true;

        const source = new Source(image);
        source.needsUpdate = true;

        const frameWidth = width - padding;
        const frameHeight = height - padding;

        const sheet = {
          texture,
          source,
          tileWidth: width,
          tileHeight: height,
          frameWidth,
          frameHeight,
          atlasWidth,
          atlasHeight,
          autoplay: this.autoplay,
          duration: this.duration,
          padding,
          frames,
          layout,
        };

        // Compose sheet

        let ctx = canvas.getContext("2d");

        let x = 0,
          y = 0,
          // row = 0,
          column = 0;

        for (let i = 0; i < frameCount; i++) {
          const frame = container.frames[i];

          this.compose(i);

          ctx.drawImage(
            this.canvas,
            0,
            0,
            srcWidth,
            srcHeight,
            x,
            y,
            frameWidth,
            frameHeight
          );

          frames.push({
            left: x,
            top: y,
            delay: frame.delay,
          });

          if (asAtlas) {
            x += width;

            column++;

            if (column === layout[0]) {
              x = 0;
              y += height;
              // row++;
              column = 0;
            }
          } else {
            vertical ? (y += height) : (x += width);
          }
        }

        ctx = null;

        return new Promise((resolve) => {
          canvas.toBlob(function (blob) {
            image.onload = function () {
              this.onload = null;

              sheet.texture.image = this; // Somehow the Image handle changes

              URL.revokeObjectURL(this.src);

              resolve(sheet);
            };

            image.src = URL.createObjectURL(blob);
          }, "image/png");
        });
      },

      compose: function (frameIndex) {
        if (this.ready) {
          this.frameIndex = frameIndex;

          if (
            this.progressive &&
            (this.framePreviousIndex > frameIndex ||
              this.framePreviousIndex + 1 < frameIndex)
          ) {
            // Needs to re-compose missing frames

            this.ctx.clearRect(0, 0, this.width, this.height);

            for (let i = 0; i <= frameIndex; i++) this._render(i);
          } else if (frameIndex !== this.framePreviousIndex) {
            this._render(frameIndex);
          }

          this.framePreviousIndex = frameIndex;
        } else if (this.idleRender instanceof Function) {
          this.idleRender(this.ctx);
        }
      },

      _render: function (frameIndex) {
        if (frameIndex === 0) this.frameRestoreIndex = -1;

        const { ctx, container, canvas, disposalType } = this;

        const currentFrame = container.frames[frameIndex];
        const dims = currentFrame.dims;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(
          canvas.width / container.width,
          canvas.height / container.height
        );

        if (frameIndex > 0) {
          if (disposalType === 3) {
            // Restore to previous

            if (this.frameRestoreIndex > -1) {
              const restoreFrame = container.frames[this.frameRestoreIndex];
              const dims = restoreFrame.dims;

              if (restoreFrame.blend === 0)
                ctx.clearRect(dims.left, dims.top, dims.width, dims.height);

              ctx.drawImage(
                restoreFrame.image,
                dims.left,
                dims.top,
                dims.width,
                dims.height
              );
            } else {
              // Nothing to restore, clear

              ctx.clearRect(dims.left, dims.top, dims.width, dims.height);
            }
          } else {
            this.frameRestoreIndex = Math.max(frameIndex - 1, 0);
          }

          if (disposalType === 2 && this.frameRestoreIndex > -1) {
            const restoreFrame = container.frames[this.frameRestoreIndex];
            const dims = restoreFrame.dims;

            ctx.clearRect(dims.left, dims.top, dims.width, dims.height);
          }
        }

        if (currentFrame.blend === 0)
          ctx.clearRect(dims.left, dims.top, dims.width, dims.height);

        ctx.drawImage(
          currentFrame.image,
          dims.left,
          dims.top,
          dims.width,
          dims.height
        );

        this.disposalType = currentFrame.disposalType;

        // Flag texture for upload

        this.needsUpdate = true;
        this.version++;
      },
    }
  );

  /* SpriteTexture
	  
	  SpriteTexture uses a sprite-sheet for the displayed frame of the shared spritesheet texture. The texture
	  is only shared since THREE release 138+, since "source" on THREE.Texture is available, otherwise texture per Sprite is used.

	  You may load a ready baked sprite-sheet as well, providing this information.
	  
	  sheet
		- source THREE.Source
		- atlasWidth
		- altasHeight
		- width - frame width ( without padding )
		- height - frame height ( without padding )
		- frameWidth
		- frameHeight
		- frames ( optional )
			- left
			- top
			- delay

		If frames are not provided you can let it define by providing 'rows' and 'columns' as well as 'duration'
		- duration
		- rows
		- columns
		
	 */

  function SpriteTexture(sheet) {
    this.sheet = null;
    this.currentFrame = null;

    THREE.Texture.call(this);

    if (sheet) this.assign(sheet);
  }

  Object.assign(
    SpriteTexture.prototype,
    THREE.EventDispatcher.prototype,
    THREE.Texture.prototype,
    {
      ...Animation,

      autoplay: ComposedTexture.autoplay,

      dispose: function () {
        this.ready = false;

        if (this.auto) {
          const i = THREE.ComposedTexture.index.indexOf(this);
          if (i > -1) THREE.ComposedTexture.index.splice(i, 1);
        }

        this.dispatchEvent({ type: "dispose" });
      },

      copy: function (source) {
        THREE.Texture.prototype.copy.call(this, source);

        this.sheet = source.sheet;
        this.reset();
      },

      setFrame: function (index) {
        const frame = this.sheet.frames[index];

        if (frame) {
          this.time = frame.time;
          this.frameIndex = index;

          this.compose(index);
        }
      },

      assign: function (sheet) {
        this.sheet = sheet;
        this.auto = sheet.auto !== undefined ? sheet.auto : true;
        this.autoplay =
          sheet.autoplay !== undefined
            ? sheet.autoplay
            : ComposedTexture.autoplay;

        // Get frames if not given ( texture, count, columns and duration or delay in ms needs to be provided )

        if (!sheet.frames && sheet.texture && sheet.count && sheet.columns) {
          sheet.rows = Math.ceil(sheet.count / sheet.columns);
          sheet.atlasWidth = sheet.texture.image.width;
          sheet.atlasHeight = sheet.texture.image.height;
          sheet.padding = sheet.padding !== undefined ? sheet.padding : 0;

          sheet.tileWidth = sheet.atlasWidth / sheet.columns;
          sheet.tileHeight = sheet.atlasHeight / sheet.rows;

          sheet.frameWidth = sheet.tileWidth - sheet.padding;
          sheet.frameHeight = sheet.tileHeight - sheet.padding;

          sheet.frames = [];

          const count = sheet.rows * sheet.columns;
          const delay = sheet.duration
            ? sheet.duration / count
            : sheet.delay
              ? sheet.delay
              : 8;

          let c = 0;

          for (let y = 0, l = sheet.rows; y < l; y++)
            for (let x = 0, l = sheet.columns; x < l; x++) {
              sheet.frames.push({
                left: x * sheet.tileWidth,
                top: y * sheet.tileHeight,
                delay,
              });

              c++;
              if (c === sheet.count) break;
            }
        }

        // Get total duration if not defined

        if (!sheet.duration) {
          let duration = 0;

          for (let frame of sheet.frames) duration += frame.delay;

          sheet.duration = duration;
        }

        // Share original spritesheet texture on GPU

        if (sheet.source && rev >= 138) {
          // Requires R38+

          this.ource = sheet.source;
          this.needsUpdate = true;
        } else {
          // Fallback

          this.image = sheet.texture.image;
          this.needsUpdate = true;

          if (rev <= 126) this.version++;
        }

        // Auto playback for all textures

        if (this.auto && THREE.ComposedTexture.index.indexOf(this) == -1)
          THREE.ComposedTexture.index.push(this);

        this.duration = sheet.duration;
        this.ready = true;

        this.compose(0);

        if (this.autoplay) this.play();
      },

      update: function (delta) {
        if (this.isPlaying) {
          const { sheet } = this;

          const frame = sheet.frames[this.frameIndex];

          const t = delta * 1000 * this.timeScale;

          this.frameTime += t;
          this.time = Math.min(this.duration, this.time + t);

          if (this.frameTime >= frame.delay) {
            this.frameTime = 0;

            if (this.frameIndex < sheet.frames.length - 1) {
              this.frameIndex++;
            } else {
              if (this.loop) {
                this.time = 0;
                this.frameIndex = 0;
              } else {
                this.pause();
              }
            }

            this.compose(this.frameIndex);
          }
        }
      },

      compose: function (frameIndex) {
        const frame = this.sheet.frames[frameIndex];

        if (frame) {
          const sheet = this.sheet;

          this.frameIndex = frameIndex;
          this.currentFrame = frame;

          // Frame texture transform update ( using human readable coordinates for universal use )

          this.offset.set(
            frame.left / sheet.atlasWidth,
            1.0 - (frame.top + sheet.tileHeight) / sheet.atlasHeight
          );
          this.repeat.set(
            sheet.tileWidth / sheet.atlasWidth,
            sheet.tileHeight / sheet.atlasHeight
          );
          this.updateMatrix();
        }
      },
    }
  );

  THREE.ComposedTexture = ComposedTexture;
  THREE.SpriteTexture = SpriteTexture;

  // ES6 class fix

  if (rev > 126) {
    class ComposedTexture extends THREE.CanvasTexture {
      constructor(
        container,
        mapping,
        wrapS,
        wrapT,
        magFilter,
        minFilter,
        format,
        type,
        anisotropy
      ) {
        const canvas = document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "canvas"
        );
        const ctx = canvas.getContext("2d");

        super(
          canvas,
          mapping,
          wrapS,
          wrapT,
          magFilter,
          minFilter,
          format,
          type,
          anisotropy
        );

        this.container = null;
        this.canvas = canvas;
        this.ctx = ctx;
        this.version = 0;

        if (container) this.assign(container);
      }
    }

    Object.assign(ComposedTexture, THREE.ComposedTexture);
    Object.assign(ComposedTexture.prototype, THREE.ComposedTexture.prototype);

    THREE.ComposedTexture = ComposedTexture;

    class SpriteTexture extends THREE.Texture {
      constructor(
        sheet,
        mapping,
        wrapS,
        wrapT,
        magFilter,
        minFilter,
        format,
        type,
        anisotropy
      ) {
        super(
          sheet ? sheet.texture.image : null,
          mapping,
          wrapS,
          wrapT,
          magFilter,
          minFilter,
          format,
          type,
          anisotropy
        );

        this.sheet = null;
        this.currentFrame = null;

        if (sheet) this.assign(sheet);
      }
    }

    Object.assign(SpriteTexture, THREE.SpriteTexture);
    Object.assign(SpriteTexture.prototype, THREE.SpriteTexture.prototype);

    THREE.SpriteTexture = SpriteTexture;
  }
})(window.THREE);
