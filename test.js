const toastContainer = document.getElementById("toast-container");
const MAX_VISIBLE_TOASTS = 5;
const TOAST_LIFETIME = 10000; // Default 4 seconds
const TOAST_GAP = 10; // Gap between toasts in the stack (Sonner uses 14px)

// Stacking visual parameters (when not expanded)
const STACK_ITEM_OFFSET_Y = 10; // Vertical offset for each stacked item "behind" the front one
const STACK_ITEM_SCALE_DECREMENT = 0.05;
const STACK_ITEM_OPACITY_DECREMENT = 0.15;


let hoverDebounceTimer; 
/* I added this delay for hover expansion because the stacked and 
unstacked animations goes wild if I hover between the TOAST_GAP */
const HOVER_DEBOUNCE_DELAY = 200;


let toasts = [];
let toastIdCounter = 0;

// --- Toast Creation --- 
function createToastElement(options) {
  const toast = document.createElement("div");
  toast.className = `toast ${options.type ? `toast-${options.type}` : ''}`;
  toast.dataset.toastId = options.id;

  // Main content wrapper (new)
  const mainContent = document.createElement("div");
  mainContent.className = "toast-main-content";

  // Header (new - for icon, title, and timestamp)
  const headerElement = document.createElement("div");
  headerElement.className = "toast-header";

  const titleIconWrapper = document.createElement("div"); // New wrapper for icon and title
  titleIconWrapper.className = "toast-title-icon-wrapper";

  // Icon (modified)
  if (options.icon !== false) {
    const iconElement = document.createElement("div");
    iconElement.className = "toast-icon";
    // Using a simple checkmark SVG for success, as in the image
    if (options.type === 'success' || options.type === 'default') { // Default to success icon for the example
      iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      iconElement.firstChild.style.color = '#10b981'; // Default green for checkmark
    } else if (options.type === 'error') {
      iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-circle"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      iconElement.firstChild.style.color = '#f87171'; // Red
    } else if (options.type === 'warning') {
      iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-triangle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      iconElement.firstChild.style.color = '#facc15'; // Yellow
    } else if (options.type === 'info') {
      iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      iconElement.firstChild.style.color = '#60a5fa'; // Blue
    }
    titleIconWrapper.appendChild(iconElement);
  }

  // Title (modified)
  if (options.title) {
    const titleElement = document.createElement("div");
    titleElement.className = "toast-title";
    titleElement.textContent = options.title;
    titleIconWrapper.appendChild(titleElement);
  }
  headerElement.appendChild(titleIconWrapper);

  // Timestamp (new)
  const timestampElement = document.createElement("div");
  timestampElement.className = "toast-timestamp";
  timestampElement.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  headerElement.appendChild(timestampElement);

  mainContent.appendChild(headerElement);

  // Description (modified)
  if (options.description) {
    const descriptionElement = document.createElement("div");
    descriptionElement.className = "toast-description";
    descriptionElement.textContent = options.description;
    mainContent.appendChild(descriptionElement);
  }
  toast.appendChild(mainContent);

  // Close Button (modified - moved outside mainContent for absolute positioning relative to toast)
  if (options.closable !== false) {
    const closeButton = document.createElement("button");
    closeButton.className = "toast-close-button";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = (e) => {
      e.stopPropagation();
      dismiss(options.id);
    };
    toast.appendChild(closeButton);
  }

  // Click action (optional)
  if (options.onClick) {
    toast.style.cursor = 'pointer';
    // Ensure click is on the main content, not the close button area if it overlaps
    mainContent.addEventListener('click', () => options.onClick(options.id));
  }

  return toast;
}

// --- Toast Management --- 
function showToast(options = {}) {
  const id = toastIdCounter++;
  const mergedOptions = {
    id,
    title: "New Service Request", // Default title from image
    description: "A new service request (ID: SR20240721001) for plot maintenance has been created.", // Default description from image
    type: 'success', // Default type to 'success' to match image icon
    lifetime: TOAST_LIFETIME,
    closable: true,
    icon: true,
    ...options,
  };

  const toastElement = createToastElement(mergedOptions);
  toasts.push({ ...mergedOptions, element: toastElement });

  toastContainer.appendChild(toastElement);
  toastElement.classList.add("entering");

  // Auto-dismiss
  if (mergedOptions.lifetime > 0) {
    const timerId = setTimeout(() => dismiss(id), mergedOptions.lifetime);
    // Store timerId with the toast to clear it if dismissed manually
    const currentToast = toasts.find(t => t.id === id);
    if(currentToast) currentToast.timerId = timerId;
  }
  
  requestAnimationFrame(() => {
    updateToastPositions();
  });
  return id; // Return ID for programmatic control
}

