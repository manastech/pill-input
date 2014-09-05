var source, contextMenu, selectedRange;

function dragStartHandler(e) {
  source = e.currentTarget.parentNode;
  e.dataTransfer.effectAllowed  = "move";
  e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  e.dataTransfer.setData("text", e.currentTarget.id);
}

function dragEndHandler(e) {
  document.activeElement.blur();
}

function dragEnterHandler(e) {
  e.currentTarget.classList.add("dragover");
  e.preventDefault();
}

function dragLeaveHandler(e) {
  e.currentTarget.classList.remove("dragover");
  e.preventDefault();
}

function dragOverHandler(e) {
  if(e.currentTarget.contenteditable != "true") {
    e.preventDefault();
  }
}

function dropHandler(e) {
  var data = e.dataTransfer.getData("text");
  var target = document.getElementById(data) || e.dataTransfer.getData("text/html");
  if(target.contains && target.contains(e.target)) {
    e.preventDefault();
    return;
  }
  e.currentTarget.classList.remove("dragover");
  switch(e.currentTarget.className) {
    case "dropZone":
      if(e.currentTarget != source && target.nodeType == 1) {
        var clone = target.cloneNode(true);
        clone.id = guid();
        e.currentTarget.appendChild(clone);
      }
      e.preventDefault();
      break;
    default:
      if(e.target.classList.contains("input")) {
        if(e.currentTarget == source) {
          insertAtPosition(target, e.clientX, e.clientY);
          e.preventDefault();
        } else {
          if(target.nodeType) {
            var clone = target.cloneNode(true);
            if(clone.id) {
              clone.id = guid();
            }
            insertAtPosition(clone, e.clientX, e.clientY);
          } else {
            var wrapper = document.createElement("div");
            wrapper.innerHTML = target;
            var elements = [];
            while(wrapper.firstChild) {
              elements.push(wrapper.removeChild(wrapper.firstChild));
            }
            insertAtPosition(elements, e.clientX, e.clientY);
          }
        }
      }
      break;
  }
  e.stopPropagation();
  sanitize(e.currentTarget);
}

