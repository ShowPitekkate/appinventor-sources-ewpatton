/**
 * @fileoverview The class representing one miniworkspace.
 */

'use strict';

goog.provide('Blockly.MiniWorkspace');
goog.require('Blockly.Workspace');
goog.require('Blockly.ScrollbarPair');


/**
 * Class for a mini workspace. 
 * @extends {Blockly.Workspace}
 * @constructor
 */
Blockly.MiniWorkspace = function(folder, getMetrics, setMetrics) {
    Blockly.MiniWorkspace.superClass_.constructor.call(this, getMetrics, setMetrics);

    this.block_ = folder;
    this.svgGroup_ = null;
    this.svgBlockCanvas_ = null;
    this.svgMiniWorkspaceCanvas_ = null;
    this.svgBubbleCanvas_ = null;
    this.svgGroupBack_ = null;
    this.svgPlaceholder_ = null;
    this.isMW = true;
};

goog.inherits(Blockly.MiniWorkspace, Blockly.Workspace);

Blockly.MiniWorkspace.DEFAULT_HEIGHT = 200;
Blockly.MiniWorkspace.DEFAULT_WIDTH = 250;

Blockly.MiniWorkspace.prototype.rendered_ = false;
Blockly.MiniWorkspace.prototype.scrollbar_ = true;

Blockly.MiniWorkspace.prototype.width_ = Blockly.MiniWorkspace.DEFAULT_WIDTH;
Blockly.MiniWorkspace.prototype.height_ = Blockly.MiniWorkspace.DEFAULT_HEIGHT;

Blockly.MiniWorkspace.prototype.autoLayout_ = true;

/**
 * Return an object with all the metrics required to size scrollbars for this
 *  miniworkspace.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the content,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .viewLeft: Offset of left edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate.
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of this miniworkspace.
 * @private
 */
Blockly.MiniWorkspace.getWorkspaceMetrics_ = function () {
    var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
    //We don't use Blockly.Toolbox in our version of Blockly instead we use drawer.js
    //svgSize.width -= Blockly.Toolbox.width;  // Zero if no Toolbox.
    var viewWidth = this.width_ - doubleBorderWidth;
    var viewHeight = this.height_ - doubleBorderWidth;
    try {
        var blockBox = this.getCanvas().getBBox();
    } catch (e) {
        // Firefox has trouble with hidden elements (Bug 528969).
        return null;
    }
    if (this.scrollbar_) {
        // Add a border around the content that is at least half a screenful wide.
        // Ensure border is wide enough that blocks can scroll over entire screen.
        var leftEdge = Math.min(blockBox.x - viewWidth / 2,
            blockBox.x + blockBox.width - viewWidth);
        var rightEdge = Math.max(blockBox.x + blockBox.width + viewWidth / 2,
            blockBox.x + viewWidth);
        var topEdge = Math.min(blockBox.y - viewHeight / 2,
            blockBox.y + blockBox.height - viewHeight);
        var bottomEdge = Math.max(blockBox.y + blockBox.height + viewHeight / 2,
            blockBox.y + viewHeight);
    } else {
        var leftEdge = blockBox.x;
        var rightEdge = leftEdge + blockBox.width;
        var topEdge = blockBox.y;
        var bottomEdge = topEdge + blockBox.height;
    }
    //We don't use Blockly.Toolbox in our version of Blockly instead we use drawer.js
    //var absoluteLeft = Blockly.RTL ? 0 : Blockly.Toolbox.width;
    var absoluteLeft = Blockly.RTL ? 0 : 0;
    var metrics = {
        viewHeight: viewHeight,
        viewWidth: viewWidth,
        contentHeight: bottomEdge - topEdge,
        contentWidth: rightEdge - leftEdge,
        viewTop: -this.scrollY,
        viewLeft: -this.scrollX,
        contentTop: topEdge,
        contentLeft: leftEdge,
        absoluteTop: 0,
        absoluteLeft: absoluteLeft
    };
    return metrics;
};

/**
 * Sets the X/Y translations of this miniworkspace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 */
