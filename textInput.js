var BUTTON = "button";
var DIV = "div";
var SPAN = "SPAN";
var BR = "BR";
var A = "A";

var MENU = "menu";
var DROP_ZONE = "dropZone";
var INPUT = "input";
var PILL = "pill";
var ARROW = "arrow";
var OPTION = "option";
var PILL_BUTTON = "pillButton";
var EXAMPLE = "example";

var DATA_OPTION = "data-option";
var DATA_LABEL = "data-label";
var MOVE = "move";
var TEXT = "text";

var DRAG_START = "dragstart";
var DRAG_END = "dragend";
var DRAG_ENTER = "dragenter";
var DRAG_LEAVE = "dragleave";
var DRAG_OVER = "dragover";
var DROP = "drop";
var KEYDOWN = "keydown";
var KEYUP = "keyup";
var CONTEXT_MENU = "contextmenu";
var MOUSE_DOWN = "mousedown";
var MOUSE_MOVE = "mousemove";
var MOUSE_UP = "mouseup";
var CLICK = "click";
var FOCUS = "focus";
var BLUR = "blur";
var COPY = "copy";
var CUT = "cut";

var source, relatedElement, menu;

function Pill(label) {
  var pill = document.createElement(A);
  pill.id = guid();
  pill.draggable = true;
  pill.className = PILL;
  pill.contentEditable = "false";
  pill.setAttribute(DATA_LABEL, label);
  var labelNode = pill.appendChild(document.createElement(SPAN));
  labelNode.textContent = label;
  var arrowNode = pill.appendChild(document.createElement(SPAN));
  arrowNode.className = ARROW;
  this.source = pill;
}

function Menu(owner) {
  var menu = document.body.appendChild(document.createElement(DIV));
  menu.className = MENU;
  menu.appendChild(new MenuOption("min", "min", undefined, owner).source);
  menu.appendChild(new MenuOption("max", "max", undefined, owner).source);
  menu.appendChild(new MenuOption("sum", "sum", undefined, owner).source);
  menu.appendChild(new MenuOption("avg", "average", undefined, owner).source);
  menu.appendChild(new MenuOption("none", undefined, "background:#CCCCCC;", owner).source);
  menu.appendChild(new MenuOption("break", undefined, "background:#ff6600;", owner, function(e) {
    var pill = getAncestor(PILL, owner);
    var container = pill.parentNode;
    var textNode = document.createTextNode(pill.getAttribute(DATA_LABEL));
    container.replaceChild(textNode, pill);
    hideMenu();
    e.stopPropagation();
  }).source);
  this.source = menu;
}

function MenuOption(label, option, style, target, customHandler) {
  var button = document.createElement(BUTTON);
  if(style) {
    button.setAttribute("style", style);
  }
  button.innerHTML = label;
  button.onclick = customHandler || function(e) {
    if (target.firstChild.className == OPTION) {
      target.removeChild(target.firstChild);
    }
    if (option) {
      var optionNode = document.createElement(SPAN);
      optionNode.className = OPTION;
      optionNode.textContent = option + " of ";
      target.insertBefore(optionNode, target.firstChild);
      target.setAttribute(DATA_OPTION, option);
    } else {
      target.removeAttribute(DATA_OPTION);
    }
    hideMenu();
    e.stopPropagation();
  }
  this.source = button;
}

function showMenu(pill) {
  menu = new Menu(pill).source;
  var left = window.pageXOffset || document.body.scrollLeft || document.documentElement.scrollLeft || 0;
  var top = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0;
  var boundingBox = pill.getBoundingClientRect();
  var x = boundingBox.left + boundingBox.width - menu.clientWidth + left;
  var y = boundingBox.top + boundingBox.height + 5 + top;
  menu.style.left = x + "px";
  menu.style.top = y + "px";
}

function hideMenu() {
  if (menu && menu.parentNode) {
    menu.parentNode.removeChild(menu);
    menu = undefined;
  }
}