function insertAtPosition(elements, x, y) {
  if(!(elements instanceof Array)) {
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
  if (node.nodeType == 3) {
    var container = node.parentNode;
    if(container.classList.contains("input")) {
      node = node.splitText(offset);
      elements.forEach(function (element) {
        if(element.nodeType) {
          container.insertBefore(element, node);
        }
      });
    } else {
      while(container && !container.classList.contains("input")) {
        node = container;
        container = container.parentNode;
      }
      if(container) {
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

function keyDownHandler(e) {
  switch(e.keyCode) {
    case 8:
      var input = e.currentTarget;
      var range = window.getSelection().getRangeAt(0);
      var target;
      switch(range.startContainer.nodeType) {
        case 1:
          target = input.childNodes[range.startOffset - 1];
          if(target) {
            switch(target.nodeName) {
              case "BR":
              case "A":
                break;
              default:
                target = undefined;
                break;
            }
          }
          sanitize(e.currentTarget);
          break;
        case 3:
          if(!range.startOffset) {
            target = range.startContainer.previousSibling;
          }
          break;
      }
  }
  if(target) {
    input.removeChild(target);
    e.preventDefault();
    sanitize(input);
  }
}

function sanitize(element) {
  element.normalize();
  if(element.hasChildNodes() && element.firstChild.nodeName == "BR") {
    element.removeChild(element.firstChild);
  }
}

function keyUpHandler(e) {
  displayPillButton(e.target);
  sanitize(e.currentTarget);
}

function mouseUpHandler(e) {
  displayPillButton(e.target);
}

function blurHandler(e) {
  displayPillButton(e.target);
}

function displayPillButton(dispatcher) {
  var isInput = false;
  var range = window.getSelection().rangeCount? window.getSelection().getRangeAt(0) : undefined;
  var selection = false;
  if(range && !range.collapsed && fromInput(range.startContainer) && fromInput(range.endContainer)) {
    selection = range.startContainer == range.endContainer && range.startOffset == range.endOffset? false : true;
  }
  var container = dispatcher;
  do {
    container = container.parentNode;
  } while(container && !container.classList.contains("example"));
  if(container) {
    var pillButton = container.querySelector("#pillButton");
    pillButton.style.display = selection? "block" : "none";
  }
  selectedRange = selection? range : undefined;
}

function pillButtonClickHandler(e) {
  if(selectedRange) {
    var input = selectedRange.startContainer;
    while(input && (input.nodeType == 3 || !input.classList.contains("input"))) {
      input = input.parentNode;
    }
    var startContainer = selectedRange.startContainer;
    if(selectedRange.startOffset) {
      startContainer = startContainer.splitText(selectedRange.startOffset);
    }
    var endContainer = selectedRange.endContainer;
    if(endContainer.nodeType == 3 && selectedRange.endOffset < endContainer.data.length) {
      endContainer.splitText(selectedRange.endOffset);
    }
    var insertTarget = endContainer.nextSibling;
    var label = "";
    var elements = [];
    for (var element = startContainer; element != endContainer.nextSibling; element = element.nextSibling) {
      switch(element.nodeType) {
        case 1:
          if(element.classList.contains("pill")) {
            label += element.getAttribute("data-label");
          } else {
            label += element.textContent;
          }
          break;
        case 3:
          label += element.data;        
          break;
      }
      elements.push(element);
    }
    elements.forEach(function (element) {
       if(element == input) {
        while(input.hasChildNodes()) {
          input.removeChild(input.lastChild);
        }
      } else {
        input.removeChild(element);
      }
    });
    var pill = createPill(label);
    if(insertTarget && input.contains(insertTarget)) {
      input.insertBefore(pill, insertTarget);
    } else {
      input.appendChild(pill);
    }
  }
}

function fromInput(element) {
  var result = false;
  do {
    result = element.classList && element.classList.contains("input");
    element = element.parentNode;
  } while(!result && element);
  return result;
}

function contextMenuHandler(e) {
  var arrow = e.target.className == "arrow";
  var rightButton = e.which == 3;
  if(e.type == "contextmenu") e.preventDefault();
  if(!arrow && !rightButton) return;
  if(contextMenu && contextMenu.parentNode) {
    contextMenu.parentNode.removeChild(contextMenu);
  }
  contextMenu = document.body.appendChild(document.createElement("div"));
  contextMenu.style.position = "absolute";
  contextMenu.style.backgroundColor = "#cccccc";
  contextMenu.style.border = "1px solid #999999";
  addOption(contextMenu, "Min", "min", e.currentTarget);
  addOption(contextMenu, "Max", "max", e.currentTarget);
  addOption(contextMenu, "Sum", "sum", e.currentTarget);
  addOption(contextMenu, "Average", "average", e.currentTarget);
  addOption(contextMenu, "None", undefined, e.currentTarget);
  addOption(contextMenu, "Break", undefined, e.currentTarget, function() {
    var pill = e.target;
    while(pill && !pill.classList.contains("pill")) {
      pill = pill.parentNode;
    }
    var container = pill.parentNode;
    var textNode = document.createTextNode(pill.getAttribute("data-label"));
    container.replaceChild(textNode, pill);
    closeMenu();
  });
  var left = window.pageXOffset || document.body.scrollLeft || document.documentElement.scrollLeft || 0;
  var top = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0;
  var boundingBox = e.currentTarget.getBoundingClientRect();
  var x = boundingBox.left + boundingBox.width - contextMenu.clientWidth + left;
  var y = boundingBox.top + boundingBox.height + 5 + top;
  contextMenu.style.left = x + "px";
  contextMenu.style.top = y + "px";
  e.stopPropagation();
  document.addEventListener("mousedown", documentMouseDown);
}

function addOption(menu, label, option, target, customHandler) {
  var button = menu.appendChild(document.createElement("button"));
  button.innerHTML = label;
  button.style.display = "block";
  button.style.width = "100%";
  button.onclick = customHandler || function(e) {
    if(target.firstChild.className == "option") {
      target.removeChild(target.firstChild);
    }
    if(option) {
      var optionNode = document.createElement("span");
      optionNode.className = "option";
      optionNode.textContent = option + " of ";
      target.insertBefore(optionNode, target.firstChild);
      target.setAttribute("data-option", option);
    } else {
      target.removeAttribute("data-option");
    }
    closeMenu();
  }
}

function copyHandler(e) {
  e.clipboardData.setData("text/html", "");
  e.preventDefault()
}

function cutHandler(e) {
  e.clipboardData.setData("text/html", "");
  e.preventDefault()
}

function pasteHandler(e) {
  e.clipboardData.getData("text/html");
  e.preventDefault()
}

function closeMenu() {
  if(contextMenu.parentNode) {
    contextMenu.parentNode.removeChild(contextMenu);
  }
}

function documentMouseDown(e) {
  if(!contextMenu.contains(e.target)) {
    closeMenu();
    document.removeEventListener("mousedown", documentMouseDown);
  }
}

function guid() {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}