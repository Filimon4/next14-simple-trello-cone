"use client";

import { useState, useRef, ElementRef } from "react"; 
import { List } from "@prisma/client";
import { useEventListener } from "usehooks-ts";
import { FormInput } from "@/components/form/form-input";
import { useAction } from "@main/hooks/use-action";
import { updateList } from "@main/actions/update-list";
import { toast } from "sonner";
import { ListOptions } from "./list-options";

interface ListHeaderProps {
  data: List;
  onAddCard: () => void;
}

export const ListHeader = ({
  data,
  onAddCard
}: ListHeaderProps) => {
  const [title, setTitle] = useState(data.title);
  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    });
  }

  const disableEditing = () => {
    setIsEditing(false);
  }

  const { execute } = useAction(updateList, {
    onSuccess: (data) => {
      toast.success(`Renamed to ${title}`)
      setTitle(data.title)
      disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    } 
  })

  const handleSubmit = (formatData: FormData) => {
    const title = formatData.get('title') as string;
    const boardId = formatData.get('boardId') as string;
    const id = formatData.get('id') as string;
    
    if (title === data.title) {
      return disableEditing();
    }

    execute({
      title,
      id,
      boardId,
    })
  }

  const onBlur = () => {
    formRef.current?.requestSubmit();
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      formRef.current?.requestSubmit();
    }
  } 

  useEventListener("keydown", onKeyDown);

  return (
    <div className="pt-2 px-2 text-sm font-semibold flex justify-between items-start gap-x-2">
      {isEditing ? (
        <form 
          ref={formRef}
          action={handleSubmit}
          className="flex-1 px-[2px]"
        >
          <input hidden id="id" name="id" value={data.id} />
          <input hidden id="boardId" name="boardId" value={data.boardId} />
          <FormInput
            ref={inputRef}  
            onBlur={onBlur}
            id="title"
            placeholder="Enter list title..."
            defaultValue={title}
            className="text-sm px-[7px] py-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition truncate bg-transparent focus:bg-white"
          />
          <button
            type="submit"
            hidden
          />
        </form>
      ) : (
        <div
          onClick={enableEditing}
          className="w-full text-sm px-2.5 py-1 h-7 font-medium border-transparent"
        >
          {title}
        </div>
      )}
      <ListOptions
        data={data}
        onAddCard={onAddCard}
      />
    </div>
  )
}
