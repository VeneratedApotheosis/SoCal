import { View } from 'react-native';

//Sets a useState (top, left) given a reference for a modal
export const getPositions = (
  buttonRef: React.RefObject<View | null>,
  setMenuPos: React.Dispatch<
    React.SetStateAction<{
      top: number;
      left: number;
    }>
  >,
  menuHeight: number,
  menuWidth: number,
  SCREEN_WIDTH: number,
  SCREEN_HEIGHT: number,
) => {
  buttonRef.current?.measureInWindow((x, y, width, height) => {
    const padding = 10;

    //Vertical Position
    const showAbove = y + height + menuHeight > SCREEN_HEIGHT - padding;
    let top = showAbove ? y - menuHeight : y + height;

    // SAFETY: Don't let it go above the top of the screen (Status Bar)
    // or below the bottom of the screen
    top = Math.max(padding + 40, top); // 40px extra for the notch/status bar
    top = Math.min(top, SCREEN_HEIGHT - menuHeight - padding);

    // --- HORIZONTAL LOGIC (X) ---
    // If the button's pageX is negative (drawer issue), we treat it as 0
    const safeX = Math.max(0, x);

    let left = safeX + width - menuWidth;

    // SAFETY: Don't let it go off the left or right edges
    left = Math.max(padding, left);
    left = Math.min(left, SCREEN_WIDTH - menuWidth - padding);

    setMenuPos({
      top: top,
      left: Math.max(10, left), // Ensure it doesn't go off-screen left
    });
  });
};

export const getPositionsFromPointer = (
  pointerX: number,
  pointerY: number,
  setMenuPos: React.Dispatch<
    React.SetStateAction<{
      top: number;
      left: number;
    }>
  >,
  menuHeight: number,
  menuWidth: number,
  SCREEN_WIDTH: number,
  SCREEN_HEIGHT: number,
) => {
  const padding = 10;

  // --- VERTICAL LOGIC (Y) ---
  // If opening below the pointer clips off-screen, open above it
  const showAbove = pointerY + menuHeight > SCREEN_HEIGHT - padding;
  let top = showAbove ? pointerY - menuHeight : pointerY;

  // SAFETY: Don't let it go above the status bar or below the bottom edge
  top = Math.max(padding + 40, top); // 40px extra for notch/status bar
  top = Math.min(top, SCREEN_HEIGHT - menuHeight - padding);

  // --- HORIZONTAL LOGIC (X) ---
  // If opening to the right of the pointer clips off-screen, shift it to the left
  const showLeft = pointerX + menuWidth > SCREEN_WIDTH - padding;
  let left = showLeft ? pointerX - menuWidth : pointerX;

  // SAFETY: Don't let it go off the left or right edges
  left = Math.max(padding, left);
  left = Math.min(left, SCREEN_WIDTH - menuWidth - padding);

  setMenuPos({
    top: top,
    left: left,
  });
};

export const toTitleCase = (str: string): string => {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      // Capitalize the first letter of each word and concatenate with the rest of the word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};
