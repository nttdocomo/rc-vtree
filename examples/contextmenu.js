/* eslint no-console:0 */
import 'rc-vtree/assets/index.less';
import React from 'react';
import ReactDOM from 'react-dom';
import Tree, { TreeNode } from 'rc-vtree';
import Tooltip from 'rc-tooltip';
import './contextmenu.less';

function contains(root, n) {
  let node = n;
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

const treeData = [{
  title: "parent 1",
  key: "0-1",
  children: [{
    title: "parent 1-0",
    key: "0-1-1",
    children: [{
      title: "leaf 0"
    }, {
      title: "leaf 1"
    }, {
      title: "leaf 2"
    }]
  }, {
    title: "parent 1-1",
    children: [{
      title: "leaf"
    }]
  }]
}]

class Demo extends React.Component {
  state = {
    selectedKeys: ['0-1', '0-1-1'],
  };
  componentDidMount() {
    this.getContainer();
    // console.log(ReactDOM.findDOMNode(this), this.cmContainer);
    console.log(contains(ReactDOM.findDOMNode(this), this.cmContainer));
  }
  componentWillUnmount() {
    if (this.cmContainer) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      document.body.removeChild(this.cmContainer);
      this.cmContainer = null;
    }
  }
  onSelect = (selectedKeys) => {
    this.setState({ selectedKeys });
  }
  onRightClick = (info) => {
    console.log('right click', info);
    this.setState({ selectedKeys: [info.node.props.eventKey] });
    this.renderCm(info);
  }
  onMouseEnter = (info) => {
    console.log('enter', info);
    this.renderCm(info);
  }
  onMouseLeave = (info) => {
    console.log('leave', info);
  }
  getContainer() {
    if (!this.cmContainer) {
      this.cmContainer = document.createElement('div');
      document.body.appendChild(this.cmContainer);
    }
    return this.cmContainer;
  }
  renderCm(info) {
    if (this.toolTip) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      this.toolTip = null;
    }
    this.toolTip = (
      <Tooltip
        trigger="click" placement="bottomRight" prefixCls="rc-tree-contextmenu"
        defaultVisible overlay={<h4>{info.node.props.title}</h4>}
      >
        <span />
      </Tooltip>
    );

    const container = this.getContainer();
    Object.assign(this.cmContainer.style, {
      position: 'absolute',
      left: `${info.event.pageX}px`,
      top: `${info.event.pageY}px`,
    });

    ReactDOM.render(this.toolTip, container);
  }
  render() {
    return (
      <div>
        <h2>right click contextmenu</h2>
        <div style={{
          height: 100
        }}>
          <Tree
            onRightClick={this.onRightClick}
            onSelect={this.onSelect}
            selectedKeys={this.state.selectedKeys}
            multiple
            defaultExpandAll
            showLine
            showIcon={false}
            treeData={treeData}
          />
        </div>
        <h2>hover popup contextmenu</h2>
        <div style={{
          height: 100
        }}>
          <Tree
            onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}
            onSelect={this.onSelect}
            multiple defaultExpandAll showLine
            treeData={treeData}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('__react-content'));
