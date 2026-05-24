import { View } from 'react-native';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';

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

export const toTitleCase = (str: string): string => {
  // Convert the whole string to lowercase first for consistent results
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      // Capitalize the first letter of each word and concatenate with the rest of the word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}