function displayPillButton(dispatcher) {
  if(!getAncestor(INPUT, dispatcher)) return;
  var range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
  var container = getAncestor(EXAMPLE, dispatcher);
  if (container) {
    var pillButton = container.querySelector("." + PILL_BUTTON);
    pillButton.style.display = range && !range.collapsed? "block" : "none";
    var input = container.querySelector("." + INPUT);
    for (var element = input.firstChild; element != null; element = element.nextSibling) {
      if (element.classList && element.classList.contains(PILL)) {
        element.classList.remove(FOCUS);
      }
    }
  }
  if (range && !range.collapsed) {
    for (var element = range.startContainer; element && element != range.endContainer.nextSibling; element = element.nextSibling) {
      if (element && element.classList && element.classList.contains(PILL)) {
        element.classList.add(FOCUS);
      }
    }
  }
}

function insertAtPosition(elements, x, y) {
  if (!(elements instanceof Array)) {
    elements = [elements];
  }
  var range, node, offset;
  if (document.caretPositionFromPoint) {
    range = document.caretPositionFromPoint(x, y);
    node = range.offsetNode;
    offset = range.offset;
  } else if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
    node = range.startContainer;
    offset = range.startOffset;
  }
  if (node.nodeType == Node.TEXT_NODE) {
    node = node.splitText(range.startOffset);
    var container = node.parentNode;
    elements.forEach(function (element) {
      container.insertBefore(element, node);
    });
  } else {
     elements.forEach(function (element) {
      node.appendChild(element);
    });
  }
}

function insert(elements) {
  if (!(elements instanceof Array)) {
    elements = [elements];
  }
  var range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
  if(range && !range.collapsed) {
    trim(range);
    deleteSelection();
    var range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
  }
  var node = range.startContainer;
  if (node.nodeType == Node.TEXT_NODE) {
    node = node.splitText(range.startOffset);
    var container = node.parentNode;
    elements.forEach(function (element) {
      container.insertBefore(element, node);
    });
  } else {
    if(node.classList.contains(INPUT)) {
       elements.forEach(function (element) {
        node.appendChild(element);
      });
    } else {
      elements.forEach(function (element) {
        container.insertBefore(element, node);
      });
    }
  }
}

function createPill() {
  var range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
  if (range && !range.collapsed && getAncestor(INPUT, range.startContainer) && getAncestor(INPUT, range.endContainer)) {
    var elements = trim(range);
    var insertTarget = range.endContainer.nextSibling;
    var input = getAncestor(INPUT, range.endContainer);
    var label = "";
    elements.forEach(function (element) {
      switch(element.nodeType) {
        case Node.ELEMENT_NODE:
          if (element.classList.contains(PILL)) {
            label += element.getAttribute(DATA_LABEL);
            input.removeChild(element);
          } else {
            label += element.textContent;
            if (element == input) {
              while(input.hasChildNodes()) {
                input.removeChild(input.lastChild);
              }
            }
          }
          break;
        case Node.TEXT_NODE:
          label += element.data;        
          input.removeChild(element);
          break;
      }
    });
    var pill = new Pill(label).source;
    if (insertTarget && input.contains(insertTarget)) {
      input.insertBefore(pill, insertTarget);
    } else {
      input.appendChild(pill);
    }
  }
}

function sanitize(element) {
  element.normalize();
  if (element.hasChildNodes() && element.firstChild.nodeName == BR) {
    element.removeChild(element.firstChild);
  }
}

function trim(range) {
  if (!range) return;
  var startContainer = range.startContainer;
  if (range.startOffset) {
    startContainer = startContainer.splitText(range.startOffset);
    range.setStart(startContainer, 0);
  }
  var endContainer = range.endContainer;
  if (endContainer.nodeType == Node.TEXT_NODE && range.endOffset < endContainer.data.length) {
    endContainer.splitText(range.endOffset);
    range.setEnd(endContainer, endContainer.data.length);
  }
  clearSelection();
  window.getSelection().addRange(range);
  var elements = [];
  for (var element = startContainer; element && element != endContainer.nextSibling; element = element.nextSibling) {
    elements.push(element);
  }
  return elements;
}

