// Minimal React implementation for basic functionality
window.React = {
  createElement: function(type, props, ...children) {
    if (typeof type === 'function') {
      return type({ ...props, children });
    }
    
    const element = document.createElement(type);
    
    if (props) {
      Object.keys(props).forEach(key => {
        if (key === 'className') {
          element.className = props[key];
        } else if (key === 'style' && typeof props[key] === 'object') {
          Object.assign(element.style, props[key]);
        } else if (key.startsWith('on') && typeof props[key] === 'function') {
          const eventName = key.substring(2).toLowerCase();
          element.addEventListener(eventName, props[key]);
        } else if (key !== 'children') {
          element.setAttribute(key, props[key]);
        }
      });
    }
    
    children.flat().forEach(child => {
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(child));
      } else if (child && child.nodeType) {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  Fragment: function({ children }) {
    const fragment = document.createDocumentFragment();
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          fragment.appendChild(document.createTextNode(child));
        } else if (child && child.nodeType) {
          fragment.appendChild(child);
        }
      });
    }
    return fragment;
  },
  
  useState: function(initialValue) {
    // Static state management for simplicity
    window._reactState = window._reactState || {};
    const stateKey = '_state_' + Date.now() + '_' + Math.random();
    window._reactState[stateKey] = initialValue;
    
    const setValue = (newValue) => {
      window._reactState[stateKey] = typeof newValue === 'function' ? newValue(window._reactState[stateKey]) : newValue;
      // Trigger re-render
      if (window._rerenderApp) window._rerenderApp();
    };
    
    return [window._reactState[stateKey], setValue];
  },
  
  useEffect: function(effect, deps) {
    // Simplified useEffect - just run the effect
    setTimeout(effect, 0);
  }
};

window.ReactDOM = {
  createRoot: function(container) {
    return {
      render: function(element) {
        container.innerHTML = '';
        if (element && element.nodeType) {
          container.appendChild(element);
        }
      }
    };
  }
};