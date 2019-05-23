/* eslint-disable no-undef, react/no-multi-comp, react/no-unused-state, react/prop-types, no-return-assign */
import React from 'react';
import { render, mount, shallow } from 'enzyme';
import { renderToJson } from 'enzyme-to-json';
import { TreeList as Tree, TreeNode} from '..';
import { List } from 'react-virtualized';

const OPEN_CLASSNAME = '.rc-tree-switcher_open';
const CHECKED_CLASSNAME = '.rc-tree-checkbox-checked';
const SELECTED_CLASSNAME = '.rc-tree-node-selected';
const SIZE = {
  height: 50,
  width: 500
}
const dom = document.createElement('div')
dom.style.height = "50px";
dom.style.width = "500px";
document.body.appendChild(dom);

describe('Tree Basic', () => {
  it('renders correctly', () => {
    const wrapper = render(
      <Tree
        {...SIZE}
        className="forTest"
        selectable
        checkable
        defaultExpandAll
        showIcon
        showLine
        multiple
        focusable
        treeData={[{
          key:"0-0",
          title: "parent 1",
          children: [{
            key: "0-0-0",
            title: "leaf 1",
            children: [{
              key: "random",
              title: "leaf"
            }, {
              title: "leaf"
            }]
          }, {
            key: "0-0-1",
            title: "leaf 2",
            disableCheckbox: true
          }]
        }]}
        onRowsRendered={({ overscanStartIndex, overscanStopIndex, startIndex, stopIndex })=>{
          console.log(overscanStartIndex)
          console.log(overscanStopIndex)
          console.log(startIndex)
          console.log(stopIndex)
        }}
      />
    );
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });
  describe('expanded', () => {
    it('expands all keys', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          defaultExpandAll
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1"
            }]
          }]}
        />
      );
      const switcher = wrapper.find('.rc-tree-switcher').first();
      expect(switcher.is(OPEN_CLASSNAME)).toBe(true);
    });
    it('expands default expanded keys', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          defaultExpandedKeys={['0-0']}
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1"
            }]
          }]}
        />
      );
      const switcher = wrapper.find('.rc-tree-switcher').first();
      expect(switcher.is(OPEN_CLASSNAME)).toBe(true);
    });
    it('controlled by expanded keys', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          expandedKeys={[]}
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1"
            }]
          }]}
        />
      );
      const getSwitcher = () => wrapper.find('.rc-tree-switcher').first();
      expect(getSwitcher().is(OPEN_CLASSNAME)).toBe(false);
      wrapper.setProps({ expandedKeys: ['0-0'] });
      expect(getSwitcher().is(OPEN_CLASSNAME)).toBe(true);
    });
    it('expands parent node when child node is expanded', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          expandedKeys={['0-0-0']}
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1",
              children: [{
                key: "0-0-0-0",
                title: "leaf"
              }]
            }]
          }]}
        />
      );

      const switcher = wrapper.find('.rc-tree-switcher').first();
      expect(switcher.is(OPEN_CLASSNAME)).toBe(true);
    });
    it('does not expand parent node when autoExpandParent is false', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          expandedKeys={['0-0-0']}
          defaultExpandParent={false}
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1",
              children: [{
                key: "0-0-0-0",
                title: "leaf"
              }]
            }]
          }]}
        />
      );
      const switcher = wrapper.find('.rc-tree-switcher').first();
      expect(switcher.is(OPEN_CLASSNAME)).toBe(false);
    });
    it('update to expand parent node with autoExpandParent', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          expandedKeys={['0-0-0']}
          defaultExpandParent={false}
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1",
              children: [{
                key: "0-0-0-0",
                title: "leaf"
              }]
            }]
          }]}
        />
      );
      let parentSwitcher = wrapper.find('.rc-tree-switcher').first();
      expect(parentSwitcher.is(OPEN_CLASSNAME)).toBe(false);

      wrapper.setProps({ autoExpandParent: true });

      parentSwitcher = wrapper.find('.rc-tree-switcher').first();
      const childSwitcher = wrapper.find('.rc-tree-switcher').at(1);
      expect(parentSwitcher.is(OPEN_CLASSNAME)).toBe(true);
      expect(childSwitcher.is(OPEN_CLASSNAME)).toBe(true);
    });
    it('fires expand event', () => {
      const handleExpand = jest.fn();
      const wrapper = mount(
        <Tree
          {...SIZE}
          onExpand={handleExpand}
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1"
            }]
          }]}
        />
      );
      const switcher = wrapper.find('.rc-tree-switcher');
      const node = wrapper.find(TreeNode).instance();

      switcher.simulate('click');
      expect(handleExpand).toBeCalledWith(['0-0'], {
        expanded: true,
        node,
        nativeEvent: expect.objectContaining({}),
      });

      switcher.simulate('click');
      expect(handleExpand).toBeCalledWith([], {
        expanded: false,
        node,
        nativeEvent: expect.objectContaining({}),
      });
    });
  })
  describe('check', () => {
    it('basic render', () => {
      const wrapper = render(
        <Tree
          {...SIZE}
          checkable
          defaultExpandAll
          treeData={[{
            key:"0-0",
            children: [{
              key: "0-0-0",
              disabled: true
            }, {
              key: "0-0-1"
            }]
          }]}
        />
      );
      expect(wrapper).toMatchSnapshot();
    });
    it('checks default checked keys', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          checkable
          defaultCheckedKeys={['0-0']}
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1"
            }]
          }]}
        />
      );
      wrapper.find('.rc-tree-switcher').simulate('click');
      wrapper.find('.rc-tree-checkbox').forEach((checkbox) => {
        expect(checkbox.is(CHECKED_CLASSNAME)).toBe(true);
      });
    });
    it('ignore disabled children when calculate parent\'s checked status', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          checkable
          defaultCheckedKeys={['0-0-0']}
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1",
              disableCheckbox: true
            }, {
              key: "0-0-1",
              title: "leaf 1"
            }]
          }]}
        />
      );
      const firstCheckboxClassNames = wrapper.find('.rc-tree-checkbox').instance().classList;
      expect([].slice.call(firstCheckboxClassNames).includes(CHECKED_CLASSNAME.slice(1)))
        .toBe(false);
    });
    it('controlled by checkedKeys', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          checkable
          checkedKeys={[]}
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1"
            }]
          }]}
        />
      );
      const getCheckbox = () => wrapper.find('.rc-tree-checkbox');
      expect(getCheckbox().is(CHECKED_CLASSNAME)).toBe(false);
      wrapper.setProps({ checkedKeys: ['0-0'] });
      expect(getCheckbox().is(CHECKED_CLASSNAME)).toBe(true);
    });
    it('trurns parent node to checked when all children are checked', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          checkable
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1"
            }, {
              key: "0-0-1",
              title: "leaf 2"
            }]
          }]}
        />
      );
      const checkboxs = wrapper.find('.rc-tree-checkbox')
      wrapper.find('.rc-tree-switcher').simulate('click');
      wrapper.find('.rc-tree-checkbox').at(1).simulate('click');
      wrapper.find('.rc-tree-checkbox').last().simulate('click');
      expect(
        wrapper.find('.rc-tree-checkbox').first().is(CHECKED_CLASSNAME)
      ).toBe(true);
    });
    it('turns parent node to half checked when child is checked', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          checkable
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1"
            }, {
              key: "0-0-1",
              title: "leaf 2"
            }]
          }]}
        />
      );
      wrapper.find('.rc-tree-switcher').simulate('click');
      wrapper.find('.rc-tree-checkbox').last().simulate('click');
      expect(
        wrapper.find('.rc-tree-checkbox').first().is('.rc-tree-checkbox-indeterminate')
      ).toBe(true);
    });
    it('turns parent node to checked if it is half checked', () => {
      const wrapper = mount(
        <Tree
          {...SIZE}
          checkable
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1"
            }, {
              key: "0-0-1",
              title: "leaf 2"
            }]
          }]}
        />
      );
      wrapper.find('.rc-tree-switcher').simulate('click');
      wrapper.find('.rc-tree-checkbox').last().simulate('click');
      wrapper.find('.rc-tree-checkbox').first().simulate('click');
      wrapper.find('.rc-tree-checkbox').forEach(checkbox => {
        expect(checkbox.is(CHECKED_CLASSNAME)).toBe(true);
      });
    });
    it('fires check event', () => {
      const handleCheck = /*(checkedObj, eventObj)=>{
        console.log(eventObj.node.props.title)
        expect(eventObj.node).toBeInstanceOf(TreeNode);
        if(count === 1){
          expect(eventObj.node).toEqual(treeElm1)
        } else {
          expect(eventObj.node).toEqual(treeElm2)
        }
      }*/
      jest.fn();
      const wrapper = mount(
        <Tree
          {...SIZE}
          checkable
          onCheck={handleCheck}
          treeData={[{
            key:"0-0",
            title: "parent 1",
            children: [{
              key: "0-0-0",
              title: "leaf 1"
            }]
          }]}
        />
      );
      //console.log('click switcher')
      wrapper.find('.rc-tree-switcher').simulate('click');
      //console.log(wrapper.html())
      const treeNode1 = wrapper.find(TreeNode).first();
      const treeNode2 = wrapper.find(TreeNode).last();
      const treeElm1 = treeNode1.instance();
      const treeElm2 = treeNode2.instance();

      wrapper.find('.rc-tree-checkbox').first().simulate('click');
      //console.log(wrapper.html())
      //点击第一个checkbox之后第二个checkbox就没了
      expect(handleCheck).toBeCalledWith(['0-0', '0-0-0'], {
        checked: true,
        event: 'check',
        halfCheckedKeys: [],
        checkedNodesPositions: [
          { pos: '0-0' },
          { pos: '0-0-0' },
        ],
        node: treeElm1,
        nativeEvent: expect.objectContaining({}),
      });
      //console.log(wrapper.instance())
      //expect(wrapper.find('.rc-tree-checkbox')).toHaveLength(2);
    });
  })
});