function copy(range) {
  var elements = [];
  if (range && getAncestor(INPUT, range.startContainer) && getAncestor(INPUT, range.endContainer)) {
    if(range.startContainer == range.endContainer) {
      switch(range.startContainer.nodeType) {
        case Node.TEXT_NODE:
          var substring = range.startContainer.data.substring(range.startOffset, range.endOffset);
          elements.push(document.createTextNode(substring));
          break;
        case Node.ELEMENT_NODE:
          for (var index = range.startOffset; index < range.endOffset; index++) {
            var node = element.childNodes[index];
            elements.push(node.cloneNode(true));
          }
          break;
      }
    } else {
      for (var node = range.startContainer; node && node != range.endContainer.nextSibling; node = node.nextSibling) {
        switch(node.nodeType) {
          case Node.TEXT_NODE:
            var substring;
            if(node == range.startContainer) {
              substring = node.data.substring(range.startOffset, node.data.length);
            } else if (node == range.endContainer) {
              substring = node.data.substring(0, range.endOffset);
            } else {
              substring = node.data;
            }
            elements.push(document.createTextNode(substring));
            break;
          case Node.ELEMENT_NODE:
            elements.push(node.cloneNode(true));
            break;
        }
      }
    }
    return elements;
  }
  if (range.startOffset) {
    startContainer = startContainer.splitText(range.startOffset);
    range.setStart(startContainer, 0);
  }
  var endContainer = range.endContainer;
  if (endContainer.nodeType == Node.TEXT_NODE && range.endOffset < endContainer.data.length) {
    endContainer.splitText(range.endOffset);
    range.setEnd(endContainer, endContainer.data.length);
  }
  clearSelection();
  window.getSelection().addRange(range);
  var elements = [];
  for (var element = startContainer; element && element != endContainer.nextSibling; element = element.nextSibling) {
    elements.push(element);
  }
  return elements;
}

function deleteSelection() {
  if (window.getSelection) {
    var selection = window.getSelection();
    selection.deleteFromDocument ();
    if (!selection.isCollapsed) {
      selection.getRangeAt(0).deleteContents();
    }
    if (selection.anchorNode) {
      selection.collapse (selection.anchorNode, selection.anchorOffset);
    }
  } else {
    if (document.selection) {
      document.selection.clear();
    }
  }
}

function clearSelection() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

function getAncestor(className, node) {
  var ancestor;
  do {
    if (node.classList && node.classList.contains(className)) {
      ancestor = node;
    }
    node = node.parentNode;
  } while (node && node != document && !ancestor);
  return ancestor;
}

function guid() {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function toArray(obj) {
  return [].map.call(obj, function(element) {
    return element;
  });
};

//Handlers

function dragStartHandler(e) {
  var data = "";
  var range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
  var pill = getAncestor(PILL, e.target);
  if (range && getAncestor(INPUT, range.startContainer) && getAncestor(INPUT, range.endContainer)) {
    var elements = copy(range);
    elements.forEach(function (element) {
      switch(element.nodeType) {
        case Node.TEXT_NODE:
          data += element.data;
          break;
        case Node.ELEMENT_NODE:
          data += element.outerHTML;
          break;
      }
    });
    relatedElement = elements;
    source = getAncestor(INPUT, range.startContainer);
  } else if(pill) {
    data = pill.outerHTML;
    relatedElement = pill;
    source = pill.parentNode;
  }
  if(data.length) {
    e.dataTransfer.effectAllowed = MOVE;
    e.dataTransfer.setData(TEXT, data);
  }
}

function dragEndHandler(e) {
  document.activeElement.blur();
}

function dragEnterHandler(e) {
  var target = e.target;
  if(target.classList && target.classList.contains(DROP_ZONE)) {
    target.classList.add(DRAG_OVER);
    e.preventDefault();
  }
}

function dragLeaveHandler(e) {
  var target = e.target;
  if(target.classList && target.classList.contains(DROP_ZONE)) {
    target.classList.remove(DRAG_OVER);
    e.preventDefault();
  }
}

function dragOverHandler(e) {
  var target = e.target;
  if (target.contenteditable != "true") {
    e.preventDefault();
  }
}

function dropHandler(e) {
  var target = e.target;
  var wrapper = document.createElement(DIV);
  wrapper.innerHTML = e.dataTransfer.getData(TEXT);
  target.classList.remove(DRAG_OVER);
  if (target.classList.contains(DROP_ZONE)) {
    if (target != source) {
      var pills = toArray(wrapper.querySelectorAll("." + PILL));
      pills.forEach(function (pill) {
        target.appendChild(pill);
      });
    }
    e.preventDefault();
  } else if (target.classList.contains(INPUT)) {
    var elements = toArray(wrapper.childNodes);
    if (target != source) {
      elements.forEach(function (element) {
        if (element.id) {
          element.id = guid();
        }  
      });
    } else {
      if(relatedElement.classList && relatedElement.classList.contains(PILL)) {
        relatedElement.parentNode.removeChild(relatedElement);
      }else {
        deleteSelection();
      };
    }
    insertAtPosition(elements, e.clientX, e.clientY);
    e.preventDefault();
  }
  sanitize(target);
  clearSelection();
  e.stopPropagation();
  relatedElement = undefined;
  source = undefined;
}

function keyDownHandler(e) {
  var input = getAncestor(INPUT, e.target);
  if(!input) return;
  switch(e.keyCode) {
    case 8:
      var range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
      if(range && range.collapsed) {
        var target;
        switch(range.startContainer.nodeType) {
          case Node.ELEMENT_NODE:
            target = input.childNodes[range.startOffset - 1];
            if (target) {
              switch(target.nodeName) {
                case BR:
                case A:
                  break;
                default:
                  target = undefined;
                  break;
              }
            }
            break;
          case Node.TEXT_NODE:
            if (!range.startOffset) {
              target = range.startContainer.previousSibling;
            }
            break;
        }
        
      }
  }
  if (target) {
    input.removeChild(target);
    e.preventDefault();
  }
  displayPillButton(input);
}

function keyUpHandler(e) {
  var input = getAncestor(INPUT, e.target);
  if(!input) return;
  displayPillButton(input);
  sanitize(input);
}

function clickHandler(e) {
  if(e.target.classList.contains(PILL_BUTTON)) {
    createPill();
    clearSelection();
    displayPillButton(getAncestor(INPUT, e.target.parentNode.querySelector("." + INPUT)));
  } else {
    var pill = getAncestor(PILL, e.target);
    var input = getAncestor(INPUT, e.target);
    var arrow = e.target.className == ARROW;
    var rightButton = e.which == 3;
    window.setTimeout(displayPillButton, 50, input);
    if(!pill || (!arrow && !rightButton)) return;
    if (e.type == CONTEXT_MENU) e.preventDefault();
    hideMenu();
    showMenu(pill);
  }

}

function mouseDownHandler(e) {
  if (menu && !menu.contains(e.target)) {
    hideMenu();
  }
  document.addEventListener(MOUSE_MOVE, mouseMoveHandler);
  document.addEventListener(MOUSE_UP, mouseUpHandler);
  displayPillButton(e.target);
}

function mouseMoveHandler(e) {
  displayPillButton(e.target);

}

function mouseUpHandler(e) {
  document.removeEventListener(MOUSE_MOVE, mouseMoveHandler);
  document.removeEventListener(MOUSE_UP, mouseUpHandler);
  displayPillButton(e.target);
}

function blurHandler(e) {
  displayPillButton(e.target);
}

function copyHandler(e) {
  var input = getAncestor(INPUT, e.target);
  var range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
  if(input && range && !range.collapsed && getAncestor(INPUT, range.startContainer) && getAncestor(INPUT, range.endContainer)) {
    var elements = copy(range);
    var data = "";
    elements.forEach(function (element) {
      switch(element.nodeType) {
        case Node.TEXT_NODE:
          data += element.data;
          break;
        case Node.ELEMENT_NODE:
          data += element.outerHTML;
          break;
      }
    });
    e.clipboardData.setData(TEXT, data);
    e.preventDefault()
  }
}

function cutHandler(e) {
  copyHandler(e);
  var input = getAncestor(INPUT, e.target);
  var range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
  if(input && range) {
    deleteSelection();
  }
}

function pasteHandler(e) {
  var input = getAncestor(INPUT, e.target);
  if(input) {
    var elements = [];
    var wrapper = document.createElement(DIV);
    wrapper.innerHTML = e.clipboardData.getData(TEXT);
    while(wrapper.hasChildNodes()) {
      elements.push(wrapper.removeChild(wrapper.firstChild));
    }
    insert(elements);
    var range = document.createRange();
    range.setStartAfter(elements[elements.length - 1]);
    clearSelection();
    window.getSelection().addRange(range);
    e.preventDefault()
  }
}