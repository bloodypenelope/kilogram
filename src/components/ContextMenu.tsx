import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type ContextMenuProps = PropsWithChildren<{
  className?: string;
  active: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
}>;

type Position = {
  x: number;
  y: number;
};

const initialPosition: Position = {
  x: 0,
  y: 0,
};

const ContextMenu = memo(
  ({ children, className, active, setActive }: ContextMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState(initialPosition);

    const closeMenu = useCallback(() => {
      setActive(false);
    }, []);

    const closeOnLeave = useCallback(
      (e: MouseEvent) => {
        const rect = menuRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || x > rect.width || y < 0 || y > rect.height) closeMenu();
      },
      [closeMenu],
    );

    const adjustPosition = useCallback((e: MouseEvent) => {
      const rect = menuRef.current?.getBoundingClientRect();

      if (!rect) return;

      let x = e.clientX;
      let y = e.clientY;

      if (x + rect.width > window.innerWidth) x -= rect.width;
      if (y + rect.height > window.innerHeight) y -= rect.height;

      setPosition({ x, y });
    }, []);

    useEffect(() => {
      if (active) {
        const timeoutId = setTimeout(() => {
          window.addEventListener("click", closeMenu);
          window.addEventListener("mousemove", closeOnLeave);
        }, 0);
        window.addEventListener("click", adjustPosition);
        return () => {
          clearTimeout(timeoutId);
          window.removeEventListener("click", closeMenu);
          window.removeEventListener("mousemove", closeOnLeave);
          window.removeEventListener("click", adjustPosition);
        };
      }
    }, [active, closeMenu, closeOnLeave]);

    return (
      <div
        className={`${className} fixed transition ${!active && "invisible opacity-0"} ${active && " visible opacity-100"}`}
        style={{ top: position.y, left: position.x }}
        ref={menuRef}
      >
        {children}
      </div>
    );
  },
);

export default ContextMenu;
