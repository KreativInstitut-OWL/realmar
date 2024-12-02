import { ItemFields } from "@/components/ItemFields";
import { AppState, getDefaultItem } from "@/schema";
import { PlusIcon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "./ui/button";

function ItemFieldArray() {
  const form = useFormContext<AppState>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <>
      <ul className="flex flex-col gap-8 items-stretch">
        {fields.length > 0 &&
          fields.map((item, index) => (
            <li key={item.id}>
              <ItemFields
                itemIndex={index}
                onRemove={() => {
                  remove(index);
                }}
              />
            </li>
          ))}
      </ul>
      <div className="mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            append(getDefaultItem());
          }}
        >
          <PlusIcon /> Add item
        </Button>
      </div>
    </>
  );
}

export default ItemFieldArray;