Blockly.MiniWorkspace.setWorkspaceMetrics_ = function(xyRatio) {
    if (!this.scrollbar) {
        throw 'Attempt to set mini workspace scroll without scrollbars.';
    }
    var metrics = this.getMetrics();
    if (goog.isNumber(xyRatio.x)) {
        this.scrollX = -metrics.contentWidth * xyRatio.x -
        metrics.contentLeft;
    }
    if (goog.isNumber(xyRatio.y)) {
        this.scrollY = -metrics.contentHeight * xyRatio.y -
        metrics.contentTop;
    }
    var translation = 'translate(' +
        (this.scrollX + metrics.absoluteLeft) + ',' +
        (this.scrollY + metrics.absoluteTop) + ')';
    var inverseTranslation = 'translate(' +
        (-(this.scrollX + metrics.absoluteLeft)) + ',' +
        (-(this.scrollY + metrics.absoluteTop)) + ')';
    this.getCanvas().setAttribute('transform', translation);
    this.getBubbleCanvas().setAttribute('transform',
        translation);
};

/**
 * Create the DOM of this miniworkspace.
 * @return {!Object} The miniworkspace's SVG group and the placeholder.
 * @private
 */
Blockly.MiniWorkspace.prototype.createDom_ = function () {
    this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
    // Binds the on resize method
    Blockly.bindEvent_(this.svgGroup_, 'resize', this, this.onResize_);

    var svgGroupEmboss = Blockly.createSvgElement('g',
        {'filter': 'url(#blocklyEmboss)'}, this.svgGroup_);


    this.svgBlockCanvasOuter_ = Blockly.createSvgElement('svg', 
        {'height': Blockly.MiniWorkspace.DEFAULT_HEIGHT +'px', 'width': Blockly.MiniWorkspace.DEFAULT_WIDTH+'px'}, this.svgGroup_);
    
    this.svgBlockCanvas_ = Blockly.createSvgElement('g', {}, this.svgBlockCanvasOuter_);
    // Binds an event handles to the 'blocklyWorkspaceChange' event to prevent the propagation
    // SEE
    Blockly.bindEvent_(this.svgBlockCanvas_, 'blocklyWorkspaceChange', this,
      function(e) {
        e.stopPropagation();
    });

    this.svgBubbleCanvas_ = Blockly.createSvgElement('g', {'height': '100%', 'width': '100%'}, this.svgBlockCanvasOuter_);
    this.svgGroupBack_ = Blockly.createSvgElement('rect',
        {'class': 'blocklyDraggable', 'x': 0, 'y': 0,
            'rx': Blockly.Bubble.BORDER_WIDTH, 'ry': Blockly.Bubble.BORDER_WIDTH},
        svgGroupEmboss);
    this.svgBlockCanvasOuterBack_ = Blockly.createSvgElement('rect',
        {'class':'blocklyMutatorBackground',
            'height': Blockly.MiniWorkspace.DEFAULT_HEIGHT +'px', 'width': Blockly.MiniWorkspace.DEFAULT_WIDTH+'px'}, svgGroupEmboss);
    Blockly.bindEvent_(this.svgBlockCanvasOuterBack_, 'mousedown', this, this.miniWorkspaceMouseDown_);

    // Create the element that contains the name of the folder
    this.svgTitle_ = Blockly.createSvgElement('text',{
        'class':'blocklyText'},this.svgGroup_);
    this.svgTitle_.innerHTML = this.block_.getFolderName();

    // Button to collapse the miniworkspace 
    this.iconGroup_ = Blockly.createSvgElement('g', {'class': 'blocklyIconGroup'}, this.svgGroup_);
    Blockly.bindEvent_(this.iconGroup_, 'mouseup', this, function(){
        this.block_.folderIcon.setVisible(false);
    });
    var quantum = Blockly.Icon.RADIUS / 2;
    var iconShield = Blockly.createSvgElement('rect',
        {'class': 'blocklyIconShield',
            'width': 4 * quantum,
            'height': 4 * quantum,
            'rx': quantum,
            'ry': quantum}, this.iconGroup_);
    var iconMark_ = Blockly.createSvgElement('text',
        {'class': 'blocklyIconMark',
            'x': Blockly.Icon.RADIUS,
            'y': 2 * Blockly.Icon.RADIUS - 4}, this.iconGroup_);
    iconMark_.appendChild(document.createTextNode("-"));

    // Bottom right corner used to resize the miniworkspace
    this.resizeGroup_ = Blockly.createSvgElement('g',
        {'class': Blockly.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE'},
        this.svgGroup_);
    var resizeSize = 2 * Blockly.Bubble.BORDER_WIDTH;
    Blockly.createSvgElement('polygon',
        {'points': '0,x x,x x,0'.replace(/x/g, resizeSize.toString())},
        this.resizeGroup_);
    Blockly.createSvgElement('line',
        {'class': 'blocklyResizeLine',
        'x1': resizeSize / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize / 3}, this.resizeGroup_);
    Blockly.createSvgElement('line',
        {'class': 'blocklyResizeLine',
        'x1': resizeSize * 2 / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize * 2 / 3}, this.resizeGroup_);

    // Placeholder of the mw in the svgBlockCanvas_, used to influence the mainWorkspace size
    this.svgPlaceholder_ = Blockly.createSvgElement('rect', 
        {'visibility': 'hidden'}, null);

    return {'dom': this.svgGroup_, 'placeholder': this.svgPlaceholder_};
};

/**
 * Creates a new miniworkspace, renders it and fill it if needed
 * @param {!Blockly.Folder} Folder pseudo-block related to this miniworkspace
 * @param {Element} xml the XML rapresentation of the content of the miniworkspace
 * @param {number} height height of the miniworkspace
 * @param {number} width width of the miniworkspace
 * TODO @private
 */
Blockly.MiniWorkspace.prototype.renderWorkspace = function (folder, xml, height, width) {
    Blockly.ConnectionDB.init(this);
    this.topBlocks_ = [];
    this.block_.expandedFolder_ = false;
    this.workspace_ = folder.workspace;
    this.shape_ = folder.svg_.svgPath_;

    //Creates the dom of the miniworkspace
    var mWDom = this.createDom_();
    // Placeholder needed to influence the mainWorkspace size
    Blockly.mainWorkspace.getCanvas().appendChild(mWDom.placeholder);
    // Puts the miniworkspace in the svgMiniWorkpaceCanvas
    Blockly.mainWorkspace.getMiniWorkspaceCanvas().appendChild(mWDom.dom);

    this.svgGroupBack_.setAttribute('transform','translate(-5,-25)');
    this.svgGroup_.setAttribute('visibility','hidden');
    this.svgPlaceholder_.setAttribute('display', 'none');
    this.svgTitle_.setAttribute('transform','translate(31, -7.5)');
    this.iconGroup_.setAttribute('transform','translate(5, -20)');

    this.scrollbar = new Blockly.ScrollbarPair(this);

    if (xml) {
        this.clear();
        Blockly.Xml.domToWorkspace(this, xml);
    }

    this.render();
    this.rendered_ = true;

    if(height && width){
        this.resizeMiniWorkspace(height, width);
    } else {
        this.resizeMiniWorkspace();
    }

    if (!Blockly.readOnly) {
        Blockly.bindEvent_(this.svgGroupBack_, 'mousedown', this,
            this.miniWorkspaceHeaderMouseDown_);
        if (this.resizeGroup_) {
          Blockly.bindEvent_(this.resizeGroup_, 'mousedown', this,
                             this.resizeMouseDown_);
        }
    }
};

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to add
 */
Blockly.MiniWorkspace.prototype.addTopBlock = function(block) {
    block.workspace == this;
    block.isInFolder = true;
    this.topBlocks_.push(block);
    if (Blockly.Realtime.isEnabled() && this == Blockly.mainWorkspace) {
        Blockly.Realtime.addTopBlock(block);
    }
    this.fireChangeEvent();
};

/**
 * Shows/hide the miniworkspace
 * @param {!number} x the x coordinate
 * @param {!number} y the y coordinate
 */
Blockly.MiniWorkspace.prototype.moveMiniWorkspace_ = function (x, y) {
    this.svgGroup_.setAttribute('transform',
        'translate(' + x + ', ' + y + ')');
    this.svgPlaceholder_.setAttribute('transform',
        'translate(' + (x - 5) + ', ' + (y - 25) + ')');
};

/**
 * Shows/hide the miniworkspace
 * @param {!boolean} visible if true show the mw otherwise hide the mw
 */
Blockly.MiniWorkspace.prototype.setVisible = function(visible) {
    if(!this.rendered_ && !this.isInFlyout){
        this.renderWorkspace(this.block_);
    }
    
    // If the mw is not positioned, moves it near its pseudo-block
    var position = Blockly.getRelativeXY_(this.svgGroup_);
    if(position.x == 0 && position.y == 0) {
        var blockXY = this.block_.getRelativeToSurfaceXY();
        var x = blockXY.x;
        var y = blockXY.y;
        if(this.block_.isInFolder) {
            var blockWorkspaceXY = this.block_.workspace.getCoordinates();
            x += blockWorkspaceXY.x + this.block_.workspace.scrollX;
            y += blockWorkspaceXY.y + this.block_.workspace.scrollY;
        }
        var width = this.block_.getHeightWidth().width;
        this.moveMiniWorkspace_(x + width + 10, y + 15);
    }

    if (visible) {
        this.svgGroup_.setAttribute('visibility','visible');
        this.svgPlaceholder_.setAttribute('display', 'block');
        this.promote_();
    } else {
        this.svgGroup_.setAttribute('visibility','hidden');
        this.svgPlaceholder_.setAttribute('display', 'none');
    }
};

/**
 * Returns the coordinates of the top-left corner of the miniworkspace
 * @return {!Object} coordinates of the miniworkspace relative to the mainworkspace.
 */
Blockly.MiniWorkspace.prototype.getCoordinates = function(){
    return Blockly.getRelativeXY_(this.svgGroup_);
};

/**
 * TODO Updates the title in the miniworkspace header.
 */
Blockly.MiniWorkspace.prototype.updateTitle = function () {
    this.svgTitle_.innerHTML = this.block_.getFolderName();
    this.resizeTitle_();
};

/**
 * Resizes the title to avoid it overflowing the header of the miniworkspace.
 * @private
 */
Blockly.MiniWorkspace.prototype.resizeTitle_ = function () {
    var titleTranslate_ = this.svgTitle_.getAttribute("transform");
    titleTranslate_ = titleTranslate_.split("(")[1].split(")")[0].split(",");
    var headerWidth = this.svgBlockCanvasOuter_.getBBox().width - 
        parseInt(titleTranslate_[0]) - Blockly.Bubble.BORDER_WIDTH*2;    
    if(headerWidth <= 0) {
        return;
    }
    this.svgTitle_.innerHTML = this.block_.getFolderName();
    while(this.svgTitle_.getBBox().width > headerWidth) {
        this.svgTitle_.innerHTML = this.svgTitle_.innerHTML.slice(0, -1);
    }
    if(this.block_.getFolderName().length > this.svgTitle_.innerHTML.length) {
        this.svgTitle_.innerHTML += '...';
    }
};

/**
 * Resizes the title to avoid it overflowing the header of the miniworkspace.
 * @param {number} height height of the mw
 * @param {number} width width of the mw
 */
Blockly.MiniWorkspace.prototype.resizeMiniWorkspace = function(height, width){
    if(!height){
        height = Blockly.MiniWorkspace.DEFAULT_HEIGHT;
    } else if(height < 100){
        height = 100;
    }   
    if(!width){
        width = Blockly.MiniWorkspace.DEFAULT_WIDTH;
    }  else if(width < 100){
        width = 100;
    } 
    this.svgBlockCanvasOuter_.setAttribute('width', width);
    this.svgBlockCanvasOuter_.setAttribute('height', height);
    this.svgBlockCanvasOuterBack_.setAttribute('width', width);
    this.svgBlockCanvasOuterBack_.setAttribute('height', height);

    this.width_ =  width + 2 * Blockly.Bubble.BORDER_WIDTH;
    this.height_ =  height + 2 * Blockly.Bubble.BORDER_WIDTH;
    var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;

    this.svgGroupBack_.setAttribute('width', this.width_);
    this.svgPlaceholder_.setAttribute('width', this.width_);
    this.svgGroupBack_.setAttribute('height', this.height_ + 20);
    this.svgPlaceholder_.setAttribute('height', this.height_ + 20);
    
    this.resizeGroup_.setAttribute('transform', 'translate(' +
        (width - doubleBorderWidth) + ', ' +
        (height - doubleBorderWidth) + ')');
    
    // Fires an event to resize the scrollbar
    Blockly.fireUiEvent(this.svgGroup_,'resize');
}


/**
 * Highlight this miniworkspace.
 * If this.isValid is true puts a green highlight, otherwise puts a red highlight. 
 */
Blockly.MiniWorkspace.prototype.highlight = function() {
    if(this.isValid){
        Blockly.addClass_(/** @type {!Element} */ (this.svgGroupBack_),
            'blocklySelectedFolder');
    } else {
        Blockly.addClass_(/** @type {!Element} */ (this.svgGroupBack_),
            'blocklySelectedInvalidFolder');        
    }
};

/**
 * Unhighlight this miniworkspace 
 */
Blockly.MiniWorkspace.prototype.unhighlight = function() {
    if(this.isValid){
        Blockly.removeClass_(/** @type {!Element} */ (this.svgGroupBack_),
            'blocklySelectedFolder');
    } else {
        Blockly.removeClass_(/** @type {!Element} */ (this.svgGroupBack_),
            'blocklySelectedInvalidFolder');
    }
};

/**
 * Move this miniworkspace to the top of the stack.
 * @private
 */
Blockly.MiniWorkspace.prototype.promote_ = function() {
    Blockly.mainWorkspace.getMiniWorkspaceCanvas().appendChild(this.svgGroup_);
    this.block_.promote();
};

/**
 * Spreads the 'blocklyWorkspaceChange' event to the miniworkspace's block canvas
 */
Blockly.MiniWorkspace.prototype.spreadChangeEvent = function() {
  var workspace = this;
  if (this.fireChangeEventPid_) {
    window.clearTimeout(this.fireChangeEventPid_);
  }
  var canvas = this.getCanvas();
  if (canvas) {
    this.fireChangeEventPid_ = window.setTimeout(function() {
        Blockly.fireUiEvent(canvas, 'blocklyWorkspaceChange');
      }, 0);
  }
};

/**
 * Fires a resize event on this svgGroup_ to allow the scrollbar to resize
 */
Blockly.MiniWorkspace.prototype.fireResizeEvent = function () {
    Blockly.fireUiEvent(this.svgGroup_, 'resize');
};

/**
 * Handle a mouse-down on miniworkspace's resize corner.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.MiniWorkspace.prototype.resizeMouseDown_ = function(e) {
    this.promote_();
    Blockly.MiniWorkspace.unbindDragEvents_();
    if (Blockly.isRightButton(e)) {
        // Right-click.
        return;
    }
    // Record the starting offset between the current location and the mouse.
    if (Blockly.RTL) {
        this.resizeDeltaWidth = this.width_ + e.clientX;
    } else {
        this.resizeDeltaWidth = this.width_ - e.clientX;
    }
    this.resizeDeltaHeight = this.height_ - e.clientY;

    Blockly.MiniWorkspace.onMouseUpWrapper_ = Blockly.bindEvent_(document,
        'mouseup', this, Blockly.MiniWorkspace.unbindDragEvents_);
    Blockly.MiniWorkspace.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
        'mousemove', this, this.resizeMouseMove_);
    Blockly.hideChaff();
    // This event has been handled.  No need to bubble up.
    e.stopPropagation();
};

/**
 * Resize this miniworkspace to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.MiniWorkspace.prototype.resizeMouseMove_ = function(e) {
    this.autoLayout_ = false;
    var w = this.resizeDeltaWidth;
    var h = this.resizeDeltaHeight + e.clientY;
    if (Blockly.RTL) {
        // RTL drags the bottom-left corner.
        w -= e.clientX;
    } else {
        // LTR drags the bottom-right corner.
        w += e.clientX;
    }
    this.resizeMiniWorkspace(h, w);
};

/**
 * When a mw is resized, resizes its title and its scrollbars
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.MiniWorkspace.prototype.onResize_ = function(e) {
    this.resizeTitle_();
    this.scrollbar.resize();
};

/**
 * Handle a mouse-down on miniworkspace's header.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.MiniWorkspace.prototype.miniWorkspaceHeaderMouseDown_ = function (e) {
    this.promote_();
    Blockly.MiniWorkspace.unbindDragEvents_();
    if (Blockly.isRightButton(e)) {
        // Right-click.
        return;
    } else if (Blockly.isTargetInput_(e)) {
        // When focused on an HTML text input widget, don't trap any events.
        return;
    }
    // Calls this miniworkspace generic handler
    this.miniWorkspaceMouseDown_(e);
    // Left-click (or middle click)
    Blockly.setCursorHand_(true);
    // Record the starting offset between the current location and the mouse.
    this.startDragCoordinates_ = this.getCoordinates();
    if (Blockly.RTL) {
        this.startDragMouseX = -e.clientX;
    } else {
        this.startDragMouseX = e.clientX;
    }
    this.startDragMouseY = e.clientY;

    Blockly.MiniWorkspace.onMouseUpWrapper_ = Blockly.bindEvent_(document,
        'mouseup', this, Blockly.MiniWorkspace.unbindDragEvents_);
    Blockly.MiniWorkspace.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
        'mousemove', this, this.miniWorkspaceHeaderMouseMove_);
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
};

/**
 * Move this miniworkspace to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.MiniWorkspace.prototype.miniWorkspaceHeaderMouseMove_ = function(e) {
    var x; 
    if (Blockly.RTL) {
        x = this.startDragCoordinates_.x - (e.clientX - this.startDragMouseX);
    } else {
        x = this.startDragCoordinates_.x + (e.clientX - this.startDragMouseX);
    }
    var y = this.startDragCoordinates_.y + (e.clientY - this.startDragMouseY);
    
    this.moveMiniWorkspace_(x , y);
};

/**
 * Handle a generic mouse-down on a miniworkspace.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.MiniWorkspace.prototype.miniWorkspaceMouseDown_ = function (e) {
    this.promote_();
    Blockly.MiniWorkspace.unbindDragEvents_();
    if (Blockly.isRightButton(e)) {
        // Right-click.
        return;
    } else if (Blockly.isTargetInput_(e)) {
        // When focused on an HTML text input widget, don't trap any events.
        return;
    }
    Blockly.onMouseDown_.call(this, e);

    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.MiniWorkspace.unbindDragEvents_ = function() {
    if (Blockly.MiniWorkspace.onMouseUpWrapper_) {
        Blockly.unbindEvent_(Blockly.MiniWorkspace.onMouseUpWrapper_);
        Blockly.MiniWorkspace.onMouseUpWrapper_ = null;
    }
    if (Blockly.MiniWorkspace.onMouseMoveWrapper_) {
        Blockly.unbindEvent_(Blockly.MiniWorkspace.onMouseMoveWrapper_);
        Blockly.MiniWorkspace.onMouseMoveWrapper_ = null;
    }
    Blockly.fireUiEvent(window, 'resize');
};

/**
 * Dispose of this miniworkspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
 Blockly.MiniWorkspace.prototype.disposeWorkspace = function () {
    Blockly.MiniWorkspace.unbindDragEvents_();
    //Disposes all the topBlocks_
    while (this.topBlocks_.length > 0) {
        this.topBlocks_[0].dispose();
    }

    goog.dom.removeNode(this.svgGroup_);
    goog.dom.removeNode(this.svgPlaceholder_);

    this.svgGroup_ = null;
    this.svgBlockCanvas_ = null;
    this.svgMiniWorkspaceCanvas_ = null;
    this.svgBubbleCanvas_ = null;
    this.svgGroupBack_ = null;
    this.svgPlaceholder_ = null;

    this.iconGroup_ = null;
    this.workspace_ = null;
    this.content_ = null;
    this.shape_ = null;
    this.block_.expandedFolder_ = false;
    this.block_ = null;
};