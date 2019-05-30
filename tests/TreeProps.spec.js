import React from 'react';
import { render } from 'enzyme';
import PropTypes from 'prop-types';
import Tree from '..';

describe('Tree Props', () => {
  describe('custom switcher icon', () => {
    function switcherIcon(text, testLeaf) {
      const sfc = ({ isLeaf }) => {
        if (testLeaf) {
          return isLeaf ? <span>{text}</span> : null;
        }
        return isLeaf ? null : <span>{text}</span>;
      };

      sfc.propTypes = {
        isLeaf: PropTypes.bool,
      };

      return sfc;
    }
    it('switcher icon', () => {
      const wrapper = render(
        <Tree
          defaultExpandAll
          switcherIcon={switcherIcon('switcherIcon')}
          treeData={[{
          	key:"0-0"
          }, {
          	key:"0-1",
          	children: [{
          	  key:"0-1-0"
          	}, {
          	  key:"0-1-1"
          	}]
          }]}
        />
      );
      expect(wrapper).toMatchSnapshot();
    });
  });
})