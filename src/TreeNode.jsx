import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { nodeContextTypes } from './contextTypes';
import {
  getDataAndAria,
} from './util';

const ICON_OPEN = 'open';
const ICON_CLOSE = 'close';

class TreeNode extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    // By parent
    expanded: PropTypes.bool,
    selected: PropTypes.bool,
    checked: PropTypes.bool,
    loading: PropTypes.bool,
    halfChecked: PropTypes.bool,
    title: PropTypes.node,
    dragOver: PropTypes.bool,
    dragOverGapTop: PropTypes.bool,
    dragOverGapBottom: PropTypes.bool,
    deepness: PropTypes.number,

    // By user
    isLeaf: PropTypes.bool,
    selectable: PropTypes.bool,
    disabled: PropTypes.bool,
    disableCheckbox: PropTypes.bool,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    switcherIcon: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
  };

  static contextTypes = nodeContextTypes;

  static childContextTypes = nodeContextTypes;

  constructor(props) {
    super(props);

    this.state = {
      dragNodeHighlight: false,
    };
  }

  getChildContext() {
    return {
      ...this.context,
      rcTreeNode: {
        // onUpCheckConduct: this.onUpCheckConduct,
      },
    };
  }

  isDisabled = () => {
    const { disabled } = this.props;
    const { rcTree: { disabled: treeDisabled } } = this.context;

    // Follow the logic of Selectable
    if (disabled === false) {
      return false;
    }

    return !!(treeDisabled || disabled);
  };

  getNodeState = () => {
    const { expanded } = this.props;

    if (this.isLeaf()) {
      return null;
    }

    return expanded ? ICON_OPEN : ICON_CLOSE;
  };

  isLeaf = () => {
    const { isLeaf } = this.props;

    /* if (isLeaf === false) {
      return false;
    } */
    return isLeaf
  };

  // Disabled item still can be switch
  onExpand = (e) => {
    const { rcTree: { onNodeExpand } } = this.context;
    onNodeExpand(e, this);
  };

  onSelectorClick = (e) => {
    // Click trigger before select/check operation
    const { rcTree: { onNodeClick } } = this.context;
    onNodeClick(e, this);

    if (this.isSelectable()) {
      this.onSelect(e);
    } else {
      this.onCheck(e);
    }
  };

  onSelect = (e) => {
    if (this.isDisabled()) return;

    const { rcTree: { onNodeSelect } } = this.context;
    e.preventDefault();
    onNodeSelect(e, this);
  };

  onCheck = (e) => {
    if (this.isDisabled()) return;

    const { disableCheckbox, checked } = this.props;
    const {
      rcTree: { checkable, onNodeCheck },
    } = this.context;

    if (!checkable || disableCheckbox) return;

    e.preventDefault();
    const targetChecked = !checked;
    onNodeCheck(e, this, targetChecked);
  };

  onMouseEnter = (e) => {
    const { rcTree: { onNodeMouseEnter } } = this.context;
    onNodeMouseEnter(e, this);
  };

  onMouseLeave = (e) => {
    const { rcTree: { onNodeMouseLeave } } = this.context;
    onNodeMouseLeave(e, this);
  };

  onContextMenu = (e) => {
    const { rcTree: { onNodeContextMenu } } = this.context;
    onNodeContextMenu(e, this);
  };

  isSelectable() {
    const { selectable } = this.props;
    const { rcTree: { selectable: treeSelectable } } = this.context;

    // Ignore when selectable is undefined or null
    if (typeof selectable === 'boolean') {
      return selectable;
    }

    return treeSelectable;
  }

  // Switcher
  renderSwitcher = () => {
    const {
      expanded,
      switcherIcon: switcherIconFromProps,
    } = this.props;
    const {
      rcTree: {
        prefixCls,
        switcherIcon: switcherIconFromCtx,
      }
    } = this.context;

    const switcherIcon = switcherIconFromProps || switcherIconFromCtx;

    if (this.isLeaf()) {
      return (
        <span className={classNames(`${prefixCls}-switcher`, `${prefixCls}-switcher-noop`)}>
          {typeof switcherIcon === 'function' ?
            switcherIcon({ ...this.props, isLeaf: true }) : switcherIcon}
        </span>
      );
    }

    const switcherCls = classNames(`${prefixCls}-switcher`, `${prefixCls}-switcher_${expanded ? ICON_OPEN : ICON_CLOSE}`);
    return (
      <span onClick={this.onExpand} className={switcherCls}>
        {typeof switcherIcon === 'function' ?
          switcherIcon({ ...this.props, isLeaf: false }) : switcherIcon}
      </span>
    );
  };

  // Checkbox
  renderCheckbox = () => {
    const { checked, halfChecked, disableCheckbox } = this.props;
    const { rcTree: { prefixCls, checkable } } = this.context;
    const disabled = this.isDisabled();

    if (!checkable) return null;

    // [Legacy] Custom element should be separate with `checkable` in future
    const $custom = typeof checkable !== 'boolean' ? checkable : null;

    return (
      <span
        className={classNames(
          `${prefixCls}-checkbox`,
          checked && `${prefixCls}-checkbox-checked`,
          !checked && halfChecked && `${prefixCls}-checkbox-indeterminate`,
          (disabled || disableCheckbox) && `${prefixCls}-checkbox-disabled`,
        )}
        onClick={this.onCheck}
      >
        {$custom}
      </span>
    );
  };

  // Icon + Title
  renderSelector = () => {
    const { dragNodeHighlight } = this.state;
    const { title, selected, icon, loading } = this.props;
    const { rcTree: { prefixCls, showIcon, icon: treeIcon, draggable, loadData } } = this.context;
    const wrapClass = `${prefixCls}-node-content-wrapper`;
    const $title = <span className={`${prefixCls}-title`}>{title}</span>;
    const disabled = this.isDisabled();

    let $icon;

    if (showIcon) {
      const currentIcon = icon || treeIcon;

      $icon = currentIcon ? (
        <span
          className={classNames(
            `${prefixCls}-iconEle`,
            `${prefixCls}-icon__customize`,
          )}
        >
          {typeof currentIcon === 'function' ?
            React.createElement(currentIcon, {
              ...this.props,
            }) : currentIcon}
        </span>
      ) : this.renderIcon();
    } else if (loadData && loading) {
      $icon = this.renderIcon();
    }

    return (
      <span
        ref={this.setSelectHandle}
        title={typeof title === 'string' ? title : ''}
        className={classNames(
          `${wrapClass}`,
          `${wrapClass}-${this.getNodeState() || 'normal'}`,
          (!disabled && (selected || dragNodeHighlight)) && `${prefixCls}-node-selected`,
          (!disabled && draggable) && 'draggable'
        )}
        draggable={(!disabled && draggable) || undefined}
        aria-grabbed={(!disabled && draggable) || undefined}

        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onContextMenu={this.onContextMenu}
        onClick={this.onSelectorClick}
        onDoubleClick={this.onSelectorDoubleClick}
        onDragStart={draggable ? this.onDragStart : undefined}
      >
        {$icon}{$title}
      </span>
    );
  }

  render() {
    const { loading } = this.props;
    const {
      className, style,
      dragOver, dragOverGapTop, dragOverGapBottom,
      isLeaf,
      expanded, selected, checked, halfChecked,
      deepness,
      ...otherProps
    } = this.props;
    const { rcTree: {
      prefixCls,
      filterTreeNode,
      draggable,
    } } = this.context;
    const disabled = this.isDisabled();
    const dataOrAriaAttributeProps = getDataAndAria(otherProps);

    return (
      <div
        className={classNames(className, {
          [`${prefixCls}-treenode-disabled`]: disabled,
          [`${prefixCls}-treenode-switcher-${expanded ? 'open' : 'close'}`]: !isLeaf,
          [`${prefixCls}-treenode-checkbox-checked`]: checked,
          [`${prefixCls}-treenode-checkbox-indeterminate`]: halfChecked,
          [`${prefixCls}-treenode-selected`]: selected,
          [`${prefixCls}-treenode-loading`]: loading,
          [`${prefixCls}-treenode-deepness-${deepness}`]: deepness,

          'drag-over': !disabled && dragOver,
          'drag-over-gap-top': !disabled && dragOverGapTop,
          'drag-over-gap-bottom': !disabled && dragOverGapBottom,
          'filter-node': filterTreeNode && filterTreeNode(this),
        })}

        style={style}

        onDragEnter={draggable ? this.onDragEnter : undefined}
        onDragOver={draggable ? this.onDragOver : undefined}
        onDragLeave={draggable ? this.onDragLeave : undefined}
        onDrop={draggable ? this.onDrop : undefined}
        onDragEnd={draggable ? this.onDragEnd : undefined}
        {...dataOrAriaAttributeProps}
      >
        {this.renderSwitcher()}
        {this.renderCheckbox()}
        {this.renderSelector()}
      </div>
    );
  }
}

export default TreeNode;
