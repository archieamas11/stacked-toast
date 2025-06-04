# Vanilla JS Sonner-Inspired Toast Notifications

This test toast notification system inspired by the popular "shadcn sonner" component, built using only vanilla JavaScript, HTML, and CSS. It aims to replicate some of the core functionalities and visual aesthetics of sonner toasts, such as stacking, hover-to-expand, and different toast types.

## Features

*   **Vanilla JavaScript:** No external libraries or frameworks.
*   **Sonner-Inspired UI:** Clean and modern design.
*   **Toast Types:** Supports different types like 'success', 'error', 'warning', 'info', and 'default', each with a distinct icon.
*   **Stacking:** Multiple toasts stack neatly.
*   **Hover to Expand:** Hovering over the toast container expands the stack to show all active toasts.
*   **Auto-Dismiss:** Toasts automatically disappear after a configurable lifetime.
*   **Manual Close:** Users can dismiss toasts with a close button.
*   **Customizable Content:** Set title and description for each toast.
*   **Click Actions:** Optional `onClick` handler for toasts.
*   **Animated Entry/Exit:** Smooth animations for toast appearance and disappearance.

## Demo
![Demo](assets/demo.gif)

## Planned Feature
*   **Customizable Positioning:** Configure toast container position (top-left, top-right, bottom-left, bottom-right, top-center, bottom-center).
*   **Position-Aware Animations:** Toast animations automatically adjust based on selected position (slide from appropriate direction, stack accordingly).