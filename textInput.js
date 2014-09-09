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
var TEXT_HTML = "text/outerHTML";

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

var source, menu, selectedRange;

function createPill(label) {
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
  return pill;
}

function createMenu(owner) {
  var menu = document.body.appendChild(document.createElement(DIV));
  menu.className = MENU;
  menu.appendChild(createOption("min", "min", undefined, owner));
  menu.appendChild(createOption("max", "max", undefined, owner));
  menu.appendChild(createOption("sum", "sum", undefined, owner));
  menu.appendChild(createOption("avg", "average", undefined, owner));
  menu.appendChild(createOption("none", undefined, "background:#CCCCCC;", owner));
  menu.appendChild(createOption("break", undefined, "background:#ff6600;", owner, function(e) {
    var pill = getAncestor(PILL, owner);
    var container = pill.parentNode;
    var textNode = document.createTextNode(pill.getAttribute(DATA_LABEL));
    container.replaceChild(textNode, pill);
    closeMenu();
    e.stopPropagation();
  }));
  return menu
}

function createOption(label, option, style, target, customHandler) {
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
    closeMenu();
    e.stopPropagation();
  }
  return button;
}

function closeMenu() {
  if (menu && menu.parentNode) {
    menu.parentNode.removeChild(menu);
    menu = undefined;
  }
}

function displayPillButton(dispatcher) {
  var range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
  var selection = false;
  if (range && !range.collapsed && getAncestor("input", range.startContainer) && getAncestor("input", range.endContainer)) {
    selection = range.startContainer == range.endContainer && range.startOffset == range.endOffset? false : true;
  }
  var container = getAncestor(EXAMPLE, dispatcher);
  if (container) {
    var pillButton = container.querySelector("#" + PILL_BUTTON);
    pillButton.style.display = selection? "block" : "none";
    var input = container.querySelector("." + INPUT);
    for (var element = input.firstChild; element != null; element = element.nextSibling) {
      if (element.classList && element.classList.contains(PILL)) {
        element.classList.remove(FOCUS);
      }
    }
  }
  selectedRange = selection? range : undefined;
  if (selectedRange) {
    for (var element = selectedRange.startContainer; element && element != selectedRange.endContainer.nextSibling; element = element.nextSibling) {
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
    var container = node.parentNode;
    if (container.classList.contains(INPUT)) {
      node = node.splitText(offset);
      elements.forEach(function (element) {
        if (element.nodeType) {
          container.insertBefore(element, node);
        }
      });
    } else {
      node = getAncestor(PILL, node);
      container = node.parentNode;
      if (container) {
        elements.forEach(function (element) {
          container.insertBefore(element, node);
        });
      }
    }
  } else {
     elements.forEach(function (element) {
      node.appendChild(element);
    });
  }
}

function sanitize(element) {
  element.normalize();
  if (element.hasChildNodes() && element.firstChild.nodeName == BR) {
    element.removeChild(element.firstChild);
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

//Handlers

function dragStartHandler(e) {
  var pill = getAncestor(PILL, e.target);
  if(pill) {
    source = pill.parentNode;
    e.dataTransfer.effectAllowed  = MOVE;
    e.dataTransfer.setData(TEXT_HTML, pill.outerHTML);
    e.dataTransfer.setData(TEXT, pill.id);
  }
}

function dragEndHandler(e) {
  document.activeElement.blur();
}

function dragEnterHandler(e) {
  var target = e.target;
  if(target.classList.contains(DROP_ZONE)) {
    target.classList.add(DRAG_OVER);
    e.preventDefault();
  }
}

function dragLeaveHandler(e) {
  var target = e.target;
  if(target.classList.contains(DROP_ZONE)) {
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
  var data = document.getElementById(e.dataTransfer.getData(TEXT)) || e.dataTransfer.getData(TEXT_HTML);
  target.classList.remove(DRAG_OVER);
  if (!data.nodeType) return;
  if (target.classList.contains(DROP_ZONE)) {
    if (target != source && data.nodeType == Node.ELEMENT_NODE) {
      var clone = data.cloneNode(true);
      clone.id = guid();
      target.appendChild(clone);
    }
    e.preventDefault();
  } else if (target.classList.contains(INPUT)) {
    if (target != source) {
      data = data.cloneNode(true);
      if (data.id) {
        data.id = guid();
      }
    } else {
      e.preventDefault();
    }
    insertAtPosition(data, e.clientX, e.clientY);
  }
  sanitize(target);
  clearSelection();
  e.stopPropagation();
  source = undefined;
}

function keyDownHandler(e) {
  var input = getAncestor(INPUT, e.target);
  if(!input) return;
  switch(e.keyCode) {
    case 8:
      var range = window.getSelection().getRangeAt(0);
      if(range.collapsed) {
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
  if(e.target.id == PILL_BUTTON) {
    if (selectedRange) {
      var startContainer = selectedRange.startContainer;
      if (selectedRange.startOffset) {
        startContainer = startContainer.splitText(selectedRange.startOffset);
      }
      var endContainer = selectedRange.endContainer;
      if (endContainer.nodeType == Node.TEXT_NODE && selectedRange.endOffset < endContainer.data.length) {
        endContainer.splitText(selectedRange.endOffset);
      }
      var insertTarget = endContainer.nextSibling;
      var input = getAncestor(INPUT, startContainer);
      var label = "";
      var elements = [];
      for (var element = startContainer; element && element != endContainer.nextSibling; element = element.nextSibling) {
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
        elements.push(element);
      }
      elements.forEach(function (element) {
         if (element == input) {
          while(input.hasChildNodes()) {
            input.removeChild(input.lastChild);
          }
        } else {
          input.removeChild(element);
        }
      });
      var pill = createPill(label);
      if (insertTarget && input.contains(insertTarget)) {
        input.insertBefore(pill, insertTarget);
      } else {
        input.appendChild(pill);
      }
    }
  } else {
    var pill = getAncestor(PILL, e.target);
    var arrow = e.target.className == ARROW;
    var rightButton = e.which == 3;
    if(!pill || (!arrow && !rightButton)) return;
    if (e.type == CONTEXT_MENU) e.preventDefault();
    closeMenu();
    menu = createMenu(pill);
    var left = window.pageXOffset || document.body.scrollLeft || document.documentElement.scrollLeft || 0;
    var top = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0;
    var boundingBox = pill.getBoundingClientRect();
    var x = boundingBox.left + boundingBox.width - menu.clientWidth + left;
    var y = boundingBox.top + boundingBox.height + 5 + top;
    menu.style.left = x + "px";
    menu.style.top = y + "px";
  }
}

function mouseDownHandler(e) {
  if (menu && !menu.contains(e.target)) {
    closeMenu();
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
  var input = getAncestor("input", e.target);
  if(!input) return;
  e.clipboardData.setData("text/html", "");
  e.preventDefault()
}

function cutHandler(e) {
  var input = getAncestor("input", e.target);
  if(!input) return;
  e.clipboardData.setData("text/html", "");
  e.preventDefault()
}

function pasteHandler(e) {
  var input = getAncestor("input", e.target);
  if(!input) return;
  e.clipboardData.getData("text/html");
  e.preventDefault()
}