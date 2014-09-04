var source, contextMenu;

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
  e.preventDefault();
}

function dropHandler(e) {
  var data = e.dataTransfer.getData("text");
  var target = document.getElementById(data);
  if(target.contains(e.target)) {
    e.preventDefault();
    return;
  }
  e.currentTarget.classList.remove("dragover");
  target.classList.remove("block");
  switch(e.currentTarget.className) {
    case "dropZone":
      var clone = target.cloneNode(true);
      clone.id = guid();
      clone.classList.add("block");
      e.currentTarget.appendChild(clone);
      e.preventDefault();
      break;
    default:
      if(e.target.classList.contains("input")) {
        if(e.currentTarget == source) {
          insertAt(target, e.clientX, e.clientY);
          e.preventDefault();
        } else {
          var clone = target.cloneNode(true);
          clone.id = guid();
          insertAt(clone, e.clientX, e.clientY);
        }
      }
      break;
  }
  e.stopPropagation();
  e.currentTarget.normalize();
}

function insertAt(element, x, y) {
   var range, textNode, offset;
  if (document.caretPositionFromPoint) {
    range = document.caretPositionFromPoint(x, y);
    textNode = range.offsetNode;
    offset = range.offset;
  } else if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
    textNode = range.startContainer;
    offset = range.startOffset;
  }
  if (textNode.nodeType == 3) {
    textNode.parentNode.insertBefore(element, textNode.splitText(offset));
  }
}

function keyDownHandler(e) {
  switch(e.keyCode) {
    case 8:
      var range = window.getSelection().getRangeAt(0);
      var target = range.startContainer;
      if(!range.startOffset && target.className == "pill") {
        target.parentNode.removeChild(target);
        e.preventDefault();
      } else if(!range.startOffset && target.previousSibling && target.previousSibling.className == "pill") {
        target.parentNode.removeChild(target.previousSibling);
        e.preventDefault();
      }
      break;
  }
  e.currentTarget.normalize();
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
    var pill = e.target.parentNode;
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