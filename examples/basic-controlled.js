/* eslint-disable no-console, react/no-unescaped-entities */
import 'rc-vtree/assets/index.less';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Tree, { TreeNode } from 'rc-vtree';
import 'rc-dialog/assets/index.css';
import Modal from 'rc-dialog';
import { gData, getRadioSelectKeys } from './util';


class Demo extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    multiple: PropTypes.bool,
  };
  static defaultProps = {
    visible: false,
    multiple: true,
  };
  state = {
    // expandedKeys: getFilterExpandedKeys(gData, ['0-0-0-key']),
    expandedKeys: ['0-0-0-key'],
    autoExpandParent: true,
    // checkedKeys: ['0-0-0-0-key', '0-0-1-0-key', '0-1-0-0-key'],
    checkedKeys: ['0-0-0-key'],
    checkStrictlyKeys: { checked: ['0-0-1-key'], halfChecked: [] },
    selectedKeys: [],
    treeData: [],
  };
  onExpand = (expandedKeys) => {
    console.log('onExpand');
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck = (checkedKeys) => {
    this.setState({
      checkedKeys,
    });
  }
  onCheckStrictly = (checkedKeys, /* extra */) => {
    // console.log(arguments);
    // const { checkedNodesPositions } = extra;
    // const pps = filterParentPosition(checkedNodesPositions.map(i => i.pos));
    // console.log(checkedNodesPositions.filter(i => pps.indexOf(i.pos) > -1).map(i => i.node.key));
    const cks = {
      checked: checkedKeys.checked || checkedKeys,
      halfChecked: [`0-0-${parseInt(Math.random() * 3, 10)}-key`],
    };
    this.setState({
      // checkedKeys,
      checkStrictlyKeys: cks,
      // checkStrictlyKeys: checkedKeys,
    });
  }
  onSelect = (selectedKeys, info) => {
    console.log('onSelect', selectedKeys, info);
    this.setState({
      selectedKeys,
    });
  }
  onRbSelect = (selectedKeys, info) => {
    let _selectedKeys = selectedKeys;
    if (info.selected) {
      _selectedKeys = getRadioSelectKeys(gData, selectedKeys, info.node.props.eventKey);
    }
    this.setState({
      selectedKeys: _selectedKeys,
    });
  }
  onClose = () => {
    this.setState({
      visible: false,
    });
  }
  handleOk = () => {
    this.setState({
      visible: false,
    });
  }
  showModal = () => {
    this.setState({
      expandedKeys: ['0-0-0-key', '0-0-1-key'],
      checkedKeys: ['0-0-0-key'],
      visible: true,
    });
    // simulate Ajax
    setTimeout(() => {
      this.setState({
        treeData: [...gData],
      });
    }, 2000);
  }
  triggerChecked = () => {
    this.setState({
      checkedKeys: [`0-0-${parseInt(Math.random() * 3, 10)}-key`],
    });
  }
  render() {
    const selectedKeys = getRadioSelectKeys(gData, this.state.selectedKeys)
    console.log(selectedKeys)
    // console.log(getRadioSelectKeys(gData, this.state.selectedKeys));
    return (<div style={{ padding: '0 20px' }}>
      <h2>dialog</h2>
      <button className="btn btn-primary" onClick={this.showModal}>show dialog</button>
      <Modal
        title="TestDemo" visible={this.state.visible}
        onOk={this.handleOk} onClose={this.onClose}
      >
        <div
          style={{
            height:50
          }}
        >
          {this.state.treeData.length ? (
            <Tree
              checkable className="dialog-tree"
              onExpand={this.onExpand} expandedKeys={this.state.expandedKeys}
              autoExpandParent={this.state.autoExpandParent}
              onCheck={this.onCheck} checkedKeys={this.state.checkedKeys}
              treeData={this.state.treeData}
            />
          ) : 'loading...'}
        </div>
      </Modal>

      <h2>controlled</h2>
      <div
        style={{
          height:50
        }}
      >
        <Tree
          checkable
          onExpand={this.onExpand} expandedKeys={this.state.expandedKeys}
          autoExpandParent={this.state.autoExpandParent}
          onCheck={this.onCheck} checkedKeys={this.state.checkedKeys}
          onSelect={this.onSelect} selectedKeys={this.state.selectedKeys}
          treeData={gData}
        />
      </div>
      <button onClick={this.triggerChecked}>trigger checked</button>

      <h2>checkStrictly</h2>
      <div
        style={{
          height:50
        }}
      >
        <Tree
          checkable multiple={this.props.multiple} defaultExpandAll
          onExpand={this.onExpand} expandedKeys={this.state.expandedKeys}
          onCheck={this.onCheckStrictly}
          checkedKeys={this.state.checkStrictlyKeys}
          checkStrictly
          treeData={gData}
        />
      </div>

      <h2>radio's behavior select (in the same level)</h2>
      <div
        style={{
          height:50
        }}
      >
        <Tree
          multiple defaultExpandAll
          onSelect={this.onRbSelect}
          selectedKeys={selectedKeys }
          treeData={gData}
        />
      </div>
    </div>);
  }
}

ReactDOM.render(<Demo />, document.getElementById('__react-content'));