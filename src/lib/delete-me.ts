{
  /* <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label={`Reset ${matrixComponent}`}
              onClick={() => {
                switch (matrixComponent) {
                  case "rotation":
                    setItemEntity(item.id, currentEntity.id, {
                      transform: new THREE.Matrix4()
                        .compose(position, new THREE.Quaternion(), scale)
                        .toArray(),
                    });
                    break;
                  case "position":
                    setItemEntity(item.id, currentEntity.id, {
                      transform: new THREE.Matrix4()
                        .compose(new THREE.Vector3(), quaternion, scale)
                        .toArray(),
                    });
                    break;
                  case "scale":
                    setItemEntity(item.id, currentEntity.id, {
                      transform: new THREE.Matrix4()
                        .compose(
                          position,
                          quaternion,
                          new THREE.Vector3(1, 1, 1)
                        )
                        .toArray(),
                    });
                    break;
                }
              }}
            >
              <RotateCcw />
            </Button> */
}

{
  /* <div className="grid grid-cols-6 items-center">
        <Button
          variant="ghost"
          size="icon"
          disabled={!item.entityNavigation.prev}
          onClick={() => {
            setItem(item.id, {
              editorCurrentEntityId: item.entityNavigation.prev?.id,
            });
          }}
        >
          <ChevronLeft />
        </Button>
        <div className="col-span-4 text-center truncate">
          {currentEntityAsset?.file?.name ?? "No asset"} (
          {item.entityNavigation.currentIndex + 1}/{item.entityNavigation.count}
          )
        </div>
        <Button
          className="ml-auto"
          variant="ghost"
          size="icon"
          disabled={!item.entityNavigation.next}
          onClick={() => {
            setItem(item.id, {
              editorCurrentEntityId: item.entityNavigation.next?.id,
            });
          }}
        >
          <ChevronLeft className="transform rotate-180" />
        </Button>
      </div> */
}
{
  /* <Button
        onClick={() => {
          setItemEntity(item.id, currentEntity.id, {
            transform: new THREE.Matrix4().toArray(),
          });
        }}
      >
        Reset Transform
      </Button> */
}