function dismiss(id) {
  const toastIndex = toasts.findIndex(t => t.id === id);
  if (toastIndex === -1) return;

  const toastData = toasts[toastIndex];
  
  // Clear auto-dismiss timer if it exists
  if (toastData.timerId) {
    clearTimeout(toastData.timerId);
  }

  toastData.element.classList.remove("entering");
  toastData.element.classList.add("exiting");

  toastData.element.addEventListener('animationend', () => {
    if (toastData.element.parentNode === toastContainer) {
        toastContainer.removeChild(toastData.element);
    }
    // Remove from array *after* animation and DOM removal
    // to prevent issues if dismiss is called rapidly
    toasts = toasts.filter(t => t.id !== id);
    updateToastPositions(); 
  }, { once: true });

  // Fallback removal if animationend doesn't fire
  setTimeout(() => {
    if (toastData.element.parentNode === toastContainer) {
        toastContainer.removeChild(toastData.element);
    }
    const stillExists = toasts.some(t => t.id === id);
    if (stillExists) {
        toasts = toasts.filter(t => t.id !== id);
        updateToastPositions();
    }
  }, 500); // Should be longer than exit animation
}

// --- Positioning and Stacking --- 
function updateToastPositions() {
  const activeToasts = toasts.filter(t => !t.element.classList.contains('exiting'));

  if (toastContainer.classList.contains('expanded-stack')) {
    // Expanded view: all active toasts are visible and listed vertically
    let cumulativeHeight = 0;
    // Iterate from newest to oldest (visually from bottom to top)
    const reversedActiveToasts = [...activeToasts].reverse(); 

    reversedActiveToasts.forEach((toastData, index) => {
      toastData.element.style.display = ''; // Ensure visible
      toastData.element.style.opacity = '1';
      toastData.element.style.transform = 'scale(1)';
      toastData.element.style.bottom = `${cumulativeHeight}px`;
      toastData.element.style.zIndex = activeToasts.length - index; // Newest has highest z-index in this view
      
      // Ensure element is rendered to get correct offsetHeight
      // This might require a brief delay or relying on transition if height changes.
      // For now, assume offsetHeight is readable.
      cumulativeHeight += toastData.element.offsetHeight + TOAST_GAP;
    });

  } else {
    // Stacked view (Sonner-like)
    const visibleToastsInStack = activeToasts.slice(-MAX_VISIBLE_TOASTS).reverse(); // Newest first

    // Hide toasts not in the immediate visible stack
    activeToasts.forEach(toastData => {
        if (!visibleToastsInStack.includes(toastData)) {
            toastData.element.style.display = 'none';
        } else {
            toastData.element.style.display = ''; // Ensure visible if part of the stack
        }
    });
    
    for (let i = 0; i < visibleToastsInStack.length; i++) {
        const toastData = visibleToastsInStack[i]; // 0 is newest (bottom of visual stack)
        
        toastData.element.style.bottom = `${i * STACK_ITEM_OFFSET_Y}px`;
        toastData.element.style.transform = `scale(${1 - i * STACK_ITEM_SCALE_DECREMENT})`;
        // Front one (i=0) is fully opaque, others fade
        const opacity = (i === 0) ? 1 : Math.max(0.1, 1 - i * STACK_ITEM_OPACITY_DECREMENT);
        toastData.element.style.opacity = opacity;
        toastData.element.style.zIndex = MAX_VISIBLE_TOASTS - i; // Higher zIndex for toasts at the "front" (bottom)
    }
  }
  // Manage container interactivity
  toastContainer.style.pointerEvents = activeToasts.length > 0 ? 'auto' : 'none';
}

// --- Event Listeners for Hover Expansion ---
toastContainer.addEventListener('mouseenter', () => {
  clearTimeout(hoverDebounceTimer); // Clear any pending timeout from mouseleave
  hoverDebounceTimer = setTimeout(() => {
    // Only expand if there are active toasts and not already expanded
    if (toasts.filter(t => !t.element.classList.contains('exiting')).length > 0) {
      if (!toastContainer.classList.contains('expanded-stack')) {
        toastContainer.classList.add('expanded-stack');
        updateToastPositions();
      }
    }
  }, HOVER_DEBOUNCE_DELAY);
});

toastContainer.addEventListener('mouseleave', () => {
  clearTimeout(hoverDebounceTimer); // Clear any pending timeout from mouseenter
  hoverDebounceTimer = setTimeout(() => {
    if (toastContainer.classList.contains('expanded-stack')) {
      toastContainer.classList.remove('expanded-stack');
      updateToastPositions();
    }
  }, HOVER_DEBOUNCE_DELAY);
});

// --- Example Usage (can be called from HTML button or other events) ---
// window.showToast = showToast; // Expose to global scope if button is in HTML

// Example of different toast types:
document.addEventListener('DOMContentLoaded', () => {
    // The button in notification.php will call the global showToast
    // Example:
    // window.showToast = showToast; // Ensure it's global if not already
    // showToast({ title: 'Welcome!', description: 'Hover over the stack to expand.', type: 'info' });
    // setTimeout(() => showToast({ title: 'Another Event', description: 'This is the second toast.', type: 'success' }), 1000);
    // setTimeout(() => showToast({ title: 'Third Toast', description: 'Testing the stack.', type: 'default' }), 2000);
    // setTimeout(() => showToast({ title: 'Fourth Toast', description: 'This one might be hidden initially in stack.', type: 'warning' }), 2500);
});

// Initial call if any toasts were pre-rendered (not typical for this dynamic setup)
updateToastPositions();