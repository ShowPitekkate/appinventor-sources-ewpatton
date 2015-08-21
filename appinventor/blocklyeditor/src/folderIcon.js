'use strict';

goog.provide('Blockly.FolderIcon');
goog.require('Blockly.Folder');
goog.require('Blockly.MiniWorkspace');

/**
 * Class for a folder icon.
 * @constructor
 */
Blockly.FolderIcon = function () {
    this.block_ = this;
    this.visible = false;
};

/**
 * Create the icon on the block.
 */
 Blockly.FolderIcon.prototype.createIcon = function () {
    /* Here's the markup that will be generated:
    <g class="blocklyIconGroup">
        <rect class="blocklyIconShield" width="16" height="16" rx="4" ry="4"></rect>
        <text class="blocklyIconMark" x="8" y="12">-</text>
    </g>
    */
    this.iconGroup_ = Blockly.createSvgElement('g', {}, null);
    this.block_.getSvgRoot().appendChild(this.iconGroup_);
    Blockly.bindEvent_(this.iconGroup_, 'mouseup', this, this.iconClick_);
    this.updateEditable();

    var quantum = Blockly.Icon.RADIUS / 2;
    var iconShield = Blockly.createSvgElement('rect',
        {'class': 'blocklyIconShield',
            'width': 4 * quantum,
            'height': 4 * quantum,
            'rx': quantum,
            'ry': quantum}, this.iconGroup_);
    this.iconMark_ = Blockly.createSvgElement('text',
        {'class': 'blocklyIconMark',
            'x': Blockly.Icon.RADIUS,
            'y': 2 * Blockly.Icon.RADIUS - 4}, this.iconGroup_);
    var icon = this.block_.expandedFolder_ ? "-" : "+";
    this.iconMark_.appendChild(document.createTextNode(icon));
};

/**
 * Render this icon.
 * @param {number} cursorX Horizontal offset at which to position the icon.
 * @return {number} Horizontal offset for next item to draw.
 */
Blockly.FolderIcon.prototype.renderIcon = function(cursorX) {
    if (this.block_.isCollapsed()) {
        this.iconGroup_.setAttribute('display', 'none');
        return cursorX;
    }
    this.iconGroup_.setAttribute('display', 'block');

    var TOP_MARGIN = 5;
    var diameter = 2 * Blockly.Icon.RADIUS;
    if (Blockly.RTL) {
        cursorX -= diameter;
    }
    this.iconGroup_.setAttribute('transform',
        'translate(' + cursorX + ', ' + TOP_MARGIN + ')');
    //this.computeIconLocation();
    if (Blockly.RTL) {
        cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
    } else {
        cursorX += diameter + Blockly.BlockSvg.SEP_SPACE_X;
    }
    return cursorX;
};

/**
 * Clicking on the icon toggles if the miniworkspace is visible.
 * @param {!Event} e Mouse click event.
 * @private
 */
Blockly.FolderIcon.prototype.iconClick_ = function(e) {
    this.block_.promote();
    if (this.block_.isEditable()) {
        if (!this.block_.isInFlyout) {
            this.setVisible(!this.isVisible());
        }
    }
};

/**
 * Add or remove editability of the comment.
 */
Blockly.FolderIcon.prototype.updateEditable = function() {
    if (this.block_.isEditable()) {
        // Default behaviour for an icon.
        if (!this.block_.isInFlyout) {
            Blockly.addClass_(/** @type {!Element} */ (this.iconGroup_),
                'blocklyIconGroup');
        } else {
            Blockly.removeClass_(/** @type {!Element} */ (this.iconGroup_),
                'blocklyIconGroup');
        }
    } else {
        // Close any mutator bubble.  Icon is not clickable.
        this.setVisible(false);
        Blockly.removeClass_(/** @type {!Element} */ (this.iconGroup_),
            'blocklyIconGroup');
    }
};

/**
 * Show or hide the miniworkspace.
 * @param {boolean} visible True if the miniworkspace should be visible.
 */
Blockly.FolderIcon.prototype.setVisible = function(visible) {
    if (visible == this.isVisible()) {
        // No change.
        return;
    }    
    this.block_.miniworkspace.setVisible(visible);
    if(visible) {
        Blockly.focusedWorkspace_ = this.block_.miniworkspace;
    } else {
        Blockly.focusedWorkspace_ = Blockly.mainWorkspace;
    }
    this.block_.expandedFolder_ = visible;
    this.iconMark_.innerHTML = this.block_.expandedFolder_ ? "-" : "+";
    this.visible = visible;
};

/**
 * Returns the center of the block's icon relative to the surface.
 * @return {!Object} Object with x and y properties.
 */
Blockly.FolderIcon.prototype.getIconLocation = function() {
    return {x: this.iconX_, y: this.iconY_};
};

/**
 * Notification that the icon has moved, but we don't really know where.
 * Recompute the icon's location from scratch.
 */
Blockly.FolderIcon.prototype.computeIconLocation = function() {
    // Find coordinates for the centre of the icon and update the arrow.
    var blockXY = this.block_.getRelativeToSurfaceXY();
    var iconXY = Blockly.getRelativeXY_(this.iconGroup_);
    var  newX = blockXY.x + iconXY.x + Blockly.Icon.RADIUS;
    var newY = blockXY.y + iconXY.y + Blockly.Icon.RADIUS;
    if (newX !== this.iconX_ || newY !== this.iconY_) {
        this.setIconLocation(newX, newY);
    }
};

/**
 * Notification that the icon has moved.
 * @param {number} x Absolute horizontal location.
 * @param {number} y Absolute vertical location.
 */
Blockly.FolderIcon.prototype.setIconLocation = function(x, y) {
    this.iconX_ = x;
    this.iconY_ = y;
};

/**
 * Is the miniworkspace visible?
 * @return {boolean} True if the miniworkspace is visible.
 */
Blockly.FolderIcon.prototype.isVisible = function () {
    return this.visible;
};

/**
 * Dispose of this folder icon.
 */
Blockly.FolderIcon.prototype.dispose = function() {
    this.block_.miniworkspace.disposeWorkspace();
    // Dispose of and unlink the icon.
    goog.dom.removeNode(this.iconGroup_);
    this.iconGroup_ = null;
    this.block_ = null;
};