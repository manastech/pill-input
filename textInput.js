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

var dragSource, dragElement, menu;

function Pill(label) {
  var pill = document.createElement(A);
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

function insertAtPosition(elements, x, y) {
  if (!(elements instanceof Array)) {
    elements = [elements];
  }
  var range = getRangeFromPoint(x, y);
  var node = range.offsetNode || range.startContainer;
  var offset = range.offset || range.startOffset;
  if (node.nodeType == Node.TEXT_NODE) {
    var container = node.parentNode;
    node = node.splitText(offset);
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
  var range = getRange();
  if(range && !range.collapsed) {
    deleteSelection();
    var range = getRange();
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
  var range = getRange();
  if (inputContainsRange(range)) {
    var insertTarget = range.endContainer.nextSibling;
    var elements = toArray(getElementsFromRange(range).childNodes);
    var input = getAncestor(INPUT, range.endContainer);
    var label = "";
    elements.forEach(function (element) {
      switch(element.nodeType) {
        case Node.ELEMENT_NODE:
          if (element.classList.contains(PILL)) {
            label += element.getAttribute(DATA_LABEL);
          } else {
            label += element.textContent;
          }
          break;
        case Node.TEXT_NODE:
          label += element.data;        
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

function inputContainsRange(range) {
  var result = false;
  if(range && !range.collapsed) {
    if(getAncestor(INPUT, range.commonAncestorContainer)) {
      result = true;
    }
  }
  return result;
}

function intersectsRange(node, range) {
  var result = false;
  if(range) {
    result = range.intersectsNode(node);
  }
  return result;
}

function getRange() {
  var range;
  if (window.getSelection) {
    range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
  }
  return range;
}

function getRangeFromPoint(x, y) {
  var range;
  if (document.caretPositionFromPoint) {
    range = document.caretPositionFromPoint(x, y);
  } else if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
  }
  return range;
}

function getElementsFromRange(range, clone) {
  var elements;
  if(clone) {
    elements = range.cloneContents();
  } else {
    elements = range.extractContents();
  }
  return elements;
}

function setSelection(range) {
  window.getSelection().addRange(range);
}

function clearSelection() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

function deleteSelection() {
  if (window.getSelection) {
    var selection = window.getSelection();
    selection.deleteFromDocument();
    if(!selection.isCollapsed) {
      selection.collapseToEnd();
    }
  } else {
    if (document.selection) {
      document.selection.clear();
    }
  }
}

function rectangleIntersetcs(rectangle, x, y) {
  return rectangle.left < x && x < rectangle.right && rectangle.top < y && y < rectangle.bottom;
}

function getAncestor(className, node) {
  var ancestor;
  while (node && node != document && !ancestor) {
    if (node.classList && node.classList.contains(className)) {
      ancestor = node;
    }
    node = node.parentNode;
  };
  return ancestor;
}

function toArray(obj) {
  return [].map.call(obj, function(element) {
    return element;
  });
};

function documentFragmentToString(documentFragment) {
  var string = "";
  toArray(documentFragment.childNodes).forEach(function (element) {
    switch(element.nodeType) {
      case Node.ELEMENT_NODE:
        string += element.outerHTML;
        break;
      case Node.TEXT_NODE:
        string += element.data;
        break;
    }
  });
  return string;
}

//Handlers

function selectHandler(dispatcher) {
  if(!getAncestor(INPUT, dispatcher)) return;
  var range = getRange();
  var rect = range && range.getBoundingClientRect();
  var container = getAncestor(EXAMPLE, dispatcher);
  if (container) {
    var pillButton = container.querySelector("." + PILL_BUTTON);
    pillButton.style.display = range && !range.collapsed? "block" : "none";
    var input = container.querySelector("." + INPUT);
    
  }
  toArray(input.childNodes).forEach(function (element) {
    if(element.nodeType == Node.ELEMENT_NODE) {
      if(range && range.intersectsNode(element) && rect.width) {
        element.classList.add(FOCUS);
      } else if(element.classList.contains(PILL) && range && range.collapsed && !range.startOffset && range.startContainer.previousSibling == element) {
        element.classList.add(FOCUS);
      } else {
        element.classList.remove(FOCUS);
      }
    }
  });
}

function dragStartHandler(e) {
  var range = getRange();
  var pill = getAncestor(PILL, e.target);
  var data;
  if(pill) {
    if(inputContainsRange(range) && intersectsRange(pill, range)) {
      dragElement = getElementsFromRange(range, true);
      dragSource = getAncestor(INPUT, range.commonAncestorContainer);
      data = documentFragmentToString(dragElement);
    } else {
      dragElement = pill;
      dragSource = pill.parentNode;
      data = pill.outerHTML;
    }
  } else if (inputContainsRange(range)) {
    dragElement = getElementsFromRange(range, true);
    dragSource = getAncestor(INPUT, range.commonAncestorContainer);
    data = documentFragmentToString(dragElement);
  }
  if(data) {
    e.dataTransfer.effectAllowed = MOVE;
    e.dataTransfer.setData(TEXT, data);
  }
}

function dragEndHandler(e) {
  document.activeElement.blur();
  dragSource = undefined;
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
  if (target.contenteditable != "true" && !bowser.firefox) {
    e.preventDefault();
  }
}

function dropHandler(e) {
  var target = e.target;
  var wrapper = document.createElement(DIV);
  wrapper.innerHTML = e.dataTransfer.getData(TEXT);
  target.classList.remove(DRAG_OVER);
  if (target.classList.contains(DROP_ZONE)) {
    if (target != dragSource) {
      var pills = toArray(wrapper.querySelectorAll("." + PILL));
      pills.forEach(function (pill) {
        target.appendChild(pill);
      });
    }
  } else if (target.classList.contains(INPUT)) {
    var elements = toArray(wrapper.childNodes);
    insertAtPosition(elements, e.clientX, e.clientY);
    if (target == dragSource) {
      deleteSelection();
      if(dragElement.classList && dragElement.classList.contains(PILL)) {
        dragElement.parentNode.removeChild(dragElement);
      }
    }
  }
  sanitize(target);
  clearSelection();
  e.stopPropagation();
  e.preventDefault();
}

function keyDownHandler(e) {
  var input = getAncestor(INPUT, e.target);
  if(!input) return;
  switch(e.keyCode) {
    case 8:
      var range = getRange();
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
  window.setTimeout(selectHandler, 25, input);
}

function keyUpHandler(e) {
  var input = getAncestor(INPUT, e.target);
  if(!input) return;
  selectHandler(input);
  sanitize(input);
}

function clickHandler(e) {
  if(e.target.classList.contains(PILL_BUTTON)) {
    createPill();
    clearSelection();
    selectHandler(getAncestor(INPUT, e.target.parentNode.querySelector("." + INPUT)));
  } else {
    var pill = getAncestor(PILL, e.target);
    var input = getAncestor(INPUT, e.target);
    var arrow = e.target.className == ARROW;
    var rightButton = e.which == 3;
    selectHandler(input);
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
  selectHandler(e.target);
}

function mouseMoveHandler(e) {
  selectHandler(e.target);

}

function mouseUpHandler(e) {
  document.removeEventListener(MOUSE_MOVE, mouseMoveHandler);
  document.removeEventListener(MOUSE_UP, mouseUpHandler);
  selectHandler(e.target);
}

function blurHandler(e) {
  selectHandler(e.target);
}

function copyHandler(e) {
  var input = getAncestor(INPUT, e.target);
  var range = getRange();
  if(inputContainsRange(range)) {
    var elements = toArray(getElementsFromRange(range, true).childNodes);
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
  var range = getRange();
  if(input && range) {
    deleteSelection();
  }
}

function pasteHandler(e) {
  var input = getAncestor(INPUT, e.target);
  if(input) {
    var wrapper = document.createElement(DIV);
    wrapper.innerHTML = e.clipboardData.getData(TEXT);
    var elements =  toArray(wrapper.childNodes);
    insert(elements);
    var range = document.createRange();
    range.setStartAfter(elements[elements.length - 1]);
    clearSelection();
    setSelection(range);
    selectHandler(input)
    e.preventDefault()
  }
}