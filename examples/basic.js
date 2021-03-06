/* eslint no-console:0 */
/* eslint no-alert:0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions:0 */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Tree, { TreeNode } from 'rc-vtree';
import 'rc-vtree/assets/index.less';
import './basic.less';

const treeData = [
  { key: '0-0', title: 'parent 1', children:
    [
      { key: '0-0-0', title: 'parent 1-1', children:
        [
          { key: '0-0-0-0', title: 'parent 1-1-0' },
        ],
      },
      { key: '0-0-1', title: 'parent 1-2', children:
          [
            { key: '0-0-1-0', title: 'parent 1-2-0', disableCheckbox: true },
            { key: '0-0-1-1', title: 'parent 1-2-1' },
          ],
      },
    ],
  },
];

class Demo extends React.Component {
  static propTypes = {
    keys: PropTypes.array,
  };

  static defaultProps = {
    keys: ['0-0-0'],
  };

  constructor(props) {
    super(props);
    const keys = props.keys;
    this.state = {
      defaultSelectedKeys: keys,
      defaultCheckedKeys: keys,
    };
  }

  onExpand = (expandedKeys) => {
    console.log('onExpand', expandedKeys);
  };

  onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
    this.selKey = info.node.props.eventKey;

    if (this.tree) {
      console.log(
        'Selected DOM node:',
        selectedKeys.map(key => ReactDOM.findDOMNode(this.tree.domTreeNodes[key])),
      );
    }
  };

  onCheck = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  };

  onEdit = () => {
    setTimeout(() => {
      console.log('current key: ', this.selKey);
    }, 0);
  };

  onDel = (e) => {
    if (!window.confirm('sure to delete?')) {
      return;
    }
    e.stopPropagation();
  };

  setTreeRef = (tree) => {
    this.tree = tree;
  };

  render() {
    const { defaultSelectedKeys, defaultCheckedKeys } = this.state
    return (
      <div style={{ margin: '0 20px' }}>

        <h2>Check on Click TreeNode</h2>
        <div
          style={{
            height:50
          }}
        >
          <Tree
            onExpand={this.onExpand}
            rowRenderer={(item)=>{
              return <TreeNode
                title={<span>{item.title}......</span>}
              />
            }}
            treeData={treeData}
          />
        </div>

        <h2>Check on Click TreeNode</h2>
        <div
          style={{
            height:50
          }}
        >
          <Tree
            className="myCls"
            showLine
            checkable
            selectable={ false }
            defaultExpandAll
            onExpand={this.onExpand}
            defaultSelectedKeys={defaultSelectedKeys}
            defaultCheckedKeys={defaultCheckedKeys}
            onSelect={this.onSelect}
            onCheck={this.onCheck}
            treeData={treeData}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('__react-content'));
