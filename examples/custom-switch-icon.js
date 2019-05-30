/* eslint no-console:0 */
/* eslint no-alert:0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions:0 */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Tree from 'rc-vtree';
import 'rc-vtree/assets/index.less';

const arrowPath = 'M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88' +
  '.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.' +
  '6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-0.7 5.' +
  '2-2L869 536.2c14.7-12.8 14.7-35.6 0-48.4z';

const treeData = [
  { key: '0-0', title: 'parent 1', children:
    [
      { key: '0-0-0', title: 'leaf', children:
        [
          { key: '0-0-0-0', title: 'leaf' },
          { key: '0-0-0-1', title: 'leaf' },
        ]
      },
      { key: '0-0-1', title: 'parent 1-1', children:
        [
          { key: '0-0-1-0', title: 'parent 1-1-0', disableCheckbox:true },
          { key: '0-0-1-1', title: 'parent 1-1-1' },
        ],
      },
      { key: '0-0-2', title: 'parent 1-2', children:
          [
            { key: '0-0-1-0', title: 'parent 1-2-0', disabled: true },
            { key: '0-0-1-1', title: 'parent 1-2-1' },
          ],
      },
      { key: '0-0-3', title: 'parent 1-3', children:
          [
            { key: '0-0-3-0', title: 'parent 1-3-0' },
            { key: '0-0-3-1', title: 'parent 1-3-1' },
          ],
      },
    ],
  },
];

const getSvgIcon = (path, iStyle = {}, style = {}) => {
  return (
    <i style={iStyle}>
      <svg
        viewBox="0 0 1024 1024"
        width="1em"
        height="1em"
        fill="currentColor"
        style={{ verticalAlign: '-.125em', ...style }}
      >
        <path d={path} />
      </svg>
    </i>
  );
}

class Demo extends React.Component {
  static propTypes = {
    keys: PropTypes.array,
  };

  static defaultProps = {
    keys: ['0-0-0-0'],
  };

  constructor(props) {
    super(props);
    const keys = props.keys;
    this.state = {
      defaultExpandedKeys: keys,
      defaultSelectedKeys: keys,
      defaultCheckedKeys: keys,
    };
  }

  render() {
    const {
      useIcon,
      defaultExpandedKeys,
      defaultSelectedKeys,
      defaultCheckedKeys
    } = this.state
    const switcherIcon = (obj) => {
      if (obj.isLeaf) {
        return getSvgIcon(arrowPath,
          { cursor: 'pointer', backgroundColor: 'white' },
          { transform: 'rotate(270deg)' });
      }
      return getSvgIcon(arrowPath,
        { cursor: 'pointer', backgroundColor: 'white' },
        { transform: `rotate(${obj.expanded ? 90 : 0}deg)` });
    };
    const treeCls = `myCls${useIcon && ' customIcon' || ''}`;

    return (
      <div id="demo" style={{ margin: '0 20px' }}>
        <h2>custom switch icon</h2>
        <Tree
          className={treeCls} showLine checkable defaultExpandAll
          defaultExpandedKeys={defaultExpandedKeys}
          defaultSelectedKeys={defaultSelectedKeys}
          defaultCheckedKeys={defaultCheckedKeys}
          switcherIcon={switcherIcon}
          treeData={treeData}
        />
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('__react-content'));
