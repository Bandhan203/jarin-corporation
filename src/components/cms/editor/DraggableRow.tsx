import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

const ITEM_TYPE = "CMS_ITEM";

export interface DragItem {
  id: string;
  index: number;
  kind: "section" | "block";
  sectionId?: string;
}

interface DraggableRowProps {
  id: string;
  index: number;
  kind: "section" | "block";
  sectionId?: string;
  selected: boolean;
  onSelect: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onDragEnd?: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function DraggableRow({
  id,
  index,
  kind,
  sectionId,
  selected,
  onSelect,
  onMove,
  onDragEnd,
  children,
  actions,
}: DraggableRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id, index, kind, sectionId } satisfies DragItem,
    end: () => onDragEnd?.(),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item: DragItem, monitor) {
      if (!rowRef.current) return;
      if (item.kind !== kind) return;
      if (kind === "block" && item.sectionId !== sectionId) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverRect = rowRef.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drop(rowRef);
  drag(handleRef);

  return (
    <div
      ref={rowRef}
      className={`flex items-center gap-[8px] px-[12px] py-[10px] border transition-colors ${selected ? "border-[#d4af37] bg-[#f9f6ee]" : "border-neutral-200 hover:border-[#d4af37]/40 bg-white"} ${isDragging ? "opacity-50" : ""}`}
      onClick={onSelect}
    >
      <span
        ref={handleRef}
        className="text-[#9e9e9e] cursor-grab active:cursor-grabbing select-none touch-none px-1"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        ⋮⋮
      </span>
      <div className="flex-1 min-w-0">{children}</div>
      <div onClick={(e) => e.stopPropagation()}>{actions}</div>
    </div>
  );
}

export const CMS_ITEM_DND_TYPE = ITEM_TYPE;
