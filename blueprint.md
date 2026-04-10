# Project Blueprint: Mouse Maze Escape

## 1. Overview
A minimalist and visually stunning mouse-controlled maze escape game. The player must navigate their cursor from a "Start" zone to a "Finish" zone while avoiding "Walls". The game emphasizes precision and modern aesthetics.

## 2. Style, Design, and Features

### Visual Identity
-   **Color Palette:** Vibrant `oklch` colors (neon greens for Start, soft purples for Finish, deep navy for Background).
-   **Typography:** Expressive sans-serif (e.g., Inter/Roboto) with varied weights.
-   **Texture:** Subtle noise overlay on the main background for a tactile feel.
-   **Effects:** 
    -   Multi-layered drop shadows for walls to create depth.
    -   "Glow" effect on interactive zones (Start/Finish).
    -   Smooth transitions between levels.

### Features
-   **Core Gameplay:** Mouse cursor movement with wall collision detection.
-   **Levels:** Hand-crafted levels with increasing complexity.
-   **Lives/Attempts:** Tracking how many times the player hits a wall.
-   **Timer:** Displaying time taken for each level.
-   **Victory State:** Celebrating the escape with animations.
-   **Failure State:** Visual feedback when hitting a wall (e.g., screen shake, wall glow).
-   **Responsive Design:** Adapts to different viewport sizes.

## 3. Implementation Plan (Current Task)

### Step 1: Core HTML Structure
- Update `index.html` to include a container for the game, UI overlays (start screen, game over, level clear), and a canvas or DOM-based maze container.

### Step 2: Modern CSS Styling
- Implement global styles in `style.css` using modern CSS (layers, variables, oklch, :has()).
- Add animations for UI transitions and hover states.
- Create the "Noise" texture and background gradients.

### Step 3: Game Engine (main.js)
-   **Level Definition:** Create a data structure to define level layouts.
-   **Maze Rendering:** Build a function to render the maze dynamically (using SVG or DOM elements for better hit-testing).
-   **Input Handling:** Listen for `mousemove`, `mouseenter`, and `mouseleave` events to track the cursor.
-   **Collision Logic:** Detect when the cursor enters a "wall" element or leaves the "path" area.
-   **State Management:** Handle "Wait", "Playing", "Level Complete", "Game Over" states.

### Step 4: Level Design & Feedback
- Create 3 initial levels.
- Add sound-like visual feedback (screenshake, glows).
- Store progress and best times in `localStorage`.

## 4. Verification & Testing
- Test collision accuracy on different screen sizes.
- Verify responsiveness.
- Ensure smooth transitions between levels.
- Accessibility: Ensure keyboard/screen reader users are handled appropriately (even for mouse-heavy games).
