document.addEventListener('DOMContentLoaded', () => {

/* ==========================================================================
    1. DOM ELEMENTS & VARIABLES
    ========================================================================== */ 

    // Canvas & Output Elements
    const preview = document.getElementById('previewElement');
    const cssOutput = document.getElementById('css-output');
    const htmlOutput = document.getElementById('html-output');
    const canvasArea = document.getElementById('canvas-area');
    const modalOverlay = document.getElementById('modal-overlay');

    // Dropdowns & Toggles
    const elementSelect = document.getElementById('element-select');
    const bgSelect = document.getElementById('bg-select');

    // Color Pickers & Containers
    const pageBgColor = document.getElementById('page-bg-color');
    const customColorContainer = document.getElementById('custom-color-container');
    const shadowSlider = document.getElementById('shadow-slider');
    const hoverColor = document.getElementById('hover-color');
    const hoverControl = document.getElementById('hover-control');
    const radiusControl = document.getElementById('radius-control');

    // Sliders
    const blurSlider = document.getElementById('blur-slider');
    const opacitySlider = document.getElementById('opacity-slider');
    const radiusSlider = document.getElementById('radius-slider');
    const borderSlider = document.getElementById('border-slider');
    const borderOpacitySlider = document.getElementById('border-opacity-slider');
    const colorPicker = document.getElementById('color-picker');

    // Interaction State
    let isHovered = false; // Tracks if the mouse is over the preview
    let isFocused = false; // NEW: Tracks if the input field is clicked
    
    
/* ==========================================================================
    2. STATE MANAGEMENT (SESSION STORAGE)
    ========================================================================== */
  
    function saveDesignState() {
        try {
            const state = {
                shape: elementSelect.value,
                bg: bgSelect.value,
                bgColor: pageBgColor.value,
                blur: blurSlider.value,
                opacity: opacitySlider.value,
                radius: radiusSlider.value,
                border: borderSlider.value,
                borderOpacity: borderOpacitySlider.value,
                shadow: shadowSlider.value,
                glassColor: colorPicker.value,
                hover: hoverColor.value
            };
            
            // Save to temporary session memory (Workspace behavior)
            sessionStorage.setItem('glassui_saved_state', JSON.stringify(state));

            // The Truth Teller: Print to the console every time it saves successfully
            console.log("💾 Saved current design!", state);
            
        } catch (error) {
            console.error("❌ Save Failed! Error details:", error);
        }
    }

    function loadDesignState() {
        try {
            const savedString = sessionStorage.getItem('glassui_saved_state');
            if (!savedString) return; 

            const state = JSON.parse(savedString);
            
            // 1. Assign the saved memory values to the variables
            if (typeof bgSelect !== 'undefined' && state.bg) bgSelect.value = state.bg;
            if (typeof pageBgColor !== 'undefined' && state.bgColor) pageBgColor.value = state.bgColor;
            if (typeof blurSlider !== 'undefined' && state.blur) blurSlider.value = state.blur;
            if (typeof opacitySlider !== 'undefined' && state.opacity) opacitySlider.value = state.opacity;
            if (typeof radiusSlider !== 'undefined' && state.radius) radiusSlider.value = state.radius;
            if (typeof borderSlider !== 'undefined' && state.border) borderSlider.value = state.border;
            if (typeof borderOpacitySlider !== 'undefined' && state.borderOpacity) borderOpacitySlider.value = state.borderOpacity;
            if (typeof shadowSlider !== 'undefined' && state.shadow) shadowSlider.value = state.shadow;
            if (typeof colorPicker !== 'undefined' && state.glassColor) colorPicker.value = state.glassColor;
            if (typeof hoverColor !== 'undefined' && state.hover) hoverColor.value = state.hover;

            if (state.bg === 'bg-custom' && typeof customColorContainer !== 'undefined') {
                customColorContainer.style.display = 'block';
            }
            
            // 2. Handle Shape Initialization First
            if (typeof elementSelect !== 'undefined' && state.shape) {
                elementSelect.value = state.shape;
                // 'bubbles: true' forces the browser to recognize the change
                elementSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // 3. Prevent Race Condition: Wait for HTML to build, then style it
            setTimeout(() => {
                const allInputs = [
                    bgSelect, pageBgColor, blurSlider, 
                    opacitySlider, radiusSlider, borderSlider, 
                    borderOpacitySlider, shadowSlider, colorPicker, hoverColor
                ];

                allInputs.forEach(input => {
                    if (typeof input !== 'undefined' && input !== null) {
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
                
                console.log("✅ Saved design loaded successfully!");
            }, 50); // 50ms delay

        } catch (error) {
            console.error("❌ Failed to load saved design:", error);
        }
    }
/* ==========================================================================
    3. CORE LOGIC & UI GENERATION
    ========================================================================== */

    // Helper: Convert Hex color to RGB string (e.g., "#ffffff" -> "255, 255, 255")
    function hexToRgb(hex) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }
    // Main Engine: Renders the UI and Code based on inputs
    function updateGlassEffect() {
        // 1. Handle Background Switch
        if (bgSelect.value === 'bg-custom') {
            canvasArea.className = 'canvas-area'; 
            canvasArea.style.background = pageBgColor.value; 
            customColorContainer.style.display = 'block'; 
        } else {
            canvasArea.style.background = ''; // Clear inline styles
            canvasArea.className = `canvas-area ${bgSelect.value}`; // Apply preset class
            customColorContainer.style.display = 'none'; // NEW: Hide the color picker
        }
        // 2. Handle Shape Switch
        preview.className = `glass-element ${elementSelect.value}`;
        
        // Ensure controls are hidden/shown correctly on every single render
        if (typeof radiusControl !== 'undefined') {
            radiusControl.style.display = (elementSelect.value === 'shape-avatar') ? 'none' : 'block';
        }
        if (typeof hoverControl !== 'undefined') {
            hoverControl.style.display = (elementSelect.value === 'shape-button') ? 'flex' : 'none';
        }
        
        // Inject Pure HTML Elements
        if(elementSelect.value === 'shape-button') {
            preview.innerHTML = '<h2>Submit</h2>';
        } else if (elementSelect.value === 'shape-navbar') {
            preview.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 100%; padding: 0 20px; box-sizing: border-box;"><h2 style="margin: 0;">BrandLogo</h2><p style="margin: 0;">Home &nbsp;&nbsp;&nbsp; About &nbsp;&nbsp;&nbsp; Contact</p></div>';
        } else if (elementSelect.value === 'shape-input') {
            preview.innerHTML = '<h2>email@company.com</h2>';
        } else if (elementSelect.value === 'shape-modal') {
            preview.innerHTML = '<div style="padding: 20px; box-sizing: border-box; text-align: center;"><h2 style="margin: 0 0 10px 0; font-size: 1.6rem; letter-spacing: 1px;">Modal Overlay</h2><p style="margin: 0; font-size: 0.95rem; line-height: 1.6; color: rgba(255,255,255,0.9);"> Interrupts the active workflow to capture mandatory user input or display critical system alerts.</p></div>';
        } else if (elementSelect.value === 'shape-sidebar') {
            preview.innerHTML = '<h2>Workspace</h2><p><br>📊 Analytics<br><br>⚙️ Settings<br><br>💳 Billing<br><br>🔌 API Keys</p>';
        } else if (elementSelect.value === 'shape-tooltip') {
            preview.innerHTML = '<div style="padding: 5px; box-sizing: border-box; text-align: center;"><div style="font-weight: 600; margin-bottom: 4px; font-size: 0.95rem;">Tooltip Element</div><div style="font-size: 0.8rem; color: rgba(255,255,255,0.85);"> Brief contextual hints on hover.</div></div>';
        } else if (elementSelect.value === 'shape-avatar') {
            preview.innerHTML = '<h2>JD</h2>';
        } else {
            // Your new Premium Credit Card Design for the default shape!
            preview.innerHTML = `
                <div style="width: 100%; text-align: left; font-size: 0.85rem; letter-spacing: 2px; font-weight: 600; opacity: 0.8;">NEXUS</div>
                <div style="width: 100%; text-align: left; font-size: 1.6rem; letter-spacing: 4px; font-family: monospace; margin-top: 30px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">1234 5678 1234 5678</div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
                    <div style="text-align: left;">
                        <div style="font-size: 0.5rem; opacity: 0.6; letter-spacing: 1px; margin-bottom: 2px;">VALID THRU</div>
                        <div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 8px;">12/28</div>
                        <div style="font-size: 0.95rem; letter-spacing: 1px; text-transform: uppercase;">Alexander Wright</div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.4); margin-right: -18px; z-index: 2;"></div>
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.15); z-index: 1;"></div>
                    </div>
                </div>`;
        }

        // 3. Get Slider Values
        const blur = blurSlider.value;
        const opacity = opacitySlider.value / 100;
        const radius = elementSelect.value === 'shape-avatar' ? '50%' : `${radiusSlider.value}px`; 
        const rgbColor = hexToRgb(colorPicker.value);
        const rgbHoverColor = hexToRgb(hoverColor.value); // NEW
        const borderThickness = borderSlider.value;
        const borderOpacity = borderOpacitySlider.value / 100;

        // Update UI Badges
        document.getElementById('blur-val').textContent = `${blur}px`;
        document.getElementById('opacity-val').textContent = `${opacitySlider.value}%`;
        document.getElementById('radius-val').textContent = radius;
        document.getElementById('color-val').textContent = colorPicker.value;
        if(document.getElementById('hover-color-val')) document.getElementById('hover-color-val').textContent = hoverColor.value;
        document.getElementById('shadow-val').textContent = `${shadowSlider.value}px`; 
        document.getElementById('border-val').textContent = `${borderThickness}px`; 
        document.getElementById('border-opacity-val').textContent = `${borderOpacitySlider.value}%`;

        // 4. Construct CSS Variables
        const baseBgValue = `rgba(${rgbColor}, ${opacity})`;
        const hoverBgValue = `rgba(${rgbHoverColor}, ${opacity + 0.15})`; 
        const blurValue = `blur(${blur}px)`;
        const borderValue = `${borderThickness}px solid rgba(${rgbColor}, ${borderOpacity})`;
        const shadowValue = `0 8px ${shadowSlider.value}px 0 rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)`; 

        // Handle Directional Borders
        let borderCSSOutput = `border: ${borderValue};`; // Default for most shapes
        preview.style.border = borderValue; // Apply default

        if (elementSelect.value === 'shape-navbar') {
            preview.style.border = 'none'; // Clear all sides
            preview.style.borderBottom = borderValue; // Apply bottom only
            borderCSSOutput = `border-bottom: ${borderValue};`;
        } else if (elementSelect.value === 'shape-sidebar') {
            preview.style.border = 'none'; // Clear all sides
            preview.style.borderRight = borderValue; // Apply right only
            borderCSSOutput = `border-right: ${borderValue};`;
        }

        // Apply Hover and Focus States Visually
        if (elementSelect.value === 'shape-button' && isHovered) {
            preview.style.background = hoverBgValue;
            preview.style.transform = 'translateY(-3px)';
            preview.style.cursor = 'pointer';
            preview.style.boxShadow = shadowValue;
        } else if (elementSelect.value === 'shape-input' && isFocused) {
            preview.style.background = baseBgValue;
            preview.style.transform = 'translateY(0)';
            preview.style.cursor = 'text';
            // Adds a glowing white ring on top of the existing shadow
            preview.style.boxShadow = `0 0 0 3px rgba(255, 255, 255, 0.4), ${shadowValue}`; 
        } else {
            // Default State
            preview.style.background = baseBgValue;
            preview.style.transform = 'translateY(0)';
            preview.style.cursor = (elementSelect.value === 'shape-input') ? 'text' : 'default';
            preview.style.boxShadow = shadowValue;
        }
        
        preview.style.backdropFilter = blurValue;
        preview.style.webkitBackdropFilter = blurValue;
        preview.style.borderRadius = radius;

        // 5. Generate Dynamic HTML & Semantic CSS
        let generatedHTML = '';
        let baseClass = 'glass-panel';
        let structuralCSS = ''; 

        // Create specific HTML and semantic class names for all 8 elements
        switch (elementSelect.value) {
            case 'shape-card':
                baseClass = 'glass-card';
                structuralCSS = 'padding: 30px;\n    width: 420px;\n    height: 260px;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    color: white;\n    font-family: sans-serif;';
                generatedHTML = `<div class="${baseClass}">\n    <div style="width: 100%; text-align: left; font-size: 0.85rem; letter-spacing: 2px; font-weight: 600; opacity: 0.8;">NEXUS</div>\n    <div style="width: 100%; text-align: left; font-size: 1.6rem; letter-spacing: 4px; font-family: monospace; margin-top: 30px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">1234 5678 1234 5678</div>\n    <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">\n        <div style="text-align: left;">\n            <div style="font-size: 0.5rem; opacity: 0.6; letter-spacing: 1px; margin-bottom: 2px;">VALID THRU</div>\n            <div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 8px;">12/29</div>\n            <div style="font-size: 0.95rem; letter-spacing: 1px; text-transform: uppercase;">Alexander Wright</div>\n        </div>\n        <div style="display: flex; align-items: center;">\n            <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.4); margin-right: -18px; z-index: 2;"></div>\n            <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.15); z-index: 1;"></div>\n        </div>\n    </div>\n</div>`;
                break;
            case 'shape-button':
                baseClass = 'glass-button';
                structuralCSS = 'padding: 12px 30px;\n    color: white;\n    font-size: 1.1rem;\n    font-weight: 600;\n    font-family: sans-serif;\n    border: none;\n    cursor: pointer;';
                generatedHTML = `<button class="${baseClass}">Submit</button>`;
                break;
            case 'shape-navbar':
                baseClass = 'glass-navbar';
                structuralCSS = 'padding: 15px 30px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    color: white;\n    font-family: sans-serif;\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    box-sizing: border-box;\n    z-index: 100;';
                generatedHTML = `<nav class="${baseClass}">\n    <h2 style="margin: 0;">BrandLogo</h2>\n    <p style="margin: 0;">Home &nbsp;&nbsp;&nbsp; About &nbsp;&nbsp;&nbsp; Contact</p>\n</nav>`;
                break;
            case 'shape-input':
                baseClass = 'glass-input';
                structuralCSS = 'padding: 15px 20px;\n    color: white;\n    font-size: 1rem;\n    font-family: sans-serif;\n    width: 300px;\n    outline: none;';
                generatedHTML = `<input type="text" class="${baseClass}" placeholder="email@company.com" />`;
                break;
            case 'shape-modal':
                baseClass = 'glass-modal';
                structuralCSS = 'padding: 40px;\n    max-width: 450px;\n    color: white;\n    font-family: sans-serif;\n    text-align: center;\n    box-sizing: border-box;';
                generatedHTML = `<div class="${baseClass}">\n    <h2 style="margin-top: 0; font-size: 1.8rem; letter-spacing: 1px;">Modal Overlay</h2>\n    <p style="margin-bottom: 0; font-size: 1rem; line-height: 1.6; color: rgba(255,255,255,0.9);"> Interrupts the active workflow to capture mandatory user input or display critical system alerts.</p>\n</div>`;
                break;
            case 'shape-sidebar':
                baseClass = 'glass-sidebar';
                structuralCSS = 'padding: 30px;\n    width: 250px;\n    height: 100vh;\n    color: white;\n    font-family: sans-serif;\n    position: fixed;\n    top: 0;\n    left: 0;\n    box-sizing: border-box;\n    z-index: 100;';
                generatedHTML = `<aside class="${baseClass}">\n    <h2 style="margin-top: 0;">Workspace</h2>\n    <p style="line-height: 2.5;">📊 Analytics<br>⚙️ Settings<br>💳 Billing<br>🔌 API Keys</p>\n</aside>`;
                break;
            case 'shape-tooltip':
                baseClass = 'glass-tooltip';
                structuralCSS = 'padding: 12px 20px;\n    max-width: 220px;\n    color: white;\n    font-family: sans-serif;\n    text-align: center;\n    box-sizing: border-box;';
                generatedHTML = `<div class="${baseClass}">\n    <div style="font-weight: 600; margin-bottom: 4px; font-size: 1rem;">Tooltip Element</div>\n    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8);"> Brief contextual hints on hover.</div>\n</div>`;
                break;
            case 'shape-avatar':
                baseClass = 'glass-avatar';
                structuralCSS = 'width: 100px;\n    height: 100px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: white;\n    font-family: sans-serif;\n    font-weight: bold;\n    font-size: 2.5rem;\n    border-radius: 50%;\n    border: 2px solid rgba(255,255,255,0.3);\n    text-shadow: 0 2px 4px rgba(0,0,0,0.3);';
                generatedHTML = `<div class="${baseClass}">\n    <h2 style="margin:0;">JD</h2>\n</div>`;
                break;
        }
        
        htmlOutput.value = generatedHTML;

       // 6. Determine Export Background
        let exportBg = '#0f172a'; 
        if (bgSelect.value === 'bg-custom') {
            exportBg = pageBgColor.value; 
        }

        // Generate Code Output (CSS) with auto-injected Body styles
        let generatedCSS = `/* 💡 Glassmorphism requires a background to be visible! */
body {
    background: ${exportBg};
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.${baseClass} {
    /* Structural Layout */
    ${structuralCSS}

    /* Glass Effect */
    background: ${baseBgValue};
    backdrop-filter: ${blurValue};
    -webkit-backdrop-filter: ${blurValue};
    border-radius: ${radius};
    ${borderCSSOutput}
    box-shadow: ${shadowValue};
    transition: all 0.3s ease;
}`;

        // Match the button hover class
        if (elementSelect.value === 'shape-button') {
            generatedCSS += `\n\n/* Button Hover State */\n.${baseClass}:hover {\n    background: ${hoverBgValue};\n    transform: translateY(-3px);\n}`;
        }

        // Match the input focus class
        if (elementSelect.value === 'shape-input') {
            generatedCSS += `\n\n/* Input Focus State */\n.${baseClass}:focus {\n    outline: none;\n    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4), ${shadowValue};\n}`;
        }

        // Match the modal backdrop class
        if (elementSelect.value === 'shape-modal') {
            modalOverlay.classList.add('active');
            generatedCSS += `\n\n/* Modal Backdrop Overlay */\n.glass-modal-backdrop {\n    background: rgba(0, 0, 0, 0.6);\n    backdrop-filter: blur(5px);\n    -webkit-backdrop-filter: blur(5px);\n    position: fixed;\n    top: 0; left: 0; right: 0; bottom: 0;\n    z-index: -1;\n}`;
        } else {
            modalOverlay.classList.remove('active');
        }

        cssOutput.value = generatedCSS;
        // Save to LocalStorage every time the UI updates
        saveDesignState();
    }
/* ==========================================================================
    4. EVENT LISTENERS
    ========================================================================== */
    pageBgColor.addEventListener('input', () => {
        // We removed the forceful 'bg-custom' line so it doesn't overwrite your mesh!
        if (bgSelect.value === 'bg-custom') {
            updateGlassEffect();
        }
    });
    // Event Listeners for all inputs
    [blurSlider, opacitySlider, radiusSlider, borderSlider, borderOpacitySlider, shadowSlider, colorPicker, hoverColor, pageBgColor, elementSelect, bgSelect].forEach(input => {
        input.addEventListener('input', updateGlassEffect);
    });

    // Hover simulation for the preview box
    preview.addEventListener('mouseenter', () => { isHovered = true; updateGlassEffect(); });
    preview.addEventListener('mouseleave', () => { isHovered = false; updateGlassEffect(); });

    // Focus simulation for the input box
    preview.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (elementSelect.value === 'shape-input') {
            isFocused = true;
            updateGlassEffect();
        }
    });

    // Remove focus if user clicks anywhere else on the page
    document.addEventListener('click', () => {
        isFocused = false;
        updateGlassEffect();
    });

/* ==========================================================================
    5. EXPORT / COPY TO CLIPBOARD
    ========================================================================== */

    document.getElementById('copy-btn').addEventListener('click', async () => {
    const btn = document.getElementById('copy-btn');
    const fullCode = `\n${htmlOutput.value}\n\n/* CSS */\n${cssOutput.value}`;

    // 1. Copy to Clipboard
    await navigator.clipboard.writeText(fullCode);

    // 2. Package the data for Python
    const designData = {
        shape: elementSelect.value,
        bg_color: bgSelect.value === 'bg-custom' ? pageBgColor.value : bgSelect.value,
        blur: blurSlider.value,
        opacity: opacitySlider.value,
        css: cssOutput.value
    };

    // 3. Send to Python Server
    /*try {
        const response = await fetch('http://localhost:5000/save-design', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(designData)
        });
        const result = await response.json();
        console.log("Server says:", result);
    } catch (error) {
        console.error("Failed to connect to Python server.", error);
    }*/

    // 4. Update Button UI
    btn.textContent = '✨ Copied & Saved!';
    btn.style.background = '#34d399';
    setTimeout(() => {
        btn.textContent = 'Copy Both to Clipboard';
        btn.style.background = 'white';
    }, 2000);
});
/* ==========================================================================
    6. INITIALIZATION
    ========================================================================== */
    // 1. Defaults & Conditional UI
    elementSelect.addEventListener('change', () => {
        const shape = elementSelect.value;


        // 2. Apply slider defaults
        if (shape === 'shape-button') {
            blurSlider.value = 5; opacitySlider.value = 30; radiusSlider.value = 30; shadowSlider.value = 15; borderSlider.value = 1; borderOpacitySlider.value = 30;
        } else if (shape === 'shape-navbar') {
            blurSlider.value = 15; opacitySlider.value = 40; radiusSlider.value = 0; shadowSlider.value = 10; borderSlider.value = 0;
        } else if (shape === 'shape-modal') {
            blurSlider.value = 25; opacitySlider.value = 15; radiusSlider.value = 24; shadowSlider.value = 50; borderSlider.value = 1;
        } else if (shape === 'shape-input') {
            blurSlider.value = 10; opacitySlider.value = 10; radiusSlider.value = 8; shadowSlider.value = 5; borderSlider.value = 2;
        } else if (shape === 'shape-avatar') {
            blurSlider.value = 15; opacitySlider.value = 20; radiusSlider.value = 50; shadowSlider.value = 20; borderSlider.value = 3;
        }
       
        // Force the visual to update with these new slider values
        updateGlassEffect(); 
    });
    loadDesignState();
    updateGlassEffect();
}); 