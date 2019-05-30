import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TreeNode from './TreeNode';
import { treeContextTypes } from './contextTypes';
import { CellMeasurer, CellMeasurerCache, AutoSizer, List } from 'react-virtualized';
import 'react-virtualized/styles.css';

import {
  nodeHasChildren,
  isNodeExpanded,
  getFlattenedTree,
  convertTreeToEntities,
  parseCheckedKeys,
  conductExpandParent,
  calcSelectedKeys,
  conductCheck,
  arrDel,
  arrAdd
} from './util';

const cache = new CellMeasurerCache({
  defaultHeight: 20,
  fixedWidth: true,
  keyMapper: () => 1,
});

export class TreeList extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    defaultExpandParent: PropTypes.bool,
    autoExpandParent: PropTypes.bool,
    expandedKeys: PropTypes.arrayOf(PropTypes.string),
    defaultExpandedKeys: PropTypes.arrayOf(PropTypes.string),
    selectable: PropTypes.bool,
    selectedKeys: PropTypes.arrayOf(PropTypes.string),
    onExpand: PropTypes.func,
    switcherIcon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onRightClick: PropTypes.func,
  }
  static defaultProps = {
    prefixCls: 'rc-tree',
    selectable: true,
    defaultExpandParent: true,
    autoExpandParent: false,
    defaultExpandedKeys: [],
  };
  static childContextTypes = treeContextTypes;

  constructor(props) {
    super(props);

    this.state = {
      keyEntities: {},
      flatTreeData: [],
      selectedKeys: [],
      checkedKeys: [],
      halfCheckedKeys: [],
    };
  
    // Internal usage for `rc-tree-select`, we don't promise it will not change.
    this.domTreeNodes = {};
  }

  getChildContext() {
    const {
      prefixCls, selectable, checkable, switcherIcon
    } = this.props;

    return {
      rcTree: {
        // root: this,

        prefixCls,
        checkable,
        selectable,
        switcherIcon,
        onNodeExpand: this.onNodeExpand,
        onNodeCheck: this.onNodeCheck,
        onNodeClick: this.onNodeClick,
        onNodeSelect: this.onNodeSelect,
        onNodeMouseEnter: this.onNodeMouseEnter,
        onNodeMouseLeave: this.onNodeMouseLeave,
        onNodeContextMenu: this.onNodeContextMenu,
      },
    };
  }
  getFlattenedTree = (nodes, parents = []) => {
    const {
      prefixCls, className, focusable,
      showLine, tabIndex = 0, treeData, defaultExpandAll
    } = this.props;
    return nodes.reduce((flattenedTree, { children, ...node }) => {
      const deepness = parents.length;
      const nodeWithHelpers = {...node, deepness, parents};

      if (!nodeHasChildren(children) || !isNodeExpanded(node)) {
        return [...flattenedTree, nodeWithHelpers];
      }

      return [...flattenedTree, nodeWithHelpers, ...getFlattenedTree(children, [...parents, node.id])];
    }, []);
  }
  static getDerivedStateFromProps(props, prevState) {
    const { prevProps } = prevState;
    const newState = {
      prevProps: props,
    };
    function needSync(name) {
      return (!prevProps && name in props) || (prevProps && prevProps[name] !== props[name]);
    }
    let flatTreeData = null;

    // Tree support filter function which will break the tree structure in the vdm.
    // We cache the treeNodes in state so that we can return the treeNode in event trigger.
    if (props.treeData) {
      newState.treeData = props.treeData;

      // Calculate the entities data for quick match
      const entitiesMap = convertTreeToEntities(props.treeData);
      newState.posEntities = entitiesMap.posEntities;
      newState.keyEntities = entitiesMap.keyEntities;
    }

    /*keyEntities
    key:{
      children:
      index:
      key:
      node:
      parent:
      pos:
    }
    */

    const keyEntities = newState.keyEntities || prevState.keyEntities;

    // ================ expandedKeys =================
    if (needSync('expandedKeys') || (prevProps && needSync('autoExpandParent'))) {
      newState.expandedKeys = (props.autoExpandParent || (!prevProps && props.defaultExpandParent)) ?
        conductExpandParent(props.expandedKeys, keyEntities) : props.expandedKeys;
    } else if (!prevProps && props.defaultExpandAll) {
      newState.expandedKeys = Object.keys(keyEntities);
    } else if (!prevProps && props.defaultExpandedKeys) {
      newState.expandedKeys = (props.autoExpandParent || props.defaultExpandParent) ?
        conductExpandParent(props.defaultExpandedKeys, keyEntities) : props.defaultExpandedKeys;
    }

    // ================ selectedKeys =================
    if (props.selectable) {
      if (needSync('selectedKeys')) {
        newState.selectedKeys = calcSelectedKeys(props.selectedKeys, props);
      } else if (!prevProps && props.defaultSelectedKeys) {
        newState.selectedKeys = calcSelectedKeys(props.defaultSelectedKeys, props);
      }
    }
    // Check if `treeData` or `children` changed and save into the state.
    /*if (needSync('treeData')) {
      flatTreeData = getFlattenedTree(props.treeData, [], newState.expandedKeys);
      newState.flatTreeData = flatTreeData;
    }*/
    // ================= checkedKeys =================
    if (props.checkable) {
      let checkedKeyEntity;

      if (needSync('checkedKeys')) {
        checkedKeyEntity = parseCheckedKeys(props.checkedKeys) || {};
      } else if (!prevProps && props.defaultCheckedKeys) {
        checkedKeyEntity = parseCheckedKeys(props.defaultCheckedKeys) || {};
      }
      if (checkedKeyEntity) {
        let { checkedKeys = [], halfCheckedKeys = [] } = checkedKeyEntity;

        if (!props.checkStrictly) {
          const conductKeys = conductCheck(checkedKeys, true, keyEntities);
          checkedKeys = conductKeys.checkedKeys;
          halfCheckedKeys = conductKeys.halfCheckedKeys;
        }

        newState.checkedKeys = checkedKeys;
        newState.halfCheckedKeys = halfCheckedKeys;
      }
    }
    return newState;
  }

  onNodeClick = (e, treeNode) => {
    const { onClick } = this.props;
    if (onClick) {
      onClick(e, treeNode);
    }
  };


  onNodeSelect = (e, treeNode) => {
    let { selectedKeys } = this.state;
    const { keyEntities } = this.state;
    const { onSelect, multiple } = this.props;
    const { selected, eventKey } = treeNode.props;
    const targetSelected = !selected;

    // Update selected keys
    if (!targetSelected) {
      selectedKeys = arrDel(selectedKeys, eventKey);
    } else if (!multiple) {
      selectedKeys = [eventKey];
    } else {
      selectedKeys = arrAdd(selectedKeys, eventKey);
    }

    // [Legacy] Not found related usage in doc or upper libs
    const selectedNodes = selectedKeys.map(key => {
      const entity = keyEntities[key];
      if (!entity) return null;

      return entity.node;
    }).filter(node => node);

    this.setUncontrolledState({ selectedKeys });

    if (onSelect) {
      const eventObj = {
        event: 'select',
        selected: targetSelected,
        node: treeNode,
        selectedNodes,
        nativeEvent: e.nativeEvent,
      };
      onSelect(selectedKeys, eventObj);
    }
  };
  onNodeCheck = (e, treeNode, checked) => {
    const { keyEntities, checkedKeys: oriCheckedKeys, halfCheckedKeys: oriHalfCheckedKeys } = this.state;
    const { checkStrictly, onCheck } = this.props;
    const { props: { eventKey } } = treeNode;

    // Prepare trigger arguments
    let checkedObj;
    const eventObj = {
      event: 'check',
      node: treeNode,
      checked,
      nativeEvent: e.nativeEvent,
    };

    if (checkStrictly) {
      const checkedKeys = checked ? arrAdd(oriCheckedKeys, eventKey) : arrDel(oriCheckedKeys, eventKey);
      const halfCheckedKeys = arrDel(oriHalfCheckedKeys, eventKey);
      checkedObj = { checked: checkedKeys, halfChecked: halfCheckedKeys };

      eventObj.checkedNodes = checkedKeys
        .map(key => keyEntities[key])
        .filter(entity => entity)
        .map(entity => entity.node);

      this.setUncontrolledState({ checkedKeys });
    } else {
      const { checkedKeys, halfCheckedKeys } = conductCheck([eventKey], checked, keyEntities, {
        checkedKeys: oriCheckedKeys, halfCheckedKeys: oriHalfCheckedKeys,
      });

      checkedObj = checkedKeys;

      // [Legacy] This is used for `rc-tree-select`
      /*eventObj.checkedNodes = [];*/
      eventObj.checkedNodesPositions = [];
      eventObj.halfCheckedKeys = halfCheckedKeys;

      checkedKeys.forEach((key) => {
        const entity = keyEntities[key];
        if (!entity) return;

        const { pos } = entity;

        //eventObj.checkedNodes.push(node);
        eventObj.checkedNodesPositions.push({ pos });
      });

      this.setUncontrolledState({
        checkedKeys,
        halfCheckedKeys,
      });
    }

    if (onCheck) {
      onCheck(checkedObj, eventObj);
    }
  }
  onNodeExpand = (e, treeNode) => {
    let { expandedKeys } = this.state;
    const { onExpand } = this.props;
    const { eventKey, expanded } = treeNode.props;
    const targetExpanded = !expanded;
    if (targetExpanded) {
      expandedKeys = arrAdd(expandedKeys, eventKey);
    } else {
      expandedKeys = arrDel(expandedKeys, eventKey);
    }
    this.setUncontrolledState({ expandedKeys });
    if (onExpand) {
      onExpand(expandedKeys, {
        node: treeNode,
        expanded: targetExpanded,
        nativeEvent: e.nativeEvent,
      });
    }
  };

  onNodeMouseEnter = (event, node) => {
    const { onMouseEnter } = this.props;
    if (onMouseEnter) {
      onMouseEnter({ event, node });
    }
  };

  onNodeMouseLeave = (event, node) => {
    const { onMouseLeave } = this.props;
    if (onMouseLeave) {
      onMouseLeave({ event, node });
    }
  };

  onNodeContextMenu = (event, node) => {
    const { onRightClick } = this.props;
    if (onRightClick) {
      event.preventDefault();
      onRightClick({ event, node });
    }
  };
  /**
   * Only update the value which is not in props
   */
  setUncontrolledState = (state) => {
    let needSync = false;
    const newState = {};

    Object.keys(state).forEach(name => {
      if (name in this.props) return;

      needSync = true;
      newState[name] = state[name];
    });

    if (needSync) {
      this.setState(newState);
    }
  };
  isKeyChecked = (key) => {
    const { checkedKeys = [] } = this.state;
    return checkedKeys.indexOf(key) !== -1;
  };
  renderTreeNode = (item, {index, isScrolling, key, parent, style}) => {
    const {
      rowRenderer
    } = this.props;
    const {
      expandedKeys = [],
      halfCheckedKeys = [],
      selectedKeys = []
    } = this.state;
    const { children, isLeaf, title, ...props } = item
    let child

    if(rowRenderer){
      const { children, isLeaf, title, ...props } = item
      child = rowRenderer(item, {index, isScrolling, key, parent, style})
      return React.cloneElement(child, {
        isLeaf: isLeaf,
        eventKey: item.key,
        expanded: expandedKeys.indexOf(item.key) !== -1,
        selected: selectedKeys.indexOf(item.key) !== -1,
        checked: this.isKeyChecked(item.key),
        halfChecked: halfCheckedKeys.indexOf(item.key) !== -1,
        style:style,
        ...props
      });
    } else {
      const { children, isLeaf, ...props } = item
      return <TreeNode
        {...props}
        isLeaf={isLeaf}
        eventKey={item.key}
        expanded={expandedKeys.indexOf(item.key) !== -1}
        checked={this.isKeyChecked(item.key)}
        selected={selectedKeys.indexOf(item.key) !== -1}
        halfChecked={halfCheckedKeys.indexOf(item.key) !== -1}
        style={style}
      />
    }
  }
  render(){
    const {
      prefixCls, className, focusable,
      showLine, tabIndex = 0, treeData,
      height, width, rowRenderer
    } = this.props;
    const {
      expandedKeys = [],
      halfCheckedKeys = [],
      selectedKeys = []
    } = this.state;
    const flatTreeData = getFlattenedTree(treeData, [], expandedKeys);
    return <List
      className={classNames(prefixCls, className, {
        [`${prefixCls}-show-line`]: showLine,
      })}
      role="tree"
      unselectable="on"
      height={height}
      overscanRowCount={1}
      //ref:setRef,
      rowHeight={cache.rowHeight}
      rowRenderer={({index, isScrolling, key, parent, style}) => {
        const item = flatTreeData[index]
        if(!item){
          return null
        }
        //return convertDataToTree(item)
        return <CellMeasurer
          cache={cache}
          columnIndex={0}
          key={key}
          parent={parent}
          rowIndex={index}
        >
          {this.renderTreeNode(item, {index, isScrolling, key, parent, style})}
          {/*
          <TreeNode
            {...props}
            isLeaf={item.isLeaf}
            eventKey={item.key}
            expanded={expandedKeys.indexOf(item.key) !== -1}
            checked={this.isKeyChecked(item.key)}
            selected={selectedKeys.indexOf(item.key) !== -1}
            halfChecked={halfCheckedKeys.indexOf(item.key) !== -1}
            style={style}
          />*/}
        </CellMeasurer>;
        // return this.renderTreeNode(treeNode, index)
        /*return React.cloneElement(child, {
          style:Object.assign({}, style, {
            paddingLeft: 18*child.props.pos.split('-')[0]
          })
        });*/
        //return this.renderTreeNode(nodeList[index], index, style)
        /*return mapChildren(nodeList, (node, index) => (
          this.renderTreeNode(node, index)
        ));*/
      }}
      onRowsRendered={this.props.onRowsRendered}
      rowCount={flatTreeData.length}
      width={width}
    />
  }
}

export function Tree (props) {
  return (
    <AutoSizer>
      {(param) => {
        const newProps = {...props, ...param}
        return <TreeList
          {...newProps}
        />
      }}
    </AutoSizer>
  );
}

export default Tree;