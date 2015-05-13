(function() {
  var A, ALL, ARROW, BLUR, BR, BUTTON, CLICK, CONTEXT_MENU, COPY, CUT, DATA_OPTION, DIV, DRAG_OVER, DROP, FOCUS, INPUT, KEYDOWN, KEYUP, LINK, MENU, MOUSE_DOWN, MOUSE_MOVE, MOUSE_UP, MOVE, OPTION, PILL, PILL_BUTTON, PillInput, PillInputController, SPAN, TEXT, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BUTTON = "button";

  DIV = "div";

  SPAN = "SPAN";

  BR = "BR";

  A = "A";

  MENU = "menu";

  INPUT = "input";

  PILL = "pill";

  ARROW = "arrow";

  OPTION = "option";

  PILL_BUTTON = "pillButton";

  DATA_OPTION = "data-option";

  MOVE = "move";

  LINK = "link";

  ALL = "all";

  TEXT = "text";

  DRAG_OVER = "dragover";

  DROP = "drop";

  KEYDOWN = "keydown";

  KEYUP = "keyup";

  CONTEXT_MENU = "contextmenu";

  MOUSE_DOWN = "mousedown";

  MOUSE_MOVE = "mousemove";

  MOUSE_UP = "mouseup";

  CLICK = "click";

  FOCUS = "focus";

  BLUR = "blur";

  COPY = "copy";

  CUT = "cut";

  PillInput = (function() {
    function PillInput(dom, options) {
      this.dom = dom;
      this.options = options;
      this.dom.attr('contentEditable', true);
      this.dom.addClass(INPUT);
      this.dom.on('input', (function(_this) {
        return function() {
          return _this.trigger('pillinput:changed');
        };
      })(this));
      if (!this.options.droppedObject) {
        this.options.droppedObject = function() {
          return null;
        };
      }
      this.controller = new PillInputController(this);
      this.safe_html = $('<div/>');
    }

    PillInput.prototype.on = function(eventName, callback) {
      return this.dom.on(eventName, callback);
    };

    PillInput.prototype.trigger = function() {
      return this.dom.trigger.apply(this.dom, arguments);
    };

    PillInput.prototype.value = function(value) {
      if (arguments.length === 1) {
        return this._renderValue(this.dom, value);
      } else {
        return $.map(this.dom.contents(), (function(_this) {
          return function(elem) {
            if (elem.nodeType === Node.TEXT_NODE) {
              return elem.textContent;
            } else {
              return _this.pillData($(elem));
            }
          };
        })(this));
      }
    };

    PillInput.prototype.droppedObject = function() {
      return this.options.droppedObject();
    };

    PillInput.prototype.pillData = function(pillDom, object) {
      if (arguments.length === 1) {
        return pillDom.data('pill-info');
      } else if (arguments.length === 2) {
        return pillDom.attr('data-pill-info', JSON.stringify(object));
      }
    };

    PillInput.prototype.selectedText = function() {
      return this.controller.selectedText();
    };

    PillInput.prototype.replaceSelectedTextWith = function(value) {
      return this.controller.replaceSelectedTextWith(value);
    };

    PillInput.prototype._renderValue = function(domTarget, value) {
      var innerHTML, piece, _i, _len;
      innerHTML = "";
      for (_i = 0, _len = value.length; _i < _len; _i++) {
        piece = value[_i];
        if (typeof piece === "string") {
          innerHTML += this._htmlEscape(piece);
        } else {
          innerHTML += this._renderObject(piece);
        }
      }
      return domTarget.html(innerHTML);
    };

    PillInput.prototype._htmlEscape = function(string) {
      return this.safe_html.text(string).html();
    };

    PillInput.prototype._renderObject = function(object) {
      var pillDom, res;
      pillDom = $("<a/>").addClass(PILL).attr('draggable', true).attr('contentEditable', false);
      this.pillData(pillDom, object);
      this.options.renderPill(object, pillDom);
      res = pillDom[0].outerHTML;
      pillDom.remove();
      return res;
    };

    return PillInput;

  })();

  PillInputController = (function() {
    function PillInputController(pillInput) {
      this.pillInput = pillInput;
      this.pasteHandler = __bind(this.pasteHandler, this);
      this.cutHandler = __bind(this.cutHandler, this);
      this.copyHandler = __bind(this.copyHandler, this);
      this.blurHandler = __bind(this.blurHandler, this);
      this.mouseUpHandler = __bind(this.mouseUpHandler, this);
      this.mouseMoveHandler = __bind(this.mouseMoveHandler, this);
      this.mouseDownHandler = __bind(this.mouseDownHandler, this);
      this.clickHandler = __bind(this.clickHandler, this);
      this.keyUpHandler = __bind(this.keyUpHandler, this);
      this.keyDownHandler = __bind(this.keyDownHandler, this);
      this.dropHandler = __bind(this.dropHandler, this);
      this.dragOverHandler = __bind(this.dragOverHandler, this);
      this.dragLeaveHandler = __bind(this.dragLeaveHandler, this);
      this.dragEnterHandler = __bind(this.dragEnterHandler, this);
      this.dragEndHandler = __bind(this.dragEndHandler, this);
      this.dragStartHandler = __bind(this.dragStartHandler, this);
      this.selectHandler = __bind(this.selectHandler, this);
      this.pillInput.dom.on("dragstart", this.dragStartHandler);
      this.pillInput.dom.on("dragend", this.dragEndHandler);
      this.pillInput.dom.on("dragenter", this.dragEnterHandler);
      this.pillInput.dom.on("dragleave", this.dragLeaveHandler);
      this.pillInput.dom.on("dragover", this.dragOverHandler);
      this.pillInput.dom.on("drop", this.dropHandler);
      this.pillInput.dom.on("keydown", this.keyDownHandler);
      this.pillInput.dom.on("keyup", this.keyUpHandler);
      this.pillInput.dom.on("contextmenu", this.clickHandler);
      this.pillInput.dom.on("click", this.clickHandler);
      this.pillInput.dom.on("mousedown", this.mouseDownHandler);
      this.pillInput.dom.on("blur", this.blurHandler);
      this.pillInput.dom.on("copy", this.copyHandler);
      this.pillInput.dom.on("cut", this.cutHandler);
      this.pillInput.dom.on("paste", this.pasteHandler);
      this.dragElement = null;
      this.dragSource = null;
    }

    PillInputController.prototype.selectedText = function() {
      var elements, input, insertTarget, label, range;
      range = this.getRange();
      if (this.inputContainsRange(range)) {
        insertTarget = range.endContainer.nextSibling;
        elements = this.toArray(this.getElementsFromRange(range, true).childNodes);
        input = this.getAncestor(INPUT, range.endContainer);
        label = "";
        elements.forEach(function(element) {
          switch (element.nodeType) {
            case Node.ELEMENT_NODE:
              return label += element.textContent;
            case Node.TEXT_NODE:
              return label += element.data;
          }
        });
        return label;
      } else {
        return null;
      }
    };

    PillInputController.prototype.replaceSelectedTextWith = function(value) {
      var input, range, wrapper;
      range = this.getRange();
      if (this.inputContainsRange(range)) {
        this.getElementsFromRange(range, false);
        input = this.pillInput.dom[0];
        wrapper = document.createElement(DIV);
        this.pillInput._renderValue($(wrapper), [value]);
        range.insertNode(wrapper.firstChild);
        return this.pillInput.trigger('pillinput:changed');
      }
    };

    PillInputController.prototype.insert = function(elements) {
      var container, node, range;
      if (!(elements instanceof Array)) {
        elements = [elements];
      }
      range = this.getRange();
      if (range && !range.collapsed) {
        this.deleteSelection();
        range = this.getRange();
      }
      node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.splitText(range.startOffset);
        container = node.parentNode;
        return elements.forEach(function(element) {
          container.insertBefore(element, node);
        });
      } else {
        if (node.classList.contains(INPUT)) {
          return elements.forEach(function(element) {
            node.appendChild(element);
          });
        } else {
          return elements.forEach(function(element) {
            container.insertBefore(element, node);
          });
        }
      }
    };

    PillInputController.prototype.insertAtPosition = function(elements, x, y) {
      var container, node, offset, range;
      if (!(elements instanceof Array)) {
        elements = [elements];
      }
      range = this.getRangeFromPoint(x, y);
      node = range.offsetNode || range.startContainer;
      offset = range.offset || range.startOffset;
      if (node.nodeType === Node.TEXT_NODE) {
        container = node.parentNode;
        node = node.splitText(offset);
        return elements.forEach(function(element) {
          container.insertBefore(element, node);
        });
      } else {
        return elements.forEach(function(element) {
          node.appendChild(element);
        });
      }
    };

    PillInputController.prototype.sanitize = function(element) {
      element.normalize();
      if (element.hasChildNodes() && element.firstChild.nodeName === BR) {
        element.removeChild(element.firstChild);
      }
      $('span', $(element)).contents().unwrap();
      return $('*', $(element)).removeAttr('style');
    };

    PillInputController.prototype.inputContainsRange = function(range) {
      var result;
      result = false;
      if (range && !range.collapsed) {
        if (this.getAncestor(INPUT, range.commonAncestorContainer)) {
          result = true;
        }
      }
      return result;
    };

    PillInputController.prototype.intersectsRange = function(node, range) {
      var result;
      result = false;
      if (range) {
        result = range.intersectsNode(node);
      }
      return result;
    };

    PillInputController.prototype.getRange = function() {
      if ((window.getSelection != null) && window.getSelection().rangeCount > 0) {
        return window.getSelection().getRangeAt(0);
      } else {
        return null;
      }
    };

    PillInputController.prototype.getRangeFromPoint = function(x, y) {
      if (document.caretPositionFromPoint) {
        return document.caretPositionFromPoint(x, y);
      } else if (document.caretRangeFromPoint) {
        return document.caretRangeFromPoint(x, y);
      } else {
        return null;
      }
    };

    PillInputController.prototype.getElementsFromRange = function(range, clone) {
      if (clone) {
        return range.cloneContents();
      } else {
        return range.extractContents();
      }
    };

    PillInputController.prototype.setSelection = function(range) {
      return window.getSelection().addRange(range);
    };

    PillInputController.prototype.clearSelection = function() {
      if (window.getSelection) {
        return window.getSelection().removeAllRanges();
      } else {
        if (document.selection) {
          return document.selection.empty();
        }
      }
    };

    PillInputController.prototype.deleteSelection = function() {
      var selection;
      if (window.getSelection) {
        selection = window.getSelection();
        selection.deleteFromDocument();
        if (!selection.isCollapsed) {
          return selection.collapseToEnd();
        }
      } else {
        if (document.selection) {
          return document.selection.clear();
        }
      }
    };

    PillInputController.prototype.getAncestor = function(className, node) {
      var ancestor;
      ancestor = null;
      while (node && node !== document && ancestor === null) {
        if (node.classList && node.classList.contains(className)) {
          ancestor = node;
        }
        node = node.parentNode;
      }
      return ancestor;
    };

    PillInputController.prototype.toArray = function(obj) {
      return [].map.call(obj, function(element) {
        return element;
      });
    };

    PillInputController.prototype.documentFragmentToString = function(documentFragment) {
      var string;
      string = "";
      this.toArray(documentFragment.childNodes).forEach(function(element) {
        switch (element.nodeType) {
          case Node.ELEMENT_NODE:
            return string += element.outerHTML;
          case Node.TEXT_NODE:
            return string += element.data;
        }
      });
      return string;
    };

    PillInputController.prototype.selectHandler = function(dispatcher) {
      var container, input, range, rect;
      if (!this.getAncestor(INPUT, dispatcher)) {
        return;
      }
      range = this.getRange();
      rect = range && range.getBoundingClientRect();
      container = this.getAncestor(INPUT, dispatcher);
      if (container) {
        input = this.pillInput.dom[0];
      }
      return this.toArray(input.childNodes).forEach(function(element) {
        if (element.nodeType === Node.ELEMENT_NODE) {
          if (range && range.intersectsNode(element) && rect.width) {
            element.classList.add(FOCUS);
          } else if (element.classList.contains(PILL) && range && range.collapsed && !range.startOffset && range.startContainer.previousSibling === element) {
            element.classList.add(FOCUS);
          } else {
            element.classList.remove(FOCUS);
          }
        }
      });
    };

    PillInputController.prototype.dragStartHandler = function(e) {
      var data, pill, range;
      range = this.getRange();
      pill = this.getAncestor(PILL, e.target);
      data = null;
      if (pill) {
        if (this.inputContainsRange(range) && this.intersectsRange(pill, range)) {
          this.dragElement = this.getElementsFromRange(range, true);
          this.dragSource = this.getAncestor(INPUT, range.commonAncestorContainer);
          data = this.documentFragmentToString(this.dragElement);
        } else {
          this.dragElement = pill;
          this.dragSource = pill.parentNode;
          data = pill.outerHTML;
          this.pillInput.trigger('pillinput:pilldragstart', {
            pill: this.pillInput.pillData($(pill))
          });
        }
      } else if (this.inputContainsRange(range)) {
        this.dragElement = this.getElementsFromRange(range, true);
        this.dragSource = this.getAncestor(INPUT, range.commonAncestorContainer);
        data = this.documentFragmentToString(this.dragElement);
      }
      if (data) {
        e.originalEvent.dataTransfer.effectAllowed = ALL;
        e.originalEvent.dataTransfer.setData(TEXT, data);
        return e.stopPropagation();
      }
    };

    PillInputController.prototype.dragEndHandler = function(e) {
      return this.dragSource = null;
    };

    PillInputController.prototype.dragEnterHandler = function(e) {
      var target;
      return target = e.target;
    };

    PillInputController.prototype.dragLeaveHandler = function(e) {
      var target;
      return target = e.target;
    };

    PillInputController.prototype.dragOverHandler = function(e) {
      var target;
      target = e.target;
      if (target.contenteditable !== "true" && !bowser.firefox) {
        return e.preventDefault();
      }
    };

    PillInputController.prototype.dropHandler = function(e) {
      var droppedObject, elements, target, wrapper;
      target = e.target;
      wrapper = document.createElement(DIV);
      droppedObject = this.pillInput.droppedObject();
      if (droppedObject) {
        this.pillInput._renderValue($(wrapper), [droppedObject]);
      } else {
        wrapper.innerHTML = e.originalEvent.dataTransfer.getData(TEXT);
      }
      target.classList.remove(DRAG_OVER);
      if (target.classList.contains(INPUT)) {
        elements = this.toArray(wrapper.childNodes);
        this.insertAtPosition(elements, e.originalEvent.clientX, e.originalEvent.clientY);
        if (target === this.dragSource) {
          this.deleteSelection();
          if (this.dragElement.classList && this.dragElement.classList.contains(PILL)) {
            this.dragElement.parentNode.removeChild(this.dragElement);
          }
        }
      }
      this.sanitize(target);
      this.clearSelection();
      this.pillInput.trigger('pillinput:changed');
      return e.preventDefault();
    };

    PillInputController.prototype.keyDownHandler = function(e) {
      var input, range, target;
      input = this.getAncestor(INPUT, e.target);
      if (!input) {
        return;
      }
      switch (e.keyCode) {
        case 8:
          range = this.getRange();
          if (range && range.collapsed) {
            target = null;
            switch (range.startContainer.nodeType) {
              case Node.ELEMENT_NODE:
                target = input.childNodes[range.startOffset - 1];
                if (target) {
                  switch (target.nodeName) {
                    case BR:
                    case A:
                      break;
                    default:
                      target = null;
                  }
                }
                break;
              case Node.TEXT_NODE:
                if (!range.startOffset) {
                  target = range.startContainer.previousSibling;
                }
            }
          }
      }
      if (target) {
        input.removeChild(target);
        e.preventDefault();
      }
      return window.setTimeout(this.selectHandler, 25, input);
    };

    PillInputController.prototype.keyUpHandler = function(e) {
      var input;
      input = this.getAncestor(INPUT, e.target);
      if (!input) {
        return;
      }
      this.selectHandler(input);
      this.sanitize(input);
      return this.pillInput.trigger('pillinput:changed');
    };

    PillInputController.prototype.clickHandler = function(e) {
      var arrow, input, pill, rightButton;
      pill = this.getAncestor(PILL, e.target);
      input = this.getAncestor(INPUT, e.target);
      arrow = e.target.className === ARROW;
      rightButton = e.which === 3;
      this.selectHandler(input);
      if (!pill || (!arrow && !rightButton)) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      return this.pillInput.trigger('pillinput:pillclick', {
        pill: this.pillInput.pillData($(pill)),
        dom: $(pill)
      });
    };

    PillInputController.prototype.mouseDownHandler = function(e) {
      this.pillInput.dom.on(MOUSE_MOVE, this.mouseMoveHandler);
      this.pillInput.dom.on(MOUSE_UP, this.mouseUpHandler);
      return this.selectHandler(e.target);
    };

    PillInputController.prototype.mouseMoveHandler = function(e) {
      return this.selectHandler(e.target);
    };

    PillInputController.prototype.mouseUpHandler = function(e) {
      this.pillInput.dom.off(MOUSE_MOVE);
      this.pillInput.dom.off(MOUSE_UP);
      this.selectHandler(e.target);
      return this.pillInput.trigger('pillinput:selection');
    };

    PillInputController.prototype.blurHandler = function(e) {
      return this.selectHandler(e.target);
    };

    PillInputController.prototype.copyHandler = function(e) {
      var data, elements, input, range;
      input = this.getAncestor(INPUT, e.target);
      range = this.getRange();
      if (this.inputContainsRange(range)) {
        elements = this.toArray(this.getElementsFromRange(range, true).childNodes);
        data = "";
        elements.forEach(function(element) {
          switch (element.nodeType) {
            case Node.TEXT_NODE:
              return data += element.data;
            case Node.ELEMENT_NODE:
              return data += element.outerHTML;
          }
        });
        e.originalEvent.clipboardData.setData(TEXT, data);
        return e.preventDefault();
      }
    };

    PillInputController.prototype.cutHandler = function(e) {
      var input, range;
      this.copyHandler(e);
      input = this.getAncestor(INPUT, e.target);
      range = this.getRange();
      if (input && range) {
        return this.deleteSelection();
      }
    };

    PillInputController.prototype.pasteHandler = function(e) {
      var elements, input, range, wrapper;
      input = this.getAncestor(INPUT, e.target);
      if (input) {
        wrapper = document.createElement(DIV);
        wrapper.innerHTML = e.originalEvent.clipboardData.getData(TEXT).replace(/\r?\n/g, ' ');
        elements = this.toArray(wrapper.childNodes);
        this.insert(elements);
        range = document.createRange();
        range.setStartAfter(elements[elements.length - 1]);
        this.clearSelection();
        this.setSelection(range);
        this.selectHandler(input);
        e.preventDefault();
        return this.pillInput.trigger('pillinput:changed');
      }
    };

    return PillInputController;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.PillInput = PillInput;

}).call(this);